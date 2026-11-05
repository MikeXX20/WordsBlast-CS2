# Baicizhan PDF Import Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Import Baicizhan PDF vocabulary via URL or file into a playable deck and downloadable word bank.
**Architecture:** Lazy-load a vendored PDF.js library, extract table cells by their coordinates, and feed editable TSV output through the existing vocabulary parser. Use a separate PDF UI controller so game and state logic stay in main.js.
**Tech Stack:** Browser JavaScript modules, PDF.js, Node test runner, Playwright.
**Spec:** ../specs/2026-11-05-baicizhan-import-design.md

## Global Constraints

- Preserve static hosting and bilingual UI.
- PDF extraction must not replace the current deck until explicit import.
- Preserve parts of speech and source ellipses; report unreadable/scanned PDFs.
- Link fetch failures must offer local upload; library errors must leave text import usable.

## Review Focus

- Wrapped long words must not acquire spaces; multiword phrases must keep their spaces.
- Short or empty final table columns must not drop rows.
- Invalid or failed PDF requests must not erase the existing deck or preview.
- A pending PDF extraction must not overwrite a newer user choice.
- The first column's words must never be paired with the second column's meanings.

### Task 1: PDF extraction and sample word bank

**Files:** src/pdf-import.js, src/pdf-import.test.js, vendor/pdfjs/.
**Interfaces:** extractVocabularyFromPages(pages) returns {text, title, rowCount, warnings}; readVocabularyPdf(bytes, onProgress) resolves the same result. Pages contain {width, items} with PDF.js TextItems.

- [x] Write failing tests for two-column pairing, cell wraps, ligatures, partial rows, scanned pages, and duplicate terms; run `node --test src/pdf-import.test.js` and confirm missing feature failure.
- [x] Implement coordinate reconstruction and PDF loading with cleanup and PDF validation, vendor the pinned library with license, run the new tests.
- [x] Run real sample extraction; inspect all 569 indices, selected difficult entries, and the final entry; use the supplied PDF only as a validation fixture.

### Task 2: Import controls and integration

**Files:** src/pdf-import-ui.js, index.html, src/main.js, src/i18n.js, src/styles.css, README.md.
**Interfaces:** setupPdfImport({t, tv, importBank, downloadBank}) wires DOM controls; refresh() localizes dynamic status. importBank(text, name) delegates to importVocabulary.

- [x] Add labeled PDF URL/file controls, editable named preview, count/warnings, download/import actions in English and Chinese.
- [x] Protect existing deck on load/parse errors; disable invalid preview actions and controls during extraction; reject malformed URLs and non-PDF input with clear messages.
- [x] Browser-test URL extraction, file extraction, edited preview, persisted deck, errors, language change and a game round. Run `npm test` and `git diff --check`.

### Task 3: Review and delivery

- [ ] Review the diff against the design and review-focus cases, address material findings and verify again.
- [ ] Commit and push the feature branch and create a draft pull request with validation evidence; do not merge or publish.
- [ ] Deliver the sample word bank and link the implementation PR.
