import { fetchVocabularyPdf, readVocabularyPdf } from './pdf-import.js';
import { parseVocabulary } from './parser.js';

export function setupPdfImport({ t, tv, importBank, downloadBank }) {
  const byId = id => document.getElementById(id);
  const els = Object.fromEntries(['pdfUrl', 'pdfLoadButton', 'pdfFile', 'pdfStatus', 'pdfPreviewPanel', 'pdfBankName', 'pdfPreview', 'pdfPreviewCount', 'pdfWarnings', 'pdfImportButton', 'pdfDownloadButton'].map(id => [id, byId(id)]));
  let busy = false;
  let status = { key: 'pdfIdle', values: {} };
  let warnings = [];

  function setStatus(key, values = {}) {
    status = { key, values };
    els.pdfStatus.textContent = tv(key, values);
  }

  function refreshPreview() {
    const parsed = parseVocabulary(els.pdfPreview.value);
    els.pdfPreviewCount.textContent = tv('pdfPreviewSummary', { cards: parsed.cards.length, errors: parsed.errors.length, duplicates: parsed.summary.duplicateCount });
    const invalid = busy || !parsed.cards.length || parsed.errors.length > 0;
    els.pdfImportButton.disabled = invalid;
    els.pdfDownloadButton.disabled = invalid;
    const notes = [];
    const truncated = warnings.filter(w => w.code === 'truncated').length;
    const skipped = warnings.filter(w => w.code !== 'truncated');
    if (truncated) notes.push(tv('pdfTruncated', { count: truncated }));
    if (skipped.length) notes.push(tv('pdfReviewWarnings', { count: skipped.length, rows: skipped.slice(0, 8).map(w => w.row ?? `p${w.page}`).join(', ') }));
    notes.push(...parsed.errors.slice(0, 5).map(error => tv('errorLine', error)));
    els.pdfWarnings.textContent = notes.join(' ');
  }

  function setBusy(value) {
    busy = value;
    for (const control of [els.pdfUrl, els.pdfLoadButton, els.pdfFile, els.pdfBankName, els.pdfPreview]) control.disabled = value;
    els.pdfPreviewPanel.setAttribute('aria-busy', String(value));
    refreshPreview();
  }

  async function extract(source, fallbackName) {
    if (busy) return;
    setBusy(true);
    setStatus('pdfLoading');
    try {
      const bytes = await source();
      const result = await readVocabularyPdf(bytes, (page, pages) => setStatus('pdfReading', { page, pages }));
      els.pdfPreview.value = result.text;
      els.pdfBankName.value = result.title || fallbackName || t('pdfDefaultName');
      warnings = result.warnings;
      els.pdfPreviewPanel.hidden = false;
      setStatus('pdfReady');
    } catch (error) {
      const known = ['pdfBadUrl', 'pdfFetchFailed', 'pdfInvalid', 'pdfNoText', 'pdfUnsupported', 'pdfTooLarge', 'pdfTooManyPages', 'pdfPassword', 'pdfLibraryFailed'];
      setStatus(known.includes(error.message) ? error.message : 'pdfReadFailed');
    } finally {
      setBusy(false);
      // Permit selecting the same file again after correcting or retrying it.
      els.pdfFile.value = '';
    }
  }

  function previewBank() {
    const result = parseVocabulary(els.pdfPreview.value);
    if (!result.cards.length || result.errors.length) { refreshPreview(); return null; }
    return {
      text: result.cards.map(card => `${card.term}\t${card.meaning}`).join('\n'),
      name: els.pdfBankName.value.trim() || t('pdfDefaultName'),
    };
  }

  els.pdfLoadButton.addEventListener('click', () => extract(() => fetchVocabularyPdf(els.pdfUrl.value)));
  els.pdfUrl.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); els.pdfLoadButton.click(); }
  });
  els.pdfFile.addEventListener('change', () => {
    const file = els.pdfFile.files[0];
    if (!file) return;
    extract(async () => {
      if (file.size > 50 * 1024 * 1024) throw new Error('pdfTooLarge');
      return new Uint8Array(await file.arrayBuffer());
    }, file.name.replace(/\.pdf$/i, ''));
  });
  els.pdfPreview.addEventListener('input', refreshPreview);
  els.pdfImportButton.addEventListener('click', () => {
    const bank = previewBank();
    if (bank && importBank(bank.text, bank.name)) setStatus('pdfImported', { name: bank.name });
  });
  els.pdfDownloadButton.addEventListener('click', () => {
    const bank = previewBank();
    if (!bank) return;
    const filename = bank.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 100) || 'baicizhan-word-bank';
    downloadBank(`${filename}.txt`, bank.text + '\n');
  });

  return {
    refresh() {
      setStatus(status.key, status.values);
      refreshPreview();
    },
  };
}
