# Baicizhan PDF import

Add a clearly labeled **Import Baicizhan vocabulary PDF** section to WordsBlast-CS2, retaining its static JavaScript architecture and bilingual interface.

## Agreed approach

Support both a PDF URL and local PDF file upload. Extract in the browser and present an editable word-bank preview before importing. This was selected over upload-only, which is simpler but does not support the direct Baicizhan links supplied in the request. A server-based converter adds hosting and upload handling that this static app does not need.

## Behavior

1. Paste a Baicizhan PDF URL or select a PDF file. Show loading and actionable errors.
2. Use PDF.js to read selectable text, reconstruct numbered vocabulary rows across both table columns, join wrapped terms and meanings, and normalize letter ligatures such as “ﬂ” to “fl”. Exclude page titles, numbers, and column headings.
3. Show extracted word count and an editable preview using the existing term/meaning format. Keep Chinese definitions and parts of speech. Preserve any ellipses already present in the original PDF; do not invent missing text. Flag entries requiring review.
4. Allow a bank name, download as a UTF-8 word-bank text file, and explicit import into the game. A successful import replaces the active deck and resets its word progress, following existing app behavior. Failed extraction leaves the active deck intact.
5. Include a playable preset word bank converted from the supplied 14-page sample, with source attribution. Check entry numbering and extraction completeness against the PDF.

## Constraints and implementation choices

The supplied PDF has selectable text and permits cross-origin requests. Other links may block browser access; offer file upload as the fallback. Scanned PDFs without selectable text receive a clear unsupported-format message; OCR is outside this change. Process uploaded files locally in the browser. Reuse existing card parsing, storage, and game code. The PDF library must load only when needed so a failed load does not break text imports or gameplay.

## Validation

Verify the sample’s two-column layout, wrapped phrases and long words, ligatures, duplicate handling, malformed and empty files, URL errors, preview editing, and successful import into the game. Run the existing test suite and browser-check link and file import.

Sample: https://vol-v6.bczcdn.com/pdf2c/c199dd1758757cd9ab1f8952f6588b4a.pdf
