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
  };
}

export function loadState(storage = window.localStorage) {
  try {
    const rawState = storage.getItem(STORAGE_KEY);

    if (!rawState) {
      return createDefaultState();
    }

    return { ...createDefaultState(), ...JSON.parse(rawState) };
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
