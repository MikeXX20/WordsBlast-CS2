# Lite Vocabulary Blast Design

Date: 2026-05-07

## Goal

Build a lightweight offline vocabulary learning web app inspired by Quizlet's Blast mode. The app focuses on two jobs: importing vocabulary quickly and practicing it through a gentle shooting game that helps English learners memorize words without becoming too hard to control after higher levels.

The first version is intentionally small: no account system, no backend, no cloud sync, no images, no audio, and no folders. It should run well on low-spec devices and work from local browser storage.

## Product Shape

The app is a single-page offline web app. The first screen is the actual tool, not a marketing page.

It has three main areas:

- Import vocabulary
- Deck and progress summary
- Blast game

The app can later become a PWA, but the first version should avoid extra installation complexity.

## Vocabulary Import

Users can paste vocabulary directly into the app. The importer supports two primary sources:

- Simple pasted lines such as `apple - 苹果`, `apple: 苹果`, or `apple,苹果`
- Quizlet-style exported text, including tab-separated term/definition rows and repeated term-definition line pairs

The parser converts imported text into cards with:

- `id`
- `term`
- `meaning`
- `seenCount`
- `correctCount`
- `missCount`

Blank lines are ignored. If the same term appears more than once in one import, the first valid card is kept and later duplicates are skipped with an import summary. Invalid rows are shown in a preview/error list so the user can fix them.

Example import summary:

`Imported 42 cards. Skipped 3 empty lines. Found 2 duplicates.`

Version one supports one main term and one main meaning per card.

## Storage

The app is offline-first and browser-only.

It stores:

- Current deck
- Weak words
- Best score
- Accuracy/progress counters

No vocabulary or progress leaves the device. There is no login or account system in the first version.

If browser storage is unavailable or full, the app keeps the current deck in memory and warns that progress may not save.

## UI Structure

The app uses one compact screen.

On desktop or larger screens:

- The setup area appears on the left with import, deck status, progress, and mode selection.
- The Blast game appears in the main play area.

On mobile or narrow screens:

- The setup area stacks above the game.
- During play, setup controls collapse so the game remains focused and tap-friendly.

The UI avoids heavy decoration and large assets. It should prioritize readable text, clear controls, and stable game dimensions.

## Game Mode

The Blast game uses a Quizlet-like layout:

- One prompt is shown at the top or center.
- Several answer bubbles move in the play area.
- The player clicks or taps the correct bubble to blast it.
- The HUD shows score, level, lives, and combo.

Before starting, the user chooses a practice direction:

- Word to Meaning: show an English word and shoot the correct meaning/translation.
- Meaning to Word: show a meaning/translation and shoot the correct English word.

Mixed Mode is out of scope for version one. The interface can reserve space for it later, but the first build only needs Word to Meaning and Meaning to Word.

## Mistakes and Review

Wrong answers should support learning rather than only punish the player.

When the player chooses incorrectly:

- Lose one life.
- Increase the card's miss count.
- Add or reinforce the card in the weak-word pool.
- Repeat the missed card sooner in the session.

The session ends when lives reach zero. The user can restart quickly.

## Adaptive Difficulty

Difficulty adapts to the learner, but movement speed must stay gentle. This is a learning tool, so difficulty should not come from making cursor or tap control frustrating.

The game can become harder through:

- More answer options
- More similar distractors
- Shorter score bonus windows
- More frequent weak-word review
- Slightly stricter combo scoring

The game should ease pressure when accuracy drops.

After level 9, speed remains capped at a comfortable rate. Higher levels can still exist, but they should not create a wall that prevents continued practice.

## Scoring and Progress

The first version tracks:

- Accuracy
- Weak words
- Best score

Score should reward correct answers, streaks, and quick recognition, but learning progress is more important than arcade punishment.

## Data Flow

1. User pastes vocabulary.
2. Import parser converts text into normalized cards.
3. Cards and progress save to browser storage.
4. User selects direction and starts Blast.
5. Session engine selects a prompt card and answer choices.
6. Correct answers update score, streak, card counts, and accuracy.
7. Wrong answers cost a life and strengthen weak-word weighting.
8. End screen updates best score, accuracy, and weak-word list.

## Error Handling

The app should fail gently:

- Empty import: show `Paste vocabulary first.`
- Unparseable lines: list them in the import preview.
- Fewer than four cards: allow practice with fewer answer options.
- Storage failure: continue in memory and warn the user.
- Small viewport: reduce visual effects and preserve usable tap targets.
- Poor performance: lower animation effects before changing learning behavior.

## Testing

The first version should test the highest-risk areas:

- Parser tests for simple separators, Quizlet tab export, line-pair export, duplicates, blank lines, and invalid rows.
- Game logic tests for correct answers, wrong answers, lives, weak-word weighting, adaptive difficulty, and level 9+ speed cap.
- Storage tests for saving and loading deck, best score, accuracy, and weak words.
- Manual browser checks on desktop and small mobile viewport.

Acceptance criteria:

- A user can paste vocabulary and start playing without login.
- Both Word to Meaning and Meaning to Word modes work.
- Wrong answers cost lives and repeat weak words sooner.
- Accuracy, weak words, and best score persist in the browser.
- Level 9+ remains playable because speed stays gentle and difficulty shifts to learning pressure.

## Out of Scope for Version One

- User accounts
- Cloud sync
- Audio pronunciation
- Images
- Multiple decks/folders
- Multiplayer
- Heavy game engine
- Advanced analytics charts
