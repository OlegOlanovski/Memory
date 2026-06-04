import {
  BLUE_SCORE_ELEMENT,
  BLUE_SCORE_ICON_ELEMENT,
  BOARD_ELEMENT,
  CARD_BACK_BY_THEME,
  CURRENT_PLAYER_ICON_ELEMENT,
  DEFAULT_PLAYER_ICON_MAP,
  DEFAULT_THEME,
  GAME_ROOT,
  GAMEOVER_BLUE_SCORE_ICON_ELEMENT,
  GAMEOVER_ORANGE_SCORE_ICON_ELEMENT,
  ORANGE_SCORE_ELEMENT,
  ORANGE_SCORE_ICON_ELEMENT,
  PLAYER_ICON_MAP_BY_THEME,
  RUNTIME,
  type CardModel,
  type GameStateSnapshot,
  type Player,
  WINNER_IMAGE_MAP_BY_THEME,
  WINNER_PAWN_MAP,
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

const EXIT_GAME_TRIGGER_ELEMENT = document.querySelector(
  "[data-exit-game-trigger]"
) as HTMLButtonElement | null;

const EXIT_DIALOG_ELEMENT = document.querySelector(
  "[data-exit-dialog]"
) as HTMLDialogElement | null;

const EXIT_DIALOG_CLOSE_ELEMENT = document.querySelector(
  "[data-exit-dialog-close]"
) as HTMLButtonElement | null;

const EXIT_DIALOG_CONFIRM_ELEMENT = document.querySelector(
  "[data-exit-dialog-confirm]"
) as HTMLButtonElement | null;

let lastFocusedElement: HTMLElement | null = null;

interface TurnCards {
  firstCard: CardModel;
  secondCard: CardModel;
}

function applyStoredTheme(): void {
  const storedTheme = localStorage.getItem("theme") || DEFAULT_THEME;
  RUNTIME.activeTheme = storedTheme;
  document.documentElement.setAttribute("data-theme", storedTheme);
  RUNTIME.activeCardBackImage =
    CARD_BACK_BY_THEME[storedTheme] || CARD_BACK_BY_THEME[DEFAULT_THEME];

  document.documentElement.style.setProperty(
    "--memory-card-back-image",
    `url('${RUNTIME.activeCardBackImage}')`
  );
}

function getInitialPlayer(): Player {
  const storedPlayer = localStorage.getItem("player");
  return storedPlayer === "Orange" ? "Orange" : "Blue";
}

function getPlayerIconsForTheme(theme: string): Record<Player, string> {
  return PLAYER_ICON_MAP_BY_THEME[theme] ?? DEFAULT_PLAYER_ICON_MAP;
}

function getPlayerIcon(player: Player): string {
  const icons = getPlayerIconsForTheme(RUNTIME.activeTheme);
  return icons[player] ?? DEFAULT_PLAYER_ICON_MAP[player];
}

function getWinnerImage(player: Player): string {
  const images = WINNER_IMAGE_MAP_BY_THEME[RUNTIME.activeTheme] ?? WINNER_PAWN_MAP;
  return images[player] ?? WINNER_PAWN_MAP[player];
}

function applyThemePlayerIcons(): void {
  const playerIcons = getPlayerIconsForTheme(RUNTIME.activeTheme);

  if (BLUE_SCORE_ICON_ELEMENT) {
    BLUE_SCORE_ICON_ELEMENT.src = playerIcons.Blue;
    BLUE_SCORE_ICON_ELEMENT.alt = "Blue marker";
  }

  if (ORANGE_SCORE_ICON_ELEMENT) {
    ORANGE_SCORE_ICON_ELEMENT.src = playerIcons.Orange;
    ORANGE_SCORE_ICON_ELEMENT.alt = "Orange marker";
  }

  if (GAMEOVER_BLUE_SCORE_ICON_ELEMENT) {
    GAMEOVER_BLUE_SCORE_ICON_ELEMENT.src = playerIcons.Blue;
    GAMEOVER_BLUE_SCORE_ICON_ELEMENT.alt = "Blue";
  }

  if (GAMEOVER_ORANGE_SCORE_ICON_ELEMENT) {
    GAMEOVER_ORANGE_SCORE_ICON_ELEMENT.src = playerIcons.Orange;
    GAMEOVER_ORANGE_SCORE_ICON_ELEMENT.alt = "Orange";
  }
}

function updateHeaderState(): void {
  if (CURRENT_PLAYER_ICON_ELEMENT) {
    CURRENT_PLAYER_ICON_ELEMENT.src = getPlayerIcon(RUNTIME.currentPlayer);
    CURRENT_PLAYER_ICON_ELEMENT.alt = `${RUNTIME.currentPlayer} player icon`;
  }

  if (BLUE_SCORE_ELEMENT) {
    BLUE_SCORE_ELEMENT.textContent = String(RUNTIME.scores.Blue);
  }

  if (ORANGE_SCORE_ELEMENT) {
    ORANGE_SCORE_ELEMENT.textContent = String(RUNTIME.scores.Orange);
  }
}

function switchPlayer(): void {
  RUNTIME.currentPlayer = RUNTIME.currentPlayer === "Blue" ? "Orange" : "Blue";
  updateHeaderState();
}

function resetTurnState(): void {
  RUNTIME.firstCardId = null;
  RUNTIME.secondCardId = null;
  RUNTIME.lockBoard = false;
}

function finalizeMatchedTurn(firstCard: CardModel, secondCard: CardModel): void {
  firstCard.state = "matched";
  secondCard.state = "matched";
  RUNTIME.scores[RUNTIME.currentPlayer] += 1;
  RUNTIME.matchedPairs += 1;
  syncCardElement(firstCard);
  syncCardElement(secondCard);
  updateHeaderState();
  resetTurnState();
}

function shouldShowGameOver(): boolean {
  return RUNTIME.matchedPairs === RUNTIME.cards.length / 2;
}

function showMatchedGameOver(): void {
  showGameOver({
    clearStoredGameState,
    getPlayerIcon,
    getWinnerImage,
    persistGameState,
    winnerPawnMap: WINNER_PAWN_MAP,
  });
}

function hideCards(firstCard: CardModel, secondCard: CardModel): void {
  firstCard.state = "hidden";
  secondCard.state = "hidden";
  syncCardElement(firstCard);
  syncCardElement(secondCard);
}

function finalizeMismatchTurn(firstCard: CardModel, secondCard: CardModel): void {
  hideCards(firstCard, secondCard);
  resetTurnState();
  switchPlayer();
  persistGameState();
}

function handleMatchedPair(firstCardId: number, secondCardId: number): void {
  const firstCard = getCardById(firstCardId);
  const secondCard = getCardById(secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  finalizeMatchedTurn(firstCard, secondCard);

  if (shouldShowGameOver()) {
    showMatchedGameOver();
    return;
  }

  persistGameState();
}

function handleMismatch(firstCardId: number, secondCardId: number): void {
  const firstCard = getCardById(firstCardId);
  const secondCard = getCardById(secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  window.setTimeout(() => finalizeMismatchTurn(firstCard, secondCard), 700);
}

function getTurnCards(): TurnCards | null {
  if (RUNTIME.firstCardId === null || RUNTIME.secondCardId === null) {
    return null;
  }

  const firstCard = getCardById(RUNTIME.firstCardId);
  const secondCard = getCardById(RUNTIME.secondCardId);

  return firstCard && secondCard ? { firstCard, secondCard } : null;
}

function isMatchedPair(firstCard: CardModel, secondCard: CardModel): boolean {
  return firstCard.pairId === secondCard.pairId;
}

function evaluateTurn(): void {
  const turnCards = getTurnCards();

  if (!turnCards) {
    return;
  }

  const { firstCard, secondCard } = turnCards;

  if (isMatchedPair(firstCard, secondCard)) {
    handleMatchedPair(firstCard.id, secondCard.id);
    return;
  }

  handleMismatch(firstCard.id, secondCard.id);
}

function revealCard(card: CardModel): void {
  card.state = "revealed";
  syncCardElement(card);
}

function handleFirstTurnCard(card: CardModel): void {
  RUNTIME.firstCardId = card.id;
  persistGameState();
}

function handleSecondTurnCard(card: CardModel): void {
  RUNTIME.secondCardId = card.id;
  RUNTIME.lockBoard = true;
  persistGameState();
  evaluateTurn();
}

function onCardClick(event: Event): void {
  if (RUNTIME.lockBoard) {
    return;
  }

  const card = resolveClickedCard(event);

  if (!card) {
    return;
  }

  revealCard(card);

  if (RUNTIME.firstCardId === null) {
    handleFirstTurnCard(card);
    return;
  }

  handleSecondTurnCard(card);
}

function canRestoreGameState(
  storedGameState: GameStateSnapshot | null,
  boardSize: number
): storedGameState is GameStateSnapshot {
  return (
    storedGameState !== null &&
    storedGameState.theme === RUNTIME.activeTheme &&
    storedGameState.boardSize === boardSize
  );
}

function restoreGameState(
  storedGameState: GameStateSnapshot,
  boardSize: number
): void {
  RUNTIME.currentPlayer = storedGameState.currentPlayer;
  RUNTIME.cards = storedGameState.cards;
  RUNTIME.scores.Blue = storedGameState.scores.Blue;
  RUNTIME.scores.Orange = storedGameState.scores.Orange;
  RUNTIME.matchedPairs = storedGameState.matchedPairs;

  resetTurnState();
  renderBoard(boardSize);
  updateHeaderState();
}

function startNewGame(boardSize: number): void {
  RUNTIME.currentPlayer = getInitialPlayer();
  RUNTIME.cards = createCards(boardSize);
  RUNTIME.matchedPairs = 0;
  RUNTIME.scores.Blue = 0;
  RUNTIME.scores.Orange = 0;

  resetTurnState();
  renderBoard(boardSize);
  updateHeaderState();
}

function initializeGameState(boardSize: number): void {
  const storedGameState = readStoredGameState();

  if (canRestoreGameState(storedGameState, boardSize)) {
    restoreGameState(storedGameState, boardSize);
    return;
  }

  startNewGame(boardSize);
}

function openExitDialog(): void {
  if (!EXIT_DIALOG_ELEMENT) {
    return;
  }

  lastFocusedElement = document.activeElement as HTMLElement | null;
  EXIT_DIALOG_ELEMENT.showModal();
}

function closeExitDialog(): void {
  if (!EXIT_DIALOG_ELEMENT) {
    return;
  }

  EXIT_DIALOG_ELEMENT.close();
  lastFocusedElement?.focus();
}

function confirmExitGame(): void {
  window.removeEventListener("beforeunload", persistGameState);
  clearStoredGameState();
  window.location.href = "./settings.html";
}

function bindExitDialogActionButtons(): void {
  EXIT_GAME_TRIGGER_ELEMENT?.addEventListener("click", openExitDialog);
  EXIT_DIALOG_CLOSE_ELEMENT?.addEventListener("click", closeExitDialog);
  EXIT_DIALOG_CONFIRM_ELEMENT?.addEventListener("click", confirmExitGame);
}

function bindExitDialogCloseEvents(): void {
  EXIT_DIALOG_ELEMENT?.addEventListener("click", (event) => {
    if (event.target === EXIT_DIALOG_ELEMENT) {
      closeExitDialog();
    }
  });

  EXIT_DIALOG_ELEMENT?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExitDialog();
  });
}

function bindExitDialogListeners(): void {
  if (
    !EXIT_GAME_TRIGGER_ELEMENT ||
    !EXIT_DIALOG_ELEMENT ||
    !EXIT_DIALOG_CLOSE_ELEMENT ||
    !EXIT_DIALOG_CONFIRM_ELEMENT
  ) {
    return;
  }

  bindExitDialogActionButtons();
  bindExitDialogCloseEvents();
}

function bindGameListeners(): void {
  window.addEventListener("beforeunload", persistGameState);
  BOARD_ELEMENT?.addEventListener("click", onCardClick);
  bindExitDialogListeners();
}

/**
 * Boots the game page, restores or creates the board, and binds interactions.
 */
export function initGame(): void {
  if (!GAME_ROOT || !BOARD_ELEMENT) {
    return;
  }

  applyStoredTheme();
  applyThemePlayerIcons();

  const boardSize = parseBoardSize(localStorage.getItem("boardSize"));
  initializeGameState(boardSize);
  persistGameState();
  bindGameListeners();
}
