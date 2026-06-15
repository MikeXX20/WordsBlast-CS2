import { parseVocabulary } from "./parser.js";
import { createGameAudio, soundForAnswer } from "./audio.js?v=audio-lifecycle";
import { answerCurrent, createSession, nextRound } from "./game.js";
import { getText, getTextWithVars, nextLanguage, normalizeLanguage } from "./i18n.js?v=real-match-comms";
import { MASTERY_CORRECT_COUNT, recordAnswer, summarizeProgress } from "./progress.js?v=real-match-comms";
import { createDefaultState, loadState, saveState } from "./storage.js?v=real-match-comms";

const els = {
  app: document.querySelector("#app"),
  languageButton: document.querySelector("#languageButton"),
  musicButton: document.querySelector("#musicButton"),
  importText: document.querySelector("#importText"),
  importButton: document.querySelector("#importButton"),
  demoDeckButton: document.querySelector("#demoDeckButton"),
  fpsBankButton: document.querySelector("#fpsBankButton"),
  cs2BankButton: document.querySelector("#cs2BankButton"),
  valorantBankButton: document.querySelector("#valorantBankButton"),
  cs2MatchBankButton: document.querySelector("#cs2MatchBankButton"),
  valorantMatchBankButton: document.querySelector("#valorantMatchBankButton"),
  clearButton: document.querySelector("#clearButton"),
  importSummary: document.querySelector("#importSummary"),
  importErrors: document.querySelector("#importErrors"),
  cardCount: document.querySelector("#cardCount"),
  masteredCount: document.querySelector("#masteredCount"),
  accuracy: document.querySelector("#accuracy"),
  streakCount: document.querySelector("#streakCount"),
  weakCount: document.querySelector("#weakCount"),
  bestScore: document.querySelector("#bestScore"),
  todayCount: document.querySelector("#todayCount"),
  dailyGoal: document.querySelector("#dailyGoal"),
  masteryPercent: document.querySelector("#masteryPercent"),
  goalProgress: document.querySelector("#goalProgress"),
  goalHint: document.querySelector("#goalHint"),
  reviewButton: document.querySelector("#reviewButton"),
  startButton: document.querySelector("#startButton"),
  soundButton: document.querySelector("#soundButton"),
  soundGameButton: document.querySelector("#soundGameButton"),
  blastSoundSelect: document.querySelector("#blastSoundSelect"),
  nightButton: document.querySelector("#nightButton"),
  nightGameButton: document.querySelector("#nightGameButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  score: document.querySelector("#score"),
  level: document.querySelector("#level"),
  lives: document.querySelector("#lives"),
  combo: document.querySelector("#combo"),
  prompt: document.querySelector("#prompt"),
  arena: document.querySelector("#arena"),
};

const DEFAULT_IMPORT_TEXT = "apple - 苹果\nbanana - 香蕉";
const DEMO_IMPORT_TEXT = [
  "economy - 经济",
  "strategy - 策略",
  "reaction - 反应",
  "accuracy - 准确率",
  "pressure - 压力",
  "objective - 目标",
  "coordinate - 协调",
  "discipline - 纪律",
  "utility - 道具",
  "momentum - 势头",
  "recover - 恢复",
  "flawless - 完美的",
].join("\n");
const PRESET_BANKS = {
  fps: "./word-banks/pro-fps-comms.txt",
  cs2: "./word-banks/cs2-map-callouts.txt",
  valorant: "./word-banks/valorant-map-callouts.txt",
  cs2Match: "./word-banks/cs2-real-match-comms.txt",
  valorantMatch: "./word-banks/valorant-real-match-comms.txt",
};

let state = loadState();
state = { ...state, language: normalizeLanguage(state.language) };
let session = null;
let currentRound = null;
let isPaused = false;
let blastLocked = false;
let frameId = null;
let masteredAudioPlayed = false;
let pageReady = false;
const audio = createGameAudio();
audio.setEnabled(state.audioEnabled);
audio.setMusicMuted(state.musicMuted);
audio.setCorrectSound(state.correctSound || "ak");

fillDefaultImportText();
renderLanguage();
renderProgress();
renderIdleGame();
renderSoundButtons();
renderTheme();
renderMusicButton();
setUiReady(false);
bootstrapAudio();

els.importButton.addEventListener("click", () => {
  audio.menu();
  importVocabulary(els.importText.value);
});

els.demoDeckButton.addEventListener("click", () => {
  audio.menu();
  els.importText.value = DEMO_IMPORT_TEXT;
  importVocabulary(DEMO_IMPORT_TEXT, { demo: true });
});
els.fpsBankButton.addEventListener("click", () => loadPresetBank("fps"));
els.cs2BankButton.addEventListener("click", () => loadPresetBank("cs2"));
els.valorantBankButton.addEventListener("click", () => loadPresetBank("valorant"));
els.cs2MatchBankButton.addEventListener("click", () => loadPresetBank("cs2Match"));
els.valorantMatchBankButton.addEventListener("click", () => loadPresetBank("valorantMatch"));

els.clearButton.addEventListener("click", () => {
  audio.menu();
  state = {
    ...createDefaultState(),
    audioEnabled: state.audioEnabled,
    language: state.language,
    musicMuted: state.musicMuted,
    nightMode: state.nightMode,
    dailyGoal: state.dailyGoal,
    streakCount: state.streakCount,
    lastPracticeDate: state.lastPracticeDate,
    todayPracticeDate: state.todayPracticeDate,
    todayAnswerCount: state.todayAnswerCount,
  };
  session = null;
  currentRound = null;
  persistState();
  els.importText.value = DEFAULT_IMPORT_TEXT;
  els.importSummary.textContent = t("deckCleared");
  renderImportErrors([]);
  renderProgress();
  renderIdleGame();
});

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", startGame);
els.reviewButton.addEventListener("click", copyReviewList);
els.languageButton.addEventListener("click", toggleLanguage);
els.soundButton.addEventListener("click", toggleSound);
els.soundGameButton.addEventListener("click", toggleSound);
els.musicButton.addEventListener("click", toggleMusic);
els.nightButton.addEventListener("click", toggleNightMode);
els.nightGameButton.addEventListener("click", toggleNightMode);
els.blastSoundSelect.addEventListener("change", onBlastSoundChange);
for (const directionInput of document.querySelectorAll("input[name='direction']")) {
  directionInput.addEventListener("change", () => audio.menu());
}
document.addEventListener("pointerdown", startPageMusicOnce, { once: true });
els.pauseButton.addEventListener("click", () => {
  if (!session) return;
  isPaused = !isPaused;
  renderPauseButton();
});

async function startGame() {
  if (!pageReady) return;
  if (state.cards.length === 0) {
    els.importSummary.textContent = t("pasteFirst");
    return;
  }

  const direction = document.querySelector("input[name='direction']:checked").value;
  state.lastDirection = direction;
  audio.start();
  audio.prepareMastered();
  session = createSession(state.cards, direction);
  masteredAudioPlayed = false;
  isPaused = false;
  blastLocked = true;
  renderPauseButton();
  els.app.classList.add("is-playing");
  els.prompt.textContent = t("chooseMode");
  els.arena.innerHTML = `<div class="empty-arena"></div>`;
  startAnimation();
  await audio.playRollThenWeaponDraw();
  blastLocked = false;
  showNextRound();
}

function showNextRound() {
  if (!session || session.lives <= 0) {
    endGame();
    return;
  }

  currentRound = nextRound(session);
  if (!currentRound) {
    endGame();
    return;
  }

  renderRound();
}

function renderRound() {
  if (!currentRound) {
    renderIdleGame();
    return;
  }

  renderHud();
  els.prompt.textContent = currentRound.prompt;
  els.arena.innerHTML = "";

  currentRound.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-bubble bubble-enter";
    button.textContent = choice;
    button.dataset.choice = choice;
    button.dataset.x = String(12 + (index * 23) % 68);
    button.dataset.y = String(14 + (index * 21) % 64);
    button.dataset.phase = String(index * 0.8);
    button.style.animationDelay = `${index * 90}ms`;
    button.style.left = `${button.dataset.x}%`;
    button.style.top = `${button.dataset.y}%`;
    button.addEventListener("click", () => chooseAnswer(choice, button));
    els.arena.append(button);
  });
}

function chooseAnswer(choice, button) {
  if (!session || !currentRound || isPaused || blastLocked) return;

  const cardId = currentRound.card.id;
  const isCorrect = choice.trim().toLocaleLowerCase() === currentRound.correctText.trim().toLocaleLowerCase();
  button.classList.add(isCorrect ? "correct-hit" : "wrong-hit");

  const updatedCards = state.cards.map((card) => card.id === cardId ? recordAnswer(card, isCorrect) : card);
  state = {
    ...state,
    cards: updatedCards,
  };
  markDailyPractice();
  session.cards = updatedCards;

  const result = answerCurrent(session, choice);
  state.bestScore = Math.max(state.bestScore, result.score);
  persistState();
  renderProgress();
  renderHud();
  playAnswerSound(isCorrect);
  playMasteredSoundIfComplete();

  window.setTimeout(() => {
    if (session.lives <= 0) {
      endGame();
      return;
    }
    showNextRound();
  }, 180);
}

function endGame() {
  els.app.classList.remove("is-playing");
  const allMastered = state.cards.length > 0 && state.cards.every((card) => Number(card.correctCount) >= 3);
  if (allMastered && !masteredAudioPlayed) {
    audio.mastered();
    masteredAudioPlayed = true;
  }
  els.prompt.textContent = allMastered ? t("allMastered") : session ? tv("sessionComplete", { score: session.score }) : t("chooseMode");
  els.arena.innerHTML = `<div class="empty-arena">${t("practiceAgain")}</div>`;
  renderHud();
  stopAnimation();
}

function renderIdleGame() {
  renderHud();
  els.prompt.textContent = state.cards.length ? t("chooseMode") : t("importToBegin");
  els.arena.innerHTML = `<div class="empty-arena">${t("answerBubbles")}</div>`;
}

function renderHud() {
  els.score.textContent = session?.score ?? 0;
  els.level.textContent = session?.level ?? 1;
  els.lives.textContent = session?.lives ?? 3;
  els.combo.textContent = session?.combo ?? 0;
}

function renderProgress() {
  const summary = summarizeProgress(state.cards, state.bestScore);
  const dailyGoal = Math.max(1, Number(state.dailyGoal) || 12);
  const today = getLocalDateKey();
  const todayCount = state.todayPracticeDate === today ? Number(state.todayAnswerCount) || 0 : 0;
  const goalPercent = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  els.cardCount.textContent = summary.cardCount;
  els.masteredCount.textContent = summary.masteredCount;
  els.accuracy.textContent = `${summary.accuracy}%`;
  els.streakCount.textContent = state.streakCount ?? 0;
  els.weakCount.textContent = summary.weakCount;
  els.bestScore.textContent = summary.bestScore;
  els.todayCount.textContent = todayCount;
  els.dailyGoal.textContent = dailyGoal;
  els.masteryPercent.textContent = `${summary.masteryPercent}%`;
  els.goalProgress.style.width = `${goalPercent}%`;
  els.goalHint.textContent = todayCount >= dailyGoal
    ? t("goalComplete")
    : tv("goalRemaining", { count: dailyGoal - todayCount });
  els.reviewButton.disabled = state.cards.length === 0;
}

function renderImportErrors(errors) {
  els.importErrors.innerHTML = "";
  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = tv("errorLine", {
      line: error.line,
      reason: error.reason,
      text: error.text,
    });
    els.importErrors.append(item);
  }
}

function persistState() {
  const result = saveState(state);
  if (!result.ok) {
    els.importSummary.textContent = tv("saveWarning", { reason: result.reason });
  }
}

function importVocabulary(text, options = {}) {
  const result = parseVocabulary(text);
  if (result.cards.length === 0) {
    els.importSummary.textContent = t("pasteFirst");
    renderImportErrors(result.errors);
    return;
  }

  state = { ...state, cards: result.cards };
  persistState();
  els.importSummary.textContent = options.demo
    ? tv("demoDeckLoaded", { cards: result.summary.cardCount })
    : options.bankName
      ? tv("presetBankLoaded", { name: t(`${options.bankName}BankName`), cards: result.summary.cardCount })
    : tv("importedSummary", {
      cards: result.summary.cardCount,
      blanks: result.summary.blankLineCount,
      duplicates: result.summary.duplicateCount,
    });
  renderImportErrors(result.errors);
  renderProgress();
  renderIdleGame();
}

async function loadPresetBank(bankName) {
  audio.menu();
  try {
    const response = await fetch(PRESET_BANKS[bankName], { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    els.importText.value = text.trim();
    importVocabulary(text, { bankName });
  } catch (error) {
    els.importSummary.textContent = tv("presetLoadFailed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

function fillDefaultImportText() {
  if (els.importText.value.trim()) return;
  els.importText.value = DEFAULT_IMPORT_TEXT;
}

function t(key) {
  return getText(state.language, key);
}

function tv(key, values) {
  return getTextWithVars(state.language, key, values);
}

function toggleLanguage() {
  audio.menu();
  state = { ...state, language: nextLanguage(state.language) };
  persistState();
  renderLanguage();
}

async function bootstrapAudio() {
  els.importSummary.textContent = t("loadingAudio");
  try {
    await audio.preloadAllAssets();
    const autoplayed = await audio.tryAutoPlayBackground();
    els.importSummary.textContent = autoplayed ? t("audioReady") : t("audioTapToEnable");
  } catch {
    els.importSummary.textContent = t("audioTapToEnable");
  } finally {
    pageReady = true;
    setUiReady(true);
    renderProgress();
  }
}

function renderLanguage() {
  document.documentElement.lang = state.language === "zh" ? "zh-Hans" : "en";
  document.title = t("appTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    if (element.tagName === "OPTION") {
      element.label = t(element.dataset.i18n);
      element.textContent = t(element.dataset.i18n);
      continue;
    }
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  }
  els.languageButton.textContent = t("languageButton");
  renderMusicButton();
  renderSoundButtons();
  renderTheme();
  renderPauseButton();
  renderBlastSound();
  renderProgress();
  if (!currentRound) {
    renderIdleGame();
  }
}

function onBlastSoundChange() {
  state = { ...state, correctSound: els.blastSoundSelect.value };
  audio.setCorrectSound(state.correctSound, { playDraw: true });
  persistState();
}

function renderBlastSound() {
  els.blastSoundSelect.value = state.correctSound || "ak";
}

function toggleSound() {
  audio.menu();
  state = { ...state, audioEnabled: !state.audioEnabled };
  audio.setEnabled(state.audioEnabled);
  persistState();
  renderSoundButtons();
  if (state.audioEnabled) {
    audio.start();
  }
}

function toggleMusic() {
  audio.menu();
  state = { ...state, musicMuted: !state.musicMuted };
  audio.setMusicMuted(state.musicMuted);
  persistState();
  renderMusicButton();
  if (!state.musicMuted) {
    audio.startBackgroundMusic();
  }
}

function startPageMusicOnce() {
  if (!state.musicMuted) {
    audio.startBackgroundMusic();
  }
}

function setUiReady(ready) {
  const controls = [
    els.importButton,
    els.demoDeckButton,
    els.fpsBankButton,
    els.cs2BankButton,
    els.valorantBankButton,
    els.cs2MatchBankButton,
    els.valorantMatchBankButton,
    els.clearButton,
    els.startButton,
    els.restartButton,
    els.reviewButton,
    els.soundButton,
    els.soundGameButton,
    els.musicButton,
    els.nightButton,
    els.nightGameButton,
    els.blastSoundSelect,
    els.pauseButton,
    els.languageButton,
  ];
  controls.forEach((el) => {
    if (!el) return;
    el.disabled = !ready;
  });
}

function renderMusicButton() {
  els.musicButton.textContent = state.musicMuted ? t("musicOff") : t("musicOn");
  els.musicButton.setAttribute("aria-pressed", String(!state.musicMuted));
}

function renderSoundButtons() {
  for (const button of [els.soundButton, els.soundGameButton]) {
    button.textContent = state.audioEnabled ? t("soundOn") : t("soundOff");
    button.setAttribute("aria-pressed", String(state.audioEnabled));
  }
}

function toggleNightMode() {
  audio.menu();
  state = { ...state, nightMode: !state.nightMode };
  persistState();
  renderTheme();
}

function renderTheme() {
  document.body.classList.toggle("night-mode", state.nightMode);
  for (const button of [els.nightButton, els.nightGameButton]) {
    button.textContent = state.nightMode ? t("nightOn") : t("nightOff");
    button.setAttribute("aria-pressed", String(state.nightMode));
  }
}

function renderPauseButton() {
  els.pauseButton.textContent = isPaused ? t("resumeButton") : t("pauseButton");
}

function playAnswerSound(isCorrect) {
  audio.shoot();
  const allMastered = state.cards.length > 0 && state.cards.every((card) => Number(card.correctCount) >= 3);
  const event = soundForAnswer({ isCorrect, allMastered });
  if (event === "mastered") return;
  if (event === "correct") audio.correct();
  else audio.wrong();
}

function playMasteredSoundIfComplete() {
  const allMastered = state.cards.length > 0 && state.cards.every((card) => Number(card.correctCount) >= 3);
  if (!allMastered || masteredAudioPlayed) return;
  audio.mastered();
  masteredAudioPlayed = true;
}

async function copyReviewList() {
  audio.menu();
  const reviewCards = getReviewCards(state.cards);
  if (reviewCards.length === 0) {
    els.importSummary.textContent = state.cards.length === 0 ? t("pasteFirst") : t("reviewListEmpty");
    return;
  }

  const text = reviewCards
    .map((card) => {
      const misses = Number(card.missCount);
      return `${card.term} - ${card.meaning}${misses > 0 ? ` (${tv("reviewMisses", { count: misses })})` : ""}`;
    })
    .join("\n");

  try {
    await navigator.clipboard.writeText(text);
    els.importSummary.textContent = tv("reviewListCopied", { count: reviewCards.length });
  } catch {
    downloadTextFile("wordsblast-review-list.txt", text);
    els.importSummary.textContent = tv("reviewListDownloaded", { count: reviewCards.length });
  }
}

function getReviewCards(cards) {
  return cards
    .filter((card) => Number(card.correctCount) < MASTERY_CORRECT_COUNT || Number(card.missCount) > 0)
    .sort((first, second) => {
      const missDifference = Number(second.missCount) - Number(first.missCount);
      if (missDifference) return missDifference;
      const correctDifference = Number(first.correctCount) - Number(second.correctCount);
      if (correctDifference) return correctDifference;
      return first.term.localeCompare(second.term);
    });
}

function downloadTextFile(filename, text) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function markDailyPractice() {
  const today = getLocalDateKey();
  const lastPracticeDate = state.lastPracticeDate;
  const todayAnswerCount = state.todayPracticeDate === today ? Number(state.todayAnswerCount) || 0 : 0;
  let streakCount = Number(state.streakCount) || 0;

  if (lastPracticeDate !== today) {
    streakCount = lastPracticeDate === getYesterdayDateKey() ? streakCount + 1 : 1;
  }

  state = {
    ...state,
    lastPracticeDate: today,
    todayPracticeDate: today,
    todayAnswerCount: todayAnswerCount + 1,
    streakCount,
  };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

function startAnimation() {
  stopAnimation();
  const tick = (time) => {
    if (currentRound && !isPaused) {
      for (const bubble of els.arena.querySelectorAll(".answer-bubble")) {
        const baseX = Number(bubble.dataset.x);
        const baseY = Number(bubble.dataset.y);
        const phase = Number(bubble.dataset.phase);
        const speed = currentRound.difficulty.speed;
        bubble.style.left = `${baseX}%`;
        bubble.style.top = `${baseY}%`;
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
