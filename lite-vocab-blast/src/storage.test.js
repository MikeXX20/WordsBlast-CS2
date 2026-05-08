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
      language: "en",
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
      language: "zh",
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
      language: "en",
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
});
