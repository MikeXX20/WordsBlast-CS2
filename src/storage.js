import { isMastered, normalizeMasteryTarget } from "./progress.js";

const STORAGE_KEY = 'lite-vocab-blast:state:v1';

export function createDefaultState() {
  return {
    cards: [],
    bestScore: 0,
    lastDirection: 'term-to-meaning',
    audioEnabled: true,
    nightMode: false,
    musicMuted: false,
    correctSound: 'ak',
    language: 'en',
    dailyGoal: 12,
    streakCount: 0,
    lastPracticeDate: null,
    todayPracticeDate: null,
    todayAnswerCount: 0,
    masteryTarget: 3,
  };
}

export function loadState(storage = window.localStorage) {
  try {
    const rawState = storage.getItem(STORAGE_KEY);

    if (!rawState) {
      return createDefaultState();
    }

    const state = { ...createDefaultState(), ...JSON.parse(rawState) };
    state.masteryTarget = normalizeMasteryTarget(state.masteryTarget);
    state.cards = Array.isArray(state.cards)
      ? state.cards.map((card) => isMastered(card, state.masteryTarget) ? { ...card, mastered: true } : card)
      : [];

    return state;
  } catch {
    return createDefaultState();
  }
}

export function saveState(state, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
