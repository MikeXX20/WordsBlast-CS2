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
  arena: document.querySelector("#arena"),
};

let state = loadState();
let session = null;
let currentRound = null;
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
  els.importSummary.textContent = `Imported ${result.summary.cardCount} cards. Skipped ${result.summary.blankLineCount} empty lines. Found ${result.summary.duplicateCount} duplicates.`;
  renderImportErrors(result.errors);
  renderProgress();
  renderIdleGame();
});

els.clearButton.addEventListener("click", () => {
  state = createDefaultState();
  session = null;
  currentRound = null;
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
  if (!session) return;
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
  session = createSession(state.cards, direction);
  isPaused = false;
  els.pauseButton.textContent = "Pause";
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
  els.prompt.textContent = allMastered ? "All words mastered." : session ? `Session complete. Score: ${session.score}` : "Choose a mode and start Blast.";
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
