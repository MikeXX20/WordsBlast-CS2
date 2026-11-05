# WordsBlast-CS2
Which make memorizing words funny
memorize words that can be created customizely, play the quizlet-like blast game, with cs2 audio!
let's roll!
# how to use? 
 1. import your vocabulary, like apple - a fruit
 2. click 'start blast' button
 3. click the corresponding words or meanings to blast
 4. DO PLAY THIS WITH AN EARPHONE!
# screenshots
<img width="2880" height="1616" alt="QQ_1778200219166" src="https://github.com/user-attachments/assets/39609189-5a87-4db3-8f70-cc0675b170f7" />
<img width="2880" height="1616" alt="QQ_1778200276205" src="https://github.com/user-attachments/assets/a45a66d0-5732-4282-8263-c6fc2339b2f7" />

# feature
 night mode supported
 Chinese supported

## Word retirement

Set **Correct answers before a word vanishes** to an integer from 1 to 20 (default: 3).
Correct answers accumulate across sessions; wrong answers do not reset them. Once a
word reaches the target, it stays retired from prompts, choices, and the review
list, even if you increase the target later. The target and progress are saved in
this browser. Importing or clearing a deck resets that deck's progress.

## Alipay support

The **Support with Alipay** button opens a bilingual dialog with the owner's
Alipay account and a copy button for manual transfers. An optional collection
link or QR image can be configured in `payment-config.js`. See
[Alipay setup](docs/alipay.md). This is voluntary support; automatic checkout
and payment verification require a backend.

## Development

Run `npm test` for the test suite, or `npm run dev` to preview locally.

# contact me
 Gmail: a2363996571@gmail.com

# donate me
 <img width="1708" height="2560" alt="IMG_1231" src="https://github.com/user-attachments/assets/025f201b-fec2-451b-a09f-b0673fbcbf2b" />


## Import a Baicizhan PDF word bank

Open **Import Baicizhan vocabulary PDF** (中文：**导入百词斩 PDF 词书**) under Import vocabulary:

1. Paste a Baicizhan PDF link and click **Read PDF link**, or choose a local `.pdf` file.
2. Review and edit the extracted words and definitions. Give the bank a name.
3. Click **Import word bank** to play, or **Download word bank** to save a reusable UTF-8 text file.

Importing replaces the current deck and resets that deck's word progress. Loading or previewing a PDF does not change the active deck. Invalid preview rows must be corrected before import. Duplicate terms are skipped. Ambiguous long-word wraps are flagged for review; correct any word boundaries in the preview before importing.

The importer supports Baicizhan **Classic Vocabulary List** exports with selectable text and numbered **No. / Word / Meaning** table columns, including two-column pages and wrapped phrases. Scanned PDFs require OCR first. Limits: 50 MB and 500 pages. If a PDF link fails because its host blocks browser access, download the PDF and upload the file instead. Uploaded PDFs are processed locally; the PDF.js library and worker are bundled with the app and loaded only when needed. Use a current browser that supports JavaScript modules and web workers.

The **Baicizhan favorites · 569** preset is a ready-to-play bank converted from the supplied sample. Source definitions ending in ellipses remain as printed in the PDF; review them if you need complete definitions. See [word-bank sources](word-banks/SOURCES.md).
