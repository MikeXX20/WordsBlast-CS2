// Baicizhan's Classic Vocabulary List: numbered Word/Meaning table columns.
// Use coordinates, not stream order: wrapped cells and columns can interleave.
const normalize = text => text.replace(/[ﬀﬁﬂﬃﬄﬅﬆ]/g, char => char.normalize('NFKC')).replace(/\u00a0/g, ' ');
const MAX_BYTES = 50 * 1024 * 1024;

export function validatePdfBytes(bytes) {
  if (bytes.byteLength > MAX_BYTES) throw new Error('pdfTooLarge');
  if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes('%PDF-')) throw new Error('pdfInvalid');
}

export function validatePdfUrl(value) {
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw new Error('pdfBadUrl');
  }
}

function cellLines(items) {
  const lines = [];
  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    let line = lines.find(line => Math.abs(line.y - item.y) < 2);
    if (!line) { line = { y: item.y, items: [] }; lines.push(line); }
    line.items.push(item);
  }
  return lines.map(line => {
    const parts = line.items.sort((a, b) => a.x - b.x);
    let text = '';
    let right = 0;
    for (const part of parts) {
      if (text && part.x - right > 1.5 && /[a-zA-Z0-9]$/.test(text) && /^[a-zA-Z0-9]/.test(part.str)) text += ' ';
      text += part.str;
      right = part.x + part.width;
    }
    return { text: text.trim(), right, height: parts[0].height };
  });
}

function joinCell(items, { term = false, rightEdge = Infinity, onAmbiguous = () => {} } = {}) {
  let text = '';
  let previous = null;
  for (const line of cellLines(items)) {
    if (previous) {
      // A word broken at the cell edge continues without a space. Phrases
      // wrapping at a word boundary keep their space. Chinese wraps need none.
      const possibleSplit = term && previous.right > rightEdge - previous.height * 1.8
        && /^[a-zA-Z]{10,}$/.test(text) && /^[a-z]+$/.test(line.text);
      const splitWord = possibleSplit && /^[b-hj-z]$/.test(line.text);
      if (possibleSplit && !splitWord) onAmbiguous();
      if (!splitWord && (term || (/[a-zA-Z0-9]$/.test(text) && /^[a-zA-Z0-9]/.test(line.text)))) text += ' ';
    }
    text += line.text;
    previous = line;
  }
  return text.trim();
}

export function extractVocabularyFromPages(pages) {
  const entries = [];
  const warnings = [];
  let title = '';
  let hasText = false;
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const items = pages[pageIndex].items.filter(item => item.str?.trim() && item.transform).map(item => ({
      str: normalize(item.str), x: item.transform[4], y: item.transform[5], width: item.width, height: item.height || Math.abs(item.transform[3]),
    }));
    hasText ||= items.length > 0;
    const titleLabel = items.find(item => /^Title:$/i.test(item.str.trim()));
    if (!title && titleLabel) title = items.filter(item => Math.abs(item.y - titleLabel.y) < 2 && item.x > titleLabel.x && !/^Date:|^\/$/.test(item.str.trim())).map(item => item.str).join(' ').trim();
    const headers = items.filter(item => {
      if (!/^No\.?$/i.test(item.str.trim())) return false;
      const aligned = items.filter(other => Math.abs(other.y - item.y) < 2 && other.x > item.x);
      const word = aligned.find(other => /^Word$/i.test(other.str.trim()));
      const meaning = aligned.find(other => /^Meaning$/i.test(other.str.trim()));
      return word && meaning && word.x < meaning.x;
    }).sort((a, b) => a.x - b.x);
    if (!headers.length) {
      warnings.push({ code: 'skippedPage', page: pageIndex + 1 });
      continue;
    }
    for (let column = 0; column < headers.length; column += 1) {
      const header = headers[column];
      const endX = headers[column + 1]?.x ?? pages[pageIndex].width;
      const headerItems = items.filter(item => Math.abs(item.y - header.y) < 2 && item.x > header.x && item.x < endX);
      const word = headerItems.find(item => /^Word$/i.test(item.str.trim()));
      const meaning = headerItems.find(item => /^Meaning$/i.test(item.str.trim()));
      if (!word || !meaning) continue;
      const numbers = items.filter(item => item.y < header.y - 3 && item.x >= header.x - 8 && item.x < word.x - 2 && /^\d+$/.test(item.str.trim())).sort((a, b) => b.y - a.y);
      for (let row = 0; row < numbers.length; row += 1) {
        const number = numbers[row];
        const top = row ? (numbers[row - 1].y + number.y) / 2 : header.y - 3;
        const bottom = row < numbers.length - 1 ? (number.y + numbers[row + 1].y) / 2
          : number.y - (row ? numbers[row - 1].y - number.y : header.y - number.y) / 2;
        const cells = items.filter(item => item.y < top && item.y > bottom && item.x >= word.x - 2 && item.x < endX - 2);
        const term = joinCell(cells.filter(item => item.x < meaning.x - 2), {
          term: true, rightEdge: meaning.x,
          onAmbiguous: () => warnings.push({ code: 'wrappedTerm', row: Number(number.str), page: pageIndex + 1 }),
        });
        const definition = joinCell(cells.filter(item => item.x >= meaning.x - 2));
        const entry = { row: Number(number.str), term, meaning: definition, page: pageIndex + 1 };
        if (!term || !definition) { warnings.push({ code: 'incomplete', row: entry.row, page: entry.page }); continue; }
        entries.push(entry);
      }
    }
  }
  if (!entries.length) throw new Error(hasText ? 'pdfUnsupported' : 'pdfNoText');
  entries.sort((a, b) => a.row - b.row);
  const seen = new Set();
  const rows = [];
  let lastNumber = 0;
  for (const entry of entries) {
    if (lastNumber && entry.row > lastNumber + 1) warnings.push({ code: 'gap', row: lastNumber + 1 });
    lastNumber = entry.row;
    const key = entry.term.toLocaleLowerCase();
    if (seen.has(key)) { warnings.push({ code: 'duplicate', row: entry.row }); continue; }
    seen.add(key);
    if (/…|\.{3}/.test(entry.meaning)) warnings.push({ code: 'truncated', row: entry.row });
    rows.push(`${entry.term}\t${entry.meaning}`);
  }
  return { text: rows.join('\n'), title, rowCount: entries.length, warnings };
}

let pdfLibrary;
async function loadPdfLibrary() {
  if (!pdfLibrary) {
    pdfLibrary = import('../vendor/pdfjs/pdf.min.mjs').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
      return pdfjs;
    }).catch(() => { pdfLibrary = null; throw new Error('pdfLibraryFailed'); });
  }
  return pdfLibrary;
}

export async function readVocabularyPdf(bytes, onProgress = () => {}) {
  validatePdfBytes(bytes);
  const pdfjs = await loadPdfLibrary();
  const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: true });
  try {
    const document = await task.promise;
    if (document.numPages > 500) throw new Error('pdfTooManyPages');
    const pages = [];
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const content = await page.getTextContent();
      pages.push({ width: page.getViewport({ scale: 1 }).width, items: content.items });
      page.cleanup();
      onProgress(index, document.numPages);
    }
    return extractVocabularyFromPages(pages);
  } catch (error) {
    if (error.name === 'PasswordException') throw new Error('pdfPassword');
    if (error.name === 'InvalidPDFException') throw new Error('pdfInvalid');
    throw error;
  } finally {
    await task.destroy();
  }
}

export async function fetchVocabularyPdf(url) {
  const validUrl = validatePdfUrl(url);
  let response;
  try { response = await fetch(validUrl, { signal: AbortSignal.timeout(30000) }); }
  catch { throw new Error('pdfFetchFailed'); }
  if (!response.ok) throw new Error('pdfFetchFailed');
  if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('pdfTooLarge');
  try {
    const bytes = new Uint8Array(await response.arrayBuffer());
    validatePdfBytes(bytes);
    return bytes;
  } catch (error) {
    if (['pdfTooLarge', 'pdfInvalid'].includes(error.message)) throw error;
    throw new Error('pdfFetchFailed');
  }
}
