import { parseVocabulary } from "./parser.js";
import { createGameAudio, soundForAnswer } from "./audio.js";
import { answerCurrent, createSession, nextRound } from "./game.js";
import { getText, getTextWithVars, nextLanguage, normalizeLanguage } from "./i18n.js";
import { recordAnswer, summarizeProgress } from "./progress.js";
import { createDefaultState, loadState, saveState } from "./storage.js";

const els = {
  app: document.querySelector("#app"),
  languageButton: document.querySelector("#languageButton"),
  musicButton: document.querySelector("#musicButton"),
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
  soundButton: document.querySelector("#soundButton"),
  soundGameButton: document.querySelector("#soundGameButton"),
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

let state = loadState();
state = { ...state, language: normalizeLanguage(state.language) };
let session = null;
let currentRound = null;
let isPaused = false;
let frameId = null;
let masteredAudioPlayed = false;
const audio = createGameAudio();
audio.setEnabled(state.audioEnabled);
audio.setMusicMuted(state.musicMuted);

renderLanguage();
renderProgress();
renderIdleGame();
renderSoundButtons();
renderTheme();
renderMusicButton();

els.importButton.addEventListener("click", () => {
  audio.menu();
  const result = parseVocabulary(els.importText.value);
  if (result.cards.length === 0) {
    els.importSummary.textContent = t("pasteFirst");
    renderImportErrors(result.errors);
    return;
  }

  state = { ...state, cards: result.cards };
  persistState();
  els.importSummary.textContent = tv("importedSummary", {
    cards: result.summary.cardCount,
    blanks: result.summary.blankLineCount,
    duplicates: result.summary.duplicateCount,
  });
  renderImportErrors(result.errors);
  renderProgress();
  renderIdleGame();
});

els.clearButton.addEventListener("click", () => {
  audio.menu();
  state = {
    ...createDefaultState(),
    audioEnabled: state.audioEnabled,
    language: state.language,
    musicMuted: state.musicMuted,
    nightMode: state.nightMode,
  };
  session = null;
  currentRound = null;
  persistState();
  els.importText.value = "";
  els.importSummary.textContent = t("deckCleared");
  renderImportErrors([]);
  renderProgress();
  renderIdleGame();
});

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", startGame);
els.languageButton.addEventListener("click", toggleLanguage);
els.soundButton.addEventListener("click", toggleSound);
els.soundGameButton.addEventListener("click", toggleSound);
els.musicButton.addEventListener("click", toggleMusic);
els.nightButton.addEventListener("click", toggleNightMode);
els.nightGameButton.addEventListener("click", toggleNightMode);
for (const directionInput of document.querySelectorAll("input[name='direction']")) {
  directionInput.addEventListener("change", () => audio.menu());
}
document.addEventListener("pointerdown", startPageMusicOnce, { once: true });
els.pauseButton.addEventListener("click", () => {
  if (!session) return;
  isPaused = !isPaused;
  renderPauseButton();
});

function startGame() {
  if (state.cards.length === 0) {
    els.importSummary.textContent = t("pasteFirst");
    return;
  }

  const direction = document.querySelector("input[name='direction']:checked").value;
  state.lastDirection = direction;
  audio.roll();
  audio.start();
  audio.startBackgroundMusic();
  audio.prepareMastered();
  session = createSession(state.cards, direction);
  masteredAudioPlayed = false;
  isPaused = false;
  renderPauseButton();
  els.app.classList.add("is-playing");
  showNextRound();
  startAnimation();
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
    button.className = "answer-bubble";
    button.textContent = choice;
    button.dataset.choice = choice;
    button.dataset.x = String(12 + (index * 23) % 68);
    button.dataset.y = String(14 + (index * 21) % 64);
    button.dataset.phase = String(index * 0.8);
    button.style.left = `${button.dataset.x}%`;
    button.style.top = `${button.dataset.y}%`;
    button.addEventListener("click", () => chooseAnswer(choice, button));
    els.arena.append(button);
  });
}

function chooseAnswer(choice, button) {
  if (!session || !currentRound || isPaused) return;

  const cardId = currentRound.card.id;
  const isCorrect = choice.trim().toLocaleLowerCase() === currentRound.correctText.trim().toLocaleLowerCase();
  button.classList.add(isCorrect ? "correct-hit" : "wrong-hit");

  const updatedCards = state.cards.map((card) => card.id === cardId ? recordAnswer(card, isCorrect) : card);
  state = {
    ...state,
    cards: updatedCards,
  };
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
  els.cardCount.textContent = summary.cardCount;
  els.accuracy.textContent = `${summary.accuracy}%`;
  els.weakCount.textContent = summary.weakCount;
  els.bestScore.textContent = summary.bestScore;
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

function renderLanguage() {
  document.documentElement.lang = state.language === "zh" ? "zh-Hans" : "en";
  document.title = t("appTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
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
  if (!currentRound) {
    renderIdleGame();
  }
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
