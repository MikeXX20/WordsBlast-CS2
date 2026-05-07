# Lite Vocabulary Blast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a low-spec offline vocabulary Blast web app with paste/Quizlet import, two practice directions, gentle adaptive difficulty, weak-word review, and local progress tracking.

**Architecture:** Create a new `lite-vocab-blast` single-page app using small vanilla JavaScript modules. Keep parser, storage, progress, game logic, and UI orchestration separate so each part can be tested without loading the whole app.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Vite for local development, Vitest for logic tests, browser `localStorage` for offline persistence.

---

## File Structure

- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/package.json` defines scripts and dev dependencies.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/index.html` hosts the app shell.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js` wires UI events to app state.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/styles.css` contains all layout, responsive, and game styling.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.js` parses pasted vocabulary.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.js` saves and loads browser state.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.js` updates card and deck progress.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.js` owns session selection, scoring, lives, and adaptive difficulty.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.test.js` tests import parsing.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.test.js` tests persistence fallbacks.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.test.js` tests progress updates.
- `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.test.js` tests game behavior and gentle speed cap.

### Task 1: Project Scaffold

**Files:**
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/package.json`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/index.html`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/styles.css`

- [ ] **Step 1: Initialize git for the workspace**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git init
```

Expected: Git creates `.git/`.

- [ ] **Step 2: Create package metadata**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/package.json`:

```json
{
  "name": "lite-vocab-blast",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1"
  },
  "devDependencies": {
    "@vitejs/plugin-legacy": "^6.0.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 3: Create the HTML shell**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lite Vocabulary Blast</title>
  </head>
  <body>
    <main id="app" class="app">
      <section class="setup-panel" aria-label="Vocabulary setup">
        <header class="brand">
          <h1>Vocab Blast</h1>
          <p>Import words, choose a direction, and practice at a gentle pace.</p>
        </header>

        <section class="panel-section">
          <label for="importText">Import vocabulary</label>
          <textarea id="importText" rows="8" placeholder="apple - 苹果&#10;accelerate - speed up"></textarea>
          <div class="button-row">
            <button id="importButton" type="button">Import</button>
            <button id="clearButton" type="button" class="secondary">Clear</button>
          </div>
          <p id="importSummary" class="status" role="status"></p>
          <ul id="importErrors" class="error-list" aria-live="polite"></ul>
        </section>

        <section class="panel-section">
          <h2>Deck</h2>
          <dl class="stats">
            <div><dt>Cards</dt><dd id="cardCount">0</dd></div>
            <div><dt>Accuracy</dt><dd id="accuracy">0%</dd></div>
            <div><dt>Weak words</dt><dd id="weakCount">0</dd></div>
            <div><dt>Best score</dt><dd id="bestScore">0</dd></div>
          </dl>
        </section>

        <section class="panel-section">
          <h2>Mode</h2>
          <fieldset class="mode-field">
            <legend>Practice direction</legend>
            <label><input type="radio" name="direction" value="term-to-meaning" checked /> Word to Meaning</label>
            <label><input type="radio" name="direction" value="meaning-to-term" /> Meaning to Word</label>
          </fieldset>
          <button id="startButton" type="button" class="primary">Start Blast</button>
        </section>
      </section>

      <section class="game-panel" aria-label="Blast game">
        <div class="hud">
          <span>Score <strong id="score">0</strong></span>
          <span>Level <strong id="level">1</strong></span>
          <span>Lives <strong id="lives">3</strong></span>
          <span>Combo <strong id="combo">0</strong></span>
        </div>
        <div id="prompt" class="prompt">Import at least one card to begin.</div>
        <div id="arena" class="arena" aria-live="polite"></div>
        <div class="game-actions">
          <button id="pauseButton" type="button" class="secondary">Pause</button>
          <button id="restartButton" type="button" class="secondary">Restart</button>
        </div>
      </section>
    </main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Add starter styles**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/styles.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f7f9;
  --surface: #ffffff;
  --line: #d7dde5;
  --text: #17202a;
  --muted: #5d6b7a;
  --primary: #176f9f;
  --primary-strong: #0e5378;
  --danger: #b42318;
  --answer: #fef7e0;
  --answer-border: #e2b44b;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button, textarea, input { font: inherit; }

.app {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(260px, 360px) 1fr;
  gap: 16px;
  padding: 16px;
}

.setup-panel, .game-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 16px;
}

.brand h1 { margin: 0; font-size: 1.8rem; }
.brand p, .status { color: var(--muted); }

.panel-section { margin-top: 18px; }
.panel-section h2 { margin: 0 0 8px; font-size: 1rem; }

label, legend { font-weight: 700; }
textarea {
  width: 100%;
  margin-top: 8px;
  padding: 10px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 6px;
}

.button-row, .game-actions { display: flex; gap: 8px; margin-top: 10px; }
button {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  padding: 9px 12px;
  cursor: pointer;
}
.primary, button:not(.secondary) {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
button:hover { border-color: var(--primary-strong); }

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}
.stats div {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 8px;
}
.stats dt { color: var(--muted); font-size: .85rem; }
.stats dd { margin: 2px 0 0; font-weight: 800; }

.mode-field {
  border: 1px solid var(--line);
  border-radius: 6px;
  display: grid;
  gap: 8px;
  margin: 0 0 10px;
  padding: 10px;
}

.hud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}
.prompt {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 900;
}
.arena {
  position: relative;
  height: min(54vh, 480px);
  min-height: 280px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
}
.answer-bubble {
  position: absolute;
  min-width: 92px;
  max-width: 180px;
  min-height: 44px;
  background: var(--answer);
  border: 1px solid var(--answer-border);
  color: var(--text);
  box-shadow: 0 2px 5px rgba(0,0,0,.08);
}
.answer-bubble.correct-hit { background: #dcfce7; border-color: #16a34a; }
.answer-bubble.wrong-hit { background: #fee2e2; border-color: var(--danger); }

.error-list { color: var(--danger); padding-left: 1.2rem; }

@media (max-width: 760px) {
  .app { grid-template-columns: 1fr; padding: 10px; }
  .app.is-playing .setup-panel { display: none; }
  .arena { height: 52vh; min-height: 300px; }
  .hud { font-size: .92rem; }
}
```

- [ ] **Step 5: Add the JS entry file**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js`:

```js
import "./styles.css";

document.querySelector("#importSummary").textContent = "Paste vocabulary to create your first deck.";
```

- [ ] **Step 6: Install dependencies and verify scaffold**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm install
npm run build
```

Expected: `vite build` completes and creates `dist/`.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast docs/superpowers
git commit -m "chore: scaffold lite vocab blast app"
```

Expected: commit succeeds.

### Task 2: Import Parser

**Files:**
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.test.js`

- [ ] **Step 1: Write parser tests**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.test.js`:

```js
import { describe, expect, it } from "vitest";
import { parseVocabulary } from "./parser.js";

describe("parseVocabulary", () => {
  it("parses dash, colon, comma, and tab separated rows", () => {
    const result = parseVocabulary("apple - 苹果\nrun: 跑步\ncat,猫\nfast\t快速");
    expect(result.cards.map((card) => [card.term, card.meaning])).toEqual([
      ["apple", "苹果"],
      ["run", "跑步"],
      ["cat", "猫"],
      ["fast", "快速"]
    ]);
    expect(result.summary.imported).toBe(4);
    expect(result.errors).toEqual([]);
  });

  it("parses Quizlet-style term and definition line pairs", () => {
    const result = parseVocabulary("accelerate\nspeed up\n\nargue\nsay why you disagree");
    expect(result.cards.map((card) => [card.term, card.meaning])).toEqual([
      ["accelerate", "speed up"],
      ["argue", "say why you disagree"]
    ]);
  });

  it("skips blank lines and duplicate terms", () => {
    const result = parseVocabulary("\napple - fruit\napple - company\n\nbook - 书");
    expect(result.cards.map((card) => [card.term, card.meaning])).toEqual([
      ["apple", "fruit"],
      ["book", "书"]
    ]);
    expect(result.summary.blankLines).toBe(2);
    expect(result.summary.duplicates).toBe(1);
  });

  it("reports invalid lines without dropping valid cards", () => {
    const result = parseVocabulary("valid - ok\nlonely line\nsecond lonely line\nx");
    expect(result.cards.map((card) => card.term)).toEqual(["valid", "lonely line"]);
    expect(result.errors).toEqual([{ line: 4, text: "x", reason: "Missing meaning" }]);
  });
});
```

- [ ] **Step 2: Run parser tests to verify failure**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/parser.test.js
```

Expected: FAIL because `src/parser.js` does not exist.

- [ ] **Step 3: Implement parser**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/parser.js`:

```js
const SEPARATORS = ["\t", " - ", " – ", " — ", ":", ","];

export function parseVocabulary(text) {
  const rawLines = text.split(/\r?\n/);
  const summary = { imported: 0, blankLines: 0, duplicates: 0 };
  const errors = [];
  const cards = [];
  const seenTerms = new Set();

  const lines = rawLines.map((line, index) => ({
    line: index + 1,
    text: line.trim()
  }));

  const nonBlank = [];
  for (const line of lines) {
    if (!line.text) summary.blankLines += 1;
    else nonBlank.push(line);
  }

  let index = 0;
  while (index < nonBlank.length) {
    const current = nonBlank[index];
    const separated = splitSeparatedLine(current.text);

    if (separated) {
      addCard(separated.term, separated.meaning, current.line);
      index += 1;
      continue;
    }

    const next = nonBlank[index + 1];
    if (next && !splitSeparatedLine(next.text)) {
      addCard(current.text, next.text, current.line);
      index += 2;
      continue;
    }

    errors.push({ line: current.line, text: current.text, reason: "Missing meaning" });
    index += 1;
  }

  summary.imported = cards.length;
  return { cards, errors, summary };

  function addCard(term, meaning, sourceLine) {
    const cleanTerm = term.trim();
    const cleanMeaning = meaning.trim();
    if (!cleanTerm || !cleanMeaning) {
      errors.push({ line: sourceLine, text: `${term} ${meaning}`.trim(), reason: "Missing term or meaning" });
      return;
    }
    const key = cleanTerm.toLocaleLowerCase();
    if (seenTerms.has(key)) {
      summary.duplicates += 1;
      return;
    }
    seenTerms.add(key);
    cards.push({
      id: makeCardId(cleanTerm, cleanMeaning, cards.length),
      term: cleanTerm,
      meaning: cleanMeaning,
      seenCount: 0,
      correctCount: 0,
      missCount: 0
    });
  }
}

function splitSeparatedLine(line) {
  for (const separator of SEPARATORS) {
    const position = line.indexOf(separator);
    if (position > 0) {
      return {
        term: line.slice(0, position),
        meaning: line.slice(position + separator.length)
      };
    }
  }
  return null;
}

function makeCardId(term, meaning, index) {
  return `${slug(term)}-${slug(meaning)}-${index}`;
}

function slug(value) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "card";
}
```

- [ ] **Step 4: Run parser tests to verify pass**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/parser.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit parser**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast/src/parser.js lite-vocab-blast/src/parser.test.js
git commit -m "feat: add vocabulary import parser"
```

Expected: commit succeeds.

### Task 3: Storage and Progress

**Files:**
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.test.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.test.js`

- [ ] **Step 1: Write storage tests**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultState, loadState, saveState } from "./storage.js";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns default state when storage is empty", () => {
    expect(loadState(localStorage)).toEqual(createDefaultState());
  });

  it("saves and loads state", () => {
    const state = createDefaultState();
    state.cards = [{ id: "a", term: "apple", meaning: "苹果", seenCount: 0, correctCount: 0, missCount: 0 }];
    state.bestScore = 25;
    expect(saveState(state, localStorage)).toEqual({ ok: true });
    expect(loadState(localStorage)).toMatchObject({ bestScore: 25, cards: state.cards });
  });

  it("reports save failure without throwing", () => {
    const brokenStorage = { setItem: vi.fn(() => { throw new Error("full"); }), getItem: vi.fn() };
    expect(saveState(createDefaultState(), brokenStorage)).toEqual({ ok: false, reason: "full" });
  });
});
```

- [ ] **Step 2: Write progress tests**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.test.js`:

```js
import { describe, expect, it } from "vitest";
import { recordAnswer, summarizeProgress } from "./progress.js";

const card = { id: "a", term: "apple", meaning: "苹果", seenCount: 0, correctCount: 0, missCount: 0 };

describe("progress", () => {
  it("records correct answers", () => {
    const next = recordAnswer(card, true);
    expect(next).toMatchObject({ seenCount: 1, correctCount: 1, missCount: 0 });
  });

  it("records wrong answers as weak words", () => {
    const next = recordAnswer(card, false);
    expect(next).toMatchObject({ seenCount: 1, correctCount: 0, missCount: 1 });
  });

  it("summarizes accuracy and weak words", () => {
    const summary = summarizeProgress([
      { ...card, seenCount: 2, correctCount: 1, missCount: 1 },
      { id: "b", term: "book", meaning: "书", seenCount: 1, correctCount: 1, missCount: 0 }
    ], 90);
    expect(summary).toEqual({ cardCount: 2, accuracy: 67, weakCount: 1, bestScore: 90 });
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/storage.test.js src/progress.test.js
```

Expected: FAIL because modules are missing.

- [ ] **Step 4: Implement storage**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/storage.js`:

```js
const STORAGE_KEY = "lite-vocab-blast-state-v1";

export function createDefaultState() {
  return {
    cards: [],
    bestScore: 0,
    lastDirection: "term-to-meaning"
  };
}

export function loadState(storage = window.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return { ...createDefaultState(), ...JSON.parse(raw) };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}
```

- [ ] **Step 5: Implement progress**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/progress.js`:

```js
export function recordAnswer(card, isCorrect) {
  return {
    ...card,
    seenCount: card.seenCount + 1,
    correctCount: card.correctCount + (isCorrect ? 1 : 0),
    missCount: card.missCount + (isCorrect ? 0 : 1)
  };
}

export function summarizeProgress(cards, bestScore) {
  const seen = cards.reduce((total, card) => total + card.seenCount, 0);
  const correct = cards.reduce((total, card) => total + card.correctCount, 0);
  return {
    cardCount: cards.length,
    accuracy: seen === 0 ? 0 : Math.round((correct / seen) * 100),
    weakCount: cards.filter((card) => card.missCount > 0).length,
    bestScore
  };
}
```

- [ ] **Step 6: Run storage and progress tests**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/storage.test.js src/progress.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit storage and progress**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast/src/storage.js lite-vocab-blast/src/storage.test.js lite-vocab-blast/src/progress.js lite-vocab-blast/src/progress.test.js
git commit -m "feat: add offline storage and progress tracking"
```

Expected: commit succeeds.

### Task 4: Game Logic

**Files:**
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.js`
- Create: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.test.js`

- [ ] **Step 1: Write game tests**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.test.js`:

```js
import { describe, expect, it } from "vitest";
import { createSession, getDifficulty, answerCurrent, nextRound } from "./game.js";

const cards = [
  { id: "a", term: "accelerate", meaning: "speed up", seenCount: 0, correctCount: 0, missCount: 0 },
  { id: "b", term: "argue", meaning: "disagree with reasons", seenCount: 0, correctCount: 0, missCount: 0 },
  { id: "c", term: "leave", meaning: "go away", seenCount: 0, correctCount: 0, missCount: 0 },
  { id: "d", term: "run", meaning: "move fast", seenCount: 0, correctCount: 0, missCount: 0 },
  { id: "e", term: "bright", meaning: "full of light", seenCount: 0, correctCount: 0, missCount: 2 }
];

describe("game", () => {
  it("creates a term-to-meaning round", () => {
    const session = nextRound(createSession(cards, "term-to-meaning", () => 0));
    expect(session.current.prompt).toBe("accelerate");
    expect(session.current.correctText).toBe("speed up");
    expect(session.current.choices).toContain("speed up");
  });

  it("creates a meaning-to-term round", () => {
    const session = nextRound(createSession(cards, "meaning-to-term", () => 0));
    expect(session.current.prompt).toBe("speed up");
    expect(session.current.correctText).toBe("accelerate");
  });

  it("correct answers increase score and combo", () => {
    const session = nextRound(createSession(cards, "term-to-meaning", () => 0));
    const next = answerCurrent(session, "speed up");
    expect(next.score).toBe(120);
    expect(next.combo).toBe(1);
    expect(next.lives).toBe(3);
  });

  it("wrong answers cost one life and reset combo", () => {
    const session = nextRound(createSession(cards, "term-to-meaning", () => 0));
    const next = answerCurrent(session, "go away");
    expect(next.lives).toBe(2);
    expect(next.combo).toBe(0);
    expect(next.weakQueue).toEqual(["a"]);
  });

  it("caps movement speed after level 9", () => {
    expect(getDifficulty({ level: 12, recentAccuracy: 96 }).speed).toBeLessThanOrEqual(0.72);
  });
});
```

- [ ] **Step 2: Run game tests to verify failure**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/game.test.js
```

Expected: FAIL because `src/game.js` does not exist.

- [ ] **Step 3: Implement game logic**

Create `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/game.js`:

```js
export function createSession(cards, direction, random = Math.random) {
  return {
    cards,
    direction,
    random,
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    answered: 0,
    correct: 0,
    weakQueue: [],
    current: null
  };
}

export function nextRound(session) {
  if (session.lives <= 0 || session.cards.length === 0) return { ...session, current: null };
  const card = chooseCard(session);
  const difficulty = getDifficulty({
    level: session.level,
    recentAccuracy: session.answered === 0 ? 100 : Math.round((session.correct / session.answered) * 100)
  });
  const choices = buildChoices(session.cards, card, session.direction, difficulty.choiceCount, session.random);
  return {
    ...session,
    current: {
      cardId: card.id,
      prompt: session.direction === "term-to-meaning" ? card.term : card.meaning,
      correctText: session.direction === "term-to-meaning" ? card.meaning : card.term,
      choices,
      difficulty
    }
  };
}

export function answerCurrent(session, answerText) {
  if (!session.current) return session;
  const isCorrect = answerText === session.current.correctText;
  const answered = session.answered + 1;
  const correct = session.correct + (isCorrect ? 1 : 0);
  const combo = isCorrect ? session.combo + 1 : 0;
  const score = session.score + (isCorrect ? 100 + combo * 20 : 0);
  const level = Math.max(1, Math.floor(correct / 5) + 1);
  return {
    ...session,
    score,
    level,
    lives: session.lives - (isCorrect ? 0 : 1),
    combo,
    answered,
    correct,
    weakQueue: isCorrect ? session.weakQueue : [...session.weakQueue, session.current.cardId]
  };
}

export function getDifficulty({ level, recentAccuracy }) {
  const pressure = recentAccuracy >= 90 ? 1 : recentAccuracy >= 75 ? 0.75 : 0.45;
  const choiceCount = Math.min(6, 3 + Math.floor(level / 3) + (pressure === 1 ? 1 : 0));
  const speed = Math.min(0.72, 0.32 + Math.min(level, 9) * 0.035 + pressure * 0.06);
  return {
    choiceCount,
    speed: Number(speed.toFixed(2)),
    bonusMs: Math.max(2200, 5200 - level * 220 - pressure * 400)
  };
}

function chooseCard(session) {
  const weakId = session.weakQueue[0];
  if (weakId) {
    const weak = session.cards.find((card) => card.id === weakId);
    if (weak) return weak;
  }
  const weighted = session.cards.flatMap((card) => Array(1 + Math.min(card.missCount, 3)).fill(card));
  return weighted[Math.floor(session.random() * weighted.length)] || session.cards[0];
}

function buildChoices(cards, correctCard, direction, count, random) {
  const textFor = (card) => direction === "term-to-meaning" ? card.meaning : card.term;
  const correct = textFor(correctCard);
  const pool = cards
    .filter((card) => card.id !== correctCard.id)
    .map(textFor)
    .filter(Boolean);
  const shuffled = pool.sort(() => random() - 0.5).slice(0, Math.max(0, count - 1));
  return [correct, ...shuffled].sort(() => random() - 0.5);
}
```

- [ ] **Step 4: Run game tests**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test -- src/game.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit game logic**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast/src/game.js lite-vocab-blast/src/game.test.js
git commit -m "feat: add gentle adaptive blast game logic"
```

Expected: commit succeeds.

### Task 5: UI Integration

**Files:**
- Modify: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js`

- [ ] **Step 1: Replace main.js with app orchestration**

Replace `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js`:

```js
import "./styles.css";
import { parseVocabulary } from "./parser.js";
import { answerCurrent, createSession, nextRound } from "./game.js";
import { recordAnswer, summarizeProgress } from "./progress.js";
import { createDefaultState, loadState, saveState } from "./storage.js";

const els = {
  app: document.querySelector("#app"),
  importText: document.querySelector("#importText"),
  importButton: document.querySelector("#importButton"),
  clearButton: document.querySelector("#clearButton"),
  importSummary: document.querySelector("#importSummary"),
  importErrors: document.querySelector("#importErrors"),
  cardCount: document.querySelector("#cardCount"),
  accuracy: document.querySelector("#accuracy"),
  weakCount: document.querySelector("#weakCount"),
  bestScore: document.querySelector("#bestScore"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  score: document.querySelector("#score"),
  level: document.querySelector("#level"),
  lives: document.querySelector("#lives"),
  combo: document.querySelector("#combo"),
  prompt: document.querySelector("#prompt"),
  arena: document.querySelector("#arena")
};

let state = loadState();
let session = null;
let isPaused = false;
let frameId = null;

renderProgress();
renderIdleGame();

els.importButton.addEventListener("click", () => {
  const result = parseVocabulary(els.importText.value);
  if (result.cards.length === 0) {
    els.importSummary.textContent = "Paste vocabulary first.";
    renderImportErrors(result.errors);
    return;
  }
  state = { ...state, cards: result.cards };
  persistState();
  els.importSummary.textContent = `Imported ${result.summary.imported} cards. Skipped ${result.summary.blankLines} empty lines. Found ${result.summary.duplicates} duplicates.`;
  renderImportErrors(result.errors);
  renderProgress();
  renderIdleGame();
});

els.clearButton.addEventListener("click", () => {
  state = createDefaultState();
  session = null;
  persistState();
  els.importText.value = "";
  els.importSummary.textContent = "Deck cleared.";
  renderImportErrors([]);
  renderProgress();
  renderIdleGame();
});

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", startGame);
els.pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
  els.pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

function startGame() {
  if (state.cards.length === 0) {
    els.importSummary.textContent = "Paste vocabulary first.";
    return;
  }
  const direction = document.querySelector("input[name='direction']:checked").value;
  state.lastDirection = direction;
  session = nextRound(createSession(state.cards, direction));
  isPaused = false;
  els.pauseButton.textContent = "Pause";
  els.app.classList.add("is-playing");
  renderSession();
  startAnimation();
}

function renderSession() {
  if (!session || !session.current) {
    renderIdleGame();
    return;
  }
  els.score.textContent = session.score;
  els.level.textContent = session.level;
  els.lives.textContent = session.lives;
  els.combo.textContent = session.combo;
  els.prompt.textContent = session.current.prompt;
  els.arena.innerHTML = "";
  session.current.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-bubble";
    button.textContent = choice;
    button.dataset.choice = choice;
    button.dataset.x = String(12 + (index * 23) % 74);
    button.dataset.y = String(18 + (index * 19) % 68);
    button.dataset.phase = String(index * 0.7);
    button.style.left = `${button.dataset.x}%`;
    button.style.top = `${button.dataset.y}%`;
    button.addEventListener("click", () => chooseAnswer(choice, button));
    els.arena.append(button);
  });
}

function chooseAnswer(choice, button) {
  if (!session || !session.current || isPaused) return;
  const cardId = session.current.cardId;
  const isCorrect = choice === session.current.correctText;
  button.classList.add(isCorrect ? "correct-hit" : "wrong-hit");
  state = {
    ...state,
    cards: state.cards.map((card) => card.id === cardId ? recordAnswer(card, isCorrect) : card)
  };
  session = answerCurrent(session, choice);
  state.bestScore = Math.max(state.bestScore, session.score);
  persistState();
  renderProgress();

  window.setTimeout(() => {
    if (session.lives <= 0) {
      endGame();
      return;
    }
    session = nextRound(session);
    renderSession();
  }, 180);
}

function endGame() {
  els.app.classList.remove("is-playing");
  els.prompt.textContent = `Session complete. Score: ${session.score}`;
  els.arena.innerHTML = '<div class="empty-arena">Press Start Blast to practice again.</div>';
  renderHud();
  stopAnimation();
}

function renderIdleGame() {
  renderHud();
  els.prompt.textContent = state.cards.length ? "Choose a mode and start Blast." : "Import at least one card to begin.";
  els.arena.innerHTML = '<div class="empty-arena">Answer bubbles will appear here.</div>';
}

function renderHud() {
  els.score.textContent = session?.score ?? 0;
  els.level.textContent = session?.level ?? 1;
  els.lives.textContent = session?.lives ?? 3;
  els.combo.textContent = session?.combo ?? 0;
}

function renderProgress() {
  const summary = summarizeProgress(state.cards, state.bestScore);
  els.cardCount.textContent = summary.cardCount;
  els.accuracy.textContent = `${summary.accuracy}%`;
  els.weakCount.textContent = summary.weakCount;
  els.bestScore.textContent = summary.bestScore;
}

function renderImportErrors(errors) {
  els.importErrors.innerHTML = "";
  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = `Line ${error.line}: ${error.reason} (${error.text})`;
    els.importErrors.append(item);
  }
}

function persistState() {
  const result = saveState(state);
  if (!result.ok) {
    els.importSummary.textContent = `Progress may not save: ${result.reason}`;
  }
}

function startAnimation() {
  stopAnimation();
  const tick = (time) => {
    if (session?.current && !isPaused) {
      const speed = session.current.difficulty.speed;
      for (const bubble of els.arena.querySelectorAll(".answer-bubble")) {
        const baseX = Number(bubble.dataset.x);
        const baseY = Number(bubble.dataset.y);
        const phase = Number(bubble.dataset.phase);
        bubble.style.transform = `translate(${Math.sin(time / 900 + phase) * speed * 18}px, ${Math.cos(time / 1000 + phase) * speed * 14}px)`;
      }
    }
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);
}

function stopAnimation() {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = null;
}
```

- [ ] **Step 2: Add empty arena style**

Append to `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/styles.css`:

```css
.empty-arena {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  text-align: center;
  padding: 16px;
}
```

- [ ] **Step 3: Run full test suite and build**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test
npm run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 4: Commit UI integration**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast/src/main.js lite-vocab-blast/src/styles.css
git commit -m "feat: connect import progress and blast UI"
```

Expected: commit succeeds.

### Task 6: Browser Verification and Polish

**Files:**
- Modify if needed: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/styles.css`
- Modify if needed: `/Users/troyep/Documents/untitled folder/lite-vocab-blast/src/main.js`

- [ ] **Step 1: Start the local dev server**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm run dev -- --port 4173
```

Expected: Vite serves the app at `http://127.0.0.1:4173`.

- [ ] **Step 2: Manual desktop check**

Open `http://127.0.0.1:4173` and paste:

```text
accelerate - speed up
argue - disagree with reasons
leave - go away
run - move fast
bright - full of light
```

Expected:

- Import summary says `Imported 5 cards`.
- Deck card count changes to `5`.
- Start Blast shows a prompt and answer bubbles.
- Correct clicks increase score and combo.
- Wrong clicks reduce lives and increase weak-word count.

- [ ] **Step 3: Manual direction check**

Select `Meaning to Word`, start the game, and verify prompts are meanings like `speed up` while answer bubbles are English terms like `accelerate`.

Expected: the mode changes the prompt and answer direction.

- [ ] **Step 4: Manual low-card check**

Clear the deck, paste:

```text
apple - 苹果
book - 书
```

Expected: the game starts with two answer choices, not four, and no blocking error.

- [ ] **Step 5: Manual responsive check**

Resize browser width below 760px and start a game.

Expected:

- Setup panel hides while playing.
- Arena remains visible.
- Answer bubbles are large enough to tap.
- Text does not overlap.

- [ ] **Step 6: Verify tests and production build one last time**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder/lite-vocab-blast"
npm test
npm run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 7: Commit verification fixes**

Run:

```bash
cd "/Users/troyep/Documents/untitled folder"
git add lite-vocab-blast
git commit -m "fix: polish blast game browser behavior"
```

Expected: commit succeeds if files changed. If no files changed, run `git status --short` and skip this commit.
