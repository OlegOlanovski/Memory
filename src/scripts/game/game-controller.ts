import {
  blueScoreElement,
  blueScoreIconElement,
  boardElement,
  cardBackByTheme,
  currentPlayerIconElement,
  currentPlayerNameElement,
  defaultPlayerIconMap,
  defaultTheme,
  gameRoot,
  gameoverBlueScoreIconElement,
  gameoverOrangeScoreIconElement,
  orangeScoreElement,
  orangeScoreIconElement,
  playerIconMapByTheme,
  runtime,
  statusElement,
  type GameStateSnapshot,
  type Player,
  winnerImageMapByTheme,
  winnerPawnMap,
} from "./game-shared";
import {
  createCards,
  getCardById,
  renderBoard,
  resolveClickedCard,
  syncCardElement,
} from "./game-board";
import { showGameOver } from "./game-over";
import {
  clearStoredGameState,
  parseBoardSize,
  persistGameState,
  readStoredGameState,
} from "./game-storage";

const exitGameTriggerElement = document.querySelector(
  "[data-exit-game-trigger]"
) as HTMLButtonElement | null;

const exitDialogElement = document.querySelector(
  "[data-exit-dialog]"
) as HTMLDialogElement | null;

const exitDialogCloseElement = document.querySelector(
  "[data-exit-dialog-close]"
) as HTMLButtonElement | null;

const exitDialogConfirmElement = document.querySelector(
  "[data-exit-dialog-confirm]"
) as HTMLButtonElement | null;

let lastFocusedElement: HTMLElement | null = null;

function applyStoredTheme() {
  const storedTheme = localStorage.getItem("theme") || defaultTheme;
  runtime.activeTheme = storedTheme;
  document.documentElement.setAttribute("data-theme", storedTheme);
  runtime.activeCardBackImage =
    cardBackByTheme[storedTheme] || cardBackByTheme[defaultTheme];

  document.documentElement.style.setProperty(
    "--memory-card-back-image",
    `url('${runtime.activeCardBackImage}')`
  );
}

function getInitialPlayer(): Player {
  const storedPlayer = localStorage.getItem("player");
  return storedPlayer === "Orange" ? "Orange" : "Blue";
}

function getPlayerIconsForTheme(theme: string): Record<Player, string> {
  return playerIconMapByTheme[theme] ?? defaultPlayerIconMap;
}

function getPlayerIcon(player: Player): string {
  const icons = getPlayerIconsForTheme(runtime.activeTheme);
  return icons[player] ?? defaultPlayerIconMap[player];
}

function getWinnerImage(player: Player): string {
  const images = winnerImageMapByTheme[runtime.activeTheme] ?? winnerPawnMap;
  return images[player] ?? winnerPawnMap[player];
}

function applyThemePlayerIcons() {
  const playerIcons = getPlayerIconsForTheme(runtime.activeTheme);

  if (blueScoreIconElement) {
    blueScoreIconElement.src = playerIcons.Blue;
    blueScoreIconElement.alt = "Blue marker";
  }

  if (orangeScoreIconElement) {
    orangeScoreIconElement.src = playerIcons.Orange;
    orangeScoreIconElement.alt = "Orange marker";
  }

  if (gameoverBlueScoreIconElement) {
    gameoverBlueScoreIconElement.src = playerIcons.Blue;
    gameoverBlueScoreIconElement.alt = "Blue";
  }

  if (gameoverOrangeScoreIconElement) {
    gameoverOrangeScoreIconElement.src = playerIcons.Orange;
    gameoverOrangeScoreIconElement.alt = "Orange";
  }
}

function updateHeaderState() {
  if (currentPlayerIconElement) {
    currentPlayerIconElement.src = getPlayerIcon(runtime.currentPlayer);
    currentPlayerIconElement.alt = `${runtime.currentPlayer} player icon`;
  }

  if (currentPlayerNameElement) {
    currentPlayerNameElement.textContent = runtime.currentPlayer;
  }

  if (blueScoreElement) {
    blueScoreElement.textContent = String(runtime.scores.Blue);
  }

  if (orangeScoreElement) {
    orangeScoreElement.textContent = String(runtime.scores.Orange);
  }
}

function updateStatus(text: string) {
  if (statusElement) {
    statusElement.textContent = text;
  }
}

function switchPlayer() {
  runtime.currentPlayer = runtime.currentPlayer === "Blue" ? "Orange" : "Blue";
  updateHeaderState();
}

function resetTurnState() {
  runtime.firstCardId = null;
  runtime.secondCardId = null;
  runtime.lockBoard = false;
}

function handleMatchedPair(firstCardId: number, secondCardId: number) {
  const firstCard = getCardById(firstCardId);
  const secondCard = getCardById(secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  firstCard.state = "matched";
  secondCard.state = "matched";
  runtime.scores[runtime.currentPlayer] += 1;
  runtime.matchedPairs += 1;

  syncCardElement(firstCard);
  syncCardElement(secondCard);
  updateHeaderState();
  updateStatus(`${runtime.currentPlayer} found a pair.`);

  runtime.lockBoard = false;
  runtime.firstCardId = null;
  runtime.secondCardId = null;

  if (runtime.matchedPairs === runtime.cards.length / 2) {
    showGameOver({
      clearStoredGameState,
      getPlayerIcon,
      getWinnerImage,
      persistGameState,
      winnerPawnMap,
    });
    return;
  }

  persistGameState();
}

function handleMismatch(firstCardId: number, secondCardId: number) {
  const firstCard = getCardById(firstCardId);
  const secondCard = getCardById(secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  updateStatus("No match. Switching player.");

  window.setTimeout(() => {
    firstCard.state = "hidden";
    secondCard.state = "hidden";
    syncCardElement(firstCard);
    syncCardElement(secondCard);

    runtime.firstCardId = null;
    runtime.secondCardId = null;
    runtime.lockBoard = false;
    switchPlayer();
    persistGameState();
  }, 700);
}

function evaluateTurn() {
  if (runtime.firstCardId === null || runtime.secondCardId === null) {
    return;
  }

  const firstCard = getCardById(runtime.firstCardId);
  const secondCard = getCardById(runtime.secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  if (firstCard.pairId === secondCard.pairId) {
    handleMatchedPair(runtime.firstCardId, runtime.secondCardId);
    return;
  }

  handleMismatch(runtime.firstCardId, runtime.secondCardId);
}

function onCardClick(event: Event) {
  if (runtime.lockBoard) {
    return;
  }

  const card = resolveClickedCard(event);

  if (!card) {
    return;
  }

  card.state = "revealed";
  syncCardElement(card);

  if (runtime.firstCardId === null) {
    runtime.firstCardId = card.id;
    updateStatus(`${runtime.currentPlayer} is on turn.`);
    persistGameState();
    return;
  }

  runtime.secondCardId = card.id;
  runtime.lockBoard = true;
  persistGameState();
  evaluateTurn();
}

function canRestoreGameState(
  storedGameState: GameStateSnapshot | null,
  boardSize: number
): storedGameState is GameStateSnapshot {
  return (
    storedGameState !== null &&
    storedGameState.theme === runtime.activeTheme &&
    storedGameState.boardSize === boardSize
  );
}

function restoreGameState(
  storedGameState: GameStateSnapshot,
  boardSize: number
) {
  runtime.currentPlayer = storedGameState.currentPlayer;
  runtime.cards = storedGameState.cards;
  runtime.scores.Blue = storedGameState.scores.Blue;
  runtime.scores.Orange = storedGameState.scores.Orange;
  runtime.matchedPairs = storedGameState.matchedPairs;

  resetTurnState();
  renderBoard(boardSize);
  updateHeaderState();
  updateStatus(
    storedGameState.statusText || `${runtime.currentPlayer} is on turn.`
  );
}

function startNewGame(boardSize: number) {
  runtime.currentPlayer = getInitialPlayer();
  runtime.cards = createCards(boardSize);
  runtime.matchedPairs = 0;
  runtime.scores.Blue = 0;
  runtime.scores.Orange = 0;

  resetTurnState();
  renderBoard(boardSize);
  updateHeaderState();
  updateStatus(`${runtime.currentPlayer} starts.`);
}

function openExitDialog() {
  if (!exitDialogElement) {
    return;
  }

  lastFocusedElement = document.activeElement as HTMLElement | null;
  exitDialogElement.showModal();
}

function closeExitDialog() {
  if (!exitDialogElement) {
    return;
  }

  exitDialogElement.close();
  lastFocusedElement?.focus();
}

function confirmExitGame() {
  window.removeEventListener("beforeunload", persistGameState);
  clearStoredGameState();
  window.location.href = "./settings.html";
}

function bindExitDialogListeners() {
  if (
    !exitGameTriggerElement ||
    !exitDialogElement ||
    !exitDialogCloseElement ||
    !exitDialogConfirmElement
  ) {
    return;
  }

  exitGameTriggerElement.addEventListener("click", openExitDialog);
  exitDialogCloseElement.addEventListener("click", closeExitDialog);
  exitDialogConfirmElement.addEventListener("click", confirmExitGame);

  exitDialogElement.addEventListener("click", (event) => {
    if (event.target === exitDialogElement) {
      closeExitDialog();
    }
  });

  exitDialogElement.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExitDialog();
  });
}

export function initGame() {
  if (!gameRoot || !boardElement) {
    return;
  }

  applyStoredTheme();
  applyThemePlayerIcons();

  const boardSize = parseBoardSize(localStorage.getItem("boardSize"));
  const storedGameState = readStoredGameState();

  if (canRestoreGameState(storedGameState, boardSize)) {
    restoreGameState(storedGameState, boardSize);
  } else {
    startNewGame(boardSize);
  }

  persistGameState();
  window.addEventListener("beforeunload", persistGameState);
  boardElement.addEventListener("click", onCardClick);
  bindExitDialogListeners();
}
