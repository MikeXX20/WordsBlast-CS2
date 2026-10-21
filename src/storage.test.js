import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createDefaultState, loadState, saveState } from "./storage.js";

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
  };
}

describe('storage', () => {
  it('creates the default app state', () => {
    assert.deepEqual(createDefaultState(), {
      cards: [],
      bestScore: 0,
      lastDirection: 'term-to-meaning',
      audioEnabled: true,
      nightMode: false,
      musicMuted: false,
      correctSound: "ak",
      language: "en",
      dailyGoal: 12,
      streakCount: 0,
      lastPracticeDate: null,
      todayPracticeDate: null,
      todayAnswerCount: 0,
      masteryTarget: 3,
    });
  });

  it('returns default state when storage is empty', () => {
    assert.deepEqual(loadState(createMemoryStorage()), createDefaultState());
  });

  it('saves and loads state under a versioned key', () => {
    const storage = createMemoryStorage();
    const state = {
      cards: [{ id: '1', term: 'hola', seenCount: 2 }],
      bestScore: 8,
      lastDirection: 'meaning-to-term',
      audioEnabled: false,
      nightMode: true,
      musicMuted: true,
      correctSound: "ak",
      language: "zh",
      dailyGoal: 12,
      streakCount: 2,
      lastPracticeDate: "2026-06-15",
      todayPracticeDate: "2026-06-15",
      todayAnswerCount: 7,
      masteryTarget: 5,
    };

    assert.deepEqual(saveState(state, storage), { ok: true });
    assert.deepEqual(loadState(storage), state);
  });

  it("merges defaults into older saved state", () => {
    const storage = createMemoryStorage({
      "lite-vocab-blast:state:v1": JSON.stringify({
        cards: [],
        bestScore: 10,
        lastDirection: "meaning-to-term",
      }),
    });

    assert.deepEqual(loadState(storage), {
      cards: [],
      bestScore: 10,
      lastDirection: "meaning-to-term",
      audioEnabled: true,
      nightMode: false,
      musicMuted: false,
      correctSound: "ak",
      language: "en",
      dailyGoal: 12,
      streakCount: 0,
      lastPracticeDate: null,
      todayPracticeDate: null,
      todayAnswerCount: 0,
      masteryTarget: 3,
    });
  });

  it('returns default state when stored JSON is corrupt', () => {
    const storage = createMemoryStorage({
      'lite-vocab-blast:state:v1': '{not-json',
    });

    assert.deepEqual(loadState(storage), createDefaultState());
  });

  it('returns a failure result instead of throwing when save fails', () => {
    const storage = {
      setItem() {
        throw new Error('quota exceeded');
      },
    };

    assert.deepEqual(saveState(createDefaultState(), storage), {
      ok: false,
      reason: 'quota exceeded',
    });
  });

  it("falls back to three for invalid saved mastery targets", () => {
    for (const masteryTarget of [0, 21, 1.5, "5", null]) {
      const storage = createMemoryStorage({
        "lite-vocab-blast:state:v1": JSON.stringify({ masteryTarget }),
      });

      assert.equal(loadState(storage).masteryTarget, 3);
    }
  });

  it("migrates legacy cards at the previous default threshold to permanent retirement", () => {
    const storage = createMemoryStorage({
      "lite-vocab-blast:state:v1": JSON.stringify({
        cards: [
          { id: "retired", correctCount: 3, missCount: 2 },
          { id: "learning", correctCount: 2 },
        ],
      }),
    });

    const state = loadState(storage);
    assert.equal(state.masteryTarget, 3);
    assert.equal(state.cards[0].mastered, true);
    assert.notEqual(state.cards[1].mastered, true);

    saveState({ ...state, masteryTarget: 5 }, storage);
    assert.equal(loadState(storage).cards[0].mastered, true);
  });

  it("migrates legacy retirement against its saved target", () => {
    const storage = createMemoryStorage({
      "lite-vocab-blast:state:v1": JSON.stringify({
        masteryTarget: 5,
        cards: [
          { id: "retired", correctCount: 5 },
          { id: "learning", correctCount: 3 },
          { id: "already-retired", correctCount: 1, mastered: true },
        ],
      }),
    });

    const state = loadState(storage);

    assert.equal(state.cards[0].mastered, true);
    assert.notEqual(state.cards[1].mastered, true);
    assert.equal(state.cards[2].mastered, true);
  });

  it("preserves a one-answer retirement across visits and target increases", () => {
    const storage = createMemoryStorage();
    saveState({
      ...createDefaultState(),
      masteryTarget: 1,
      cards: [{ id: "retired", correctCount: 1 }],
    }, storage);
    const state = loadState(storage);

    assert.equal(state.cards[0].mastered, true);
    saveState({ ...state, masteryTarget: 20 }, storage);
    assert.equal(loadState(storage).cards[0].mastered, true);
  });
});
