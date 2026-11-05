# Baicizhan PDF import validation

- Baseline: 72 tests passed.
- Final suite: 81 tests passed; no failures.
- Real sample: 14 pages, 569 extracted entries and unique playable cards; no missing rows or parse errors. This PDF is only a format example and test fixture; its vocabulary is not bundled.
- Chrome browser verification: local PDF upload, actual Baicizhan URL fetch, editable preview, named UTF-8 download, explicit import, localStorage persistence, English/Chinese controls, correct game answer and progress update.
- Failure checks: invalid URL, HTTP failure and invalid PDF preserve the active deck; network failure preserves the existing preview; failed PDF library load leaves text imports usable.
- Mobile check: 390px viewport with no horizontal overflow; preview and action buttons visually inspected.
- Fresh reviewer found two issues: vocabulary word “no” mistaken for header, and ambiguous long-word phrase wraps incorrectly joined. Both reproduced with failing tests and fixed; final suite 81/81. Ambiguous wraps preserve spaces and are flagged for review.
- `git diff --check` passed.

Library: PDF.js 5.6.205, vendored library and matching worker with Apache-2.0 license. OCR is outside this feature; scanned PDFs receive a clear message. Source ellipses are preserved.

## Scope correction

The supplied 569-entry PDF is a format example only. Removed its vocabulary file, preset button, preset wiring, and translations. The importer accepts the user's own PDF URL or upload and creates that PDF's bank. Chrome verification with a different 23-entry PDF produced exactly 23 cards, from “resonant” to “transient”, and confirmed no example preset is present. All 81 tests and the full import browser checks still pass.
