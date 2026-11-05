import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVocabularyFromPages, validatePdfBytes, validatePdfUrl } from './pdf-import.js';
import { parseVocabulary } from './parser.js';

const item = (str, x, y, width = str.length * 5) => ({ str, width, height: 10, transform: [10, 0, 0, 10, x, y] });
const headers = [item('No.', 40, 700), item('Word', 70, 700), item('Meaning', 170, 700), item('No.', 310, 700), item('Word', 340, 700), item('Meaning', 440, 700)];
const page = items => ({ width: 612, items: [...headers, ...items] });

test('pairs columns in numbered order independent of PDF text stream order', () => {
  const result = extractVocabularyFromPages([page([
    item('Title:', 40, 740), item('收藏的单词', 75, 740),
    item('2', 315, 670), item('flask', 340, 670), item('n. 烧瓶', 440, 670),
    item('1', 45, 670), item('inundate', 70, 670), item('v. 淹没', 170, 670),
    item('百词斩', 45, 20), item('- 1', 550, 20),
  ])]);
  assert.equal(result.text, 'inundate\tv. 淹没\nflask\tn. 烧瓶');
  assert.equal(result.title, '收藏的单词');
  assert.equal(result.rowCount, 2);
});

test('joins wrapped Chinese meanings and phrases, normalizes ligatures without replacing Chinese punctuation', () => {
  const result = extractVocabularyFromPages([page([
    item('1', 45, 670), item('ﬁnd fault', 70, 675), item('with', 70, 665),
    item('phr. 埋怨，', 170, 675), item('挑剔…', 170, 665),
    item('2', 45, 630), item('counterbalanc', 76, 635, 79), item('e', 70, 625),
    item('vt. 抵消；中和', 170, 630),
  ])]);
  assert.equal(result.text, 'find fault with\tphr. 埋怨，挑剔…\ncounterbalance\tvt. 抵消；中和');
  assert.ok(result.warnings.some(w => w.code === 'truncated'));
});

test('keeps the row whose number is vertically centered in a multi-line term', () => {
  const result = extractVocabularyFromPages([page([
    item('484', 45, 670), item('come to light', 70, 670), item('phr. 显露', 170, 670),
    item('485', 45, 630), item('be in two', 70, 640), item('minds about', 70, 630), item('sth.', 70, 620), item('adj. 犹豫不决', 170, 630),
    item('486', 45, 590), item('obnoxious', 70, 590), item('adj. 讨厌的', 170, 590),
  ])]);
  assert.equal(parseVocabulary(result.text).cards[1].term, 'be in two minds about sth.');
  assert.equal(result.rowCount, 3);
});

test('reports incomplete rows and duplicate terms without creating bogus cards', () => {
  const result = extractVocabularyFromPages([page([
    item('1', 45, 670), item('apple', 70, 670), item('n. 苹果', 170, 670),
    item('2', 45, 630), item('banana', 70, 630),
    item('3', 45, 590), item('Apple', 70, 590), item('n. 苹果', 170, 590),
  ])]);
  assert.equal(parseVocabulary(result.text).cards.length, 1);
  assert.ok(result.warnings.some(w => w.code === 'incomplete' && w.row === 2));
  assert.ok(result.warnings.some(w => w.code === 'duplicate'));
});

test('rejects scanned and unrelated PDFs rather than silently importing nothing', () => {
  assert.throws(() => extractVocabularyFromPages([{ width: 612, items: [] }]), /pdfNoText/);
  assert.throws(() => extractVocabularyFromPages([{ width: 612, items: [item('A different document', 70, 700)] }]), /pdfUnsupported/);
});

test('detects a missing numbered entry', () => {
  const result = extractVocabularyFromPages([page([
    item('1', 45, 670), item('apple', 70, 670), item('n. 苹果', 170, 670),
    item('3', 45, 630), item('pear', 70, 630), item('n. 梨', 170, 630),
  ])]);
  assert.ok(result.warnings.some(w => w.code === 'gap'));
});

test('rejects non-PDF bytes and invalid or credentialed URLs', () => {
  assert.throws(() => validatePdfBytes(new TextEncoder().encode('<html>Not a PDF</html>')), /pdfInvalid/);
  assert.doesNotThrow(() => validatePdfBytes(new TextEncoder().encode('%PDF-1.4\n')));
  for (const url of ['file:///tmp/test.pdf', 'javascript:alert(1)', 'https://a:b@example.com/a.pdf', 'bad']) {
    assert.throws(() => validatePdfUrl(url), /pdfBadUrl/);
  }
  assert.equal(validatePdfUrl(' https://vol-v6.bczcdn.com/sample.pdf '), 'https://vol-v6.bczcdn.com/sample.pdf');
});

test('does not mistake the vocabulary word no for a table header', () => {
  const result = extractVocabularyFromPages([page([
    item('1', 45, 670), item('no', 70, 670), item('adv. 不', 170, 670),
    item('2', 45, 630), item('apple', 70, 630), item('n. 苹果', 170, 630),
    item('3', 315, 670), item('pear', 340, 670), item('n. 梨', 440, 670),
  ])]);
  assert.equal(result.text, 'no\tadv. 不\napple\tn. 苹果\npear\tn. 梨');
  assert.equal(result.rowCount, 3);
});

test('preserves ambiguous wrapped phrase boundaries and flags them for review', () => {
  const result = extractVocabularyFromPages([page([
    item('1', 45, 670), item('counterbalance', 70, 675, 85), item('with', 70, 665), item('v. 抵消', 170, 670),
    item('2', 45, 630), item('investigate', 70, 635, 85), item('a', 70, 625), item('v. 调查', 170, 630),
  ])]);
  assert.equal(result.text, 'counterbalance with\tv. 抵消\ninvestigate a\tv. 调查');
  assert.ok(result.warnings.some(w => w.code === 'wrappedTerm' && w.row === 1));
});
