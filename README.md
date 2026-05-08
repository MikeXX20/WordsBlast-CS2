# WordsBlast-CS2

Lightweight offline vocabulary practice game inspired by Quizlet Blast mode, optimized for low-spec devices.

## Features

- Import vocabulary with simple format like `apple - 苹果`
- Two practice directions:
  - Word -> Meaning
  - Meaning -> Word
- Gentle bubble movement for learning-friendly control
- Mastery logic: words stop appearing after enough correct answers
- Weapon audio mode:
  - AK / Deagle draw + shot layering with headshot sound
- Background music + sound toggles
- Night mode + Chinese/English UI

## Run Locally

Open in browser directly:

- `index.html`

or with a local server (recommended):

```bash
npx vite
```

Then open the shown local URL.

## Audio Assets

Project uses local audio files under:

- `assets/audio/`

Weapon files currently expected:

- `assets/audio/weapon-ak-draw.wav`
- `assets/audio/weapon-ak-shot.wav`
- `assets/audio/weapon-deagle-draw.wav`
- `assets/audio/weapon-deagle-shot.wav`

## Test

```bash
node --test src/*.test.js
```
