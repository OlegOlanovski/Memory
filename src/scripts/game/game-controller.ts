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

/**
 * Applies the persisted theme and card-back asset to the game page.
 */
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

/**
 * Reads the configured starting player from local storage.
 */
function getInitialPlayer(): Player {
  const storedPlayer = localStorage.getItem("player");
  return storedPlayer === "Orange" ? "Orange" : "Blue";
}

/**
 * Resolves the player icon set for the active theme.
 *
 * @param theme Theme name stored in the runtime or local storage.
 * @returns Icon sources keyed by player for the given theme.
 */
function getPlayerIconsForTheme(theme: string): Record<Player, string> {
  return PLAYER_ICON_MAP_BY_THEME[theme] ?? DEFAULT_PLAYER_ICON_MAP;
}

/**
 * Returns the current player's icon source for the active theme.
 *
 * @param player Player whose header icon should be resolved.
 * @returns Image source for the given player in the active theme.
 */
function getPlayerIcon(player: Player): string {
  const icons = getPlayerIconsForTheme(RUNTIME.activeTheme);
  return icons[player] ?? DEFAULT_PLAYER_ICON_MAP[player];
}

/**
 * Returns the winner image used on the result overlay.
 *
 * @param player Winning player whose result image should be shown.
 * @returns Theme-specific winner image or fallback pawn image.
 */
function getWinnerImage(player: Player): string {
  const images = WINNER_IMAGE_MAP_BY_THEME[RUNTIME.activeTheme] ?? WINNER_PAWN_MAP;
  return images[player] ?? WINNER_PAWN_MAP[player];
}

/**
 * Applies the theme-specific player icons across the game header and result intro.
 */
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

/**
 * Syncs the current-player indicator and both score values in the header.
 */
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

/**
 * Switches the active player and refreshes the header indicator.
 */
function switchPlayer(): void {
  RUNTIME.currentPlayer = RUNTIME.currentPlayer === "Blue" ? "Orange" : "Blue";
  updateHeaderState();
}

/**
 * Clears the temporary state that tracks the current turn selection.
 */
function resetTurnState(): void {
  RUNTIME.firstCardId = null;
  RUNTIME.secondCardId = null;
  RUNTIME.lockBoard = false;
}

/**
 * Finalizes a successful turn by marking the pair and updating the score.
 *
 * @param firstCard First matched card in the current turn.
 * @param secondCard Second matched card in the current turn.
 */
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

/**
 * Checks whether all pairs on the board have been found.
 *
 * @returns `true` when the current match is complete.
 */
function shouldShowGameOver(): boolean {
  return RUNTIME.matchedPairs === RUNTIME.cards.length / 2;
}

/**
 * Triggers the game-over flow after the final matched pair.
 */
function showMatchedGameOver(): void {
  showGameOver({
    clearStoredGameState,
    getPlayerIcon,
    getWinnerImage,
    persistGameState,
    winnerPawnMap: WINNER_PAWN_MAP,
  });
}

/**
 * Hides two temporarily revealed cards after a mismatch.
 *
 * @param firstCard First mismatched card to hide.
 * @param secondCard Second mismatched card to hide.
 */
function hideCards(firstCard: CardModel, secondCard: CardModel): void {
  firstCard.state = "hidden";
  secondCard.state = "hidden";
  syncCardElement(firstCard);
  syncCardElement(secondCard);
}

/**
 * Completes a mismatch turn, switches the player, and persists the state.
 *
 * @param firstCard First mismatched card in the turn.
 * @param secondCard Second mismatched card in the turn.
 */
function finalizeMismatchTurn(firstCard: CardModel, secondCard: CardModel): void {
  hideCards(firstCard, secondCard);
  resetTurnState();
  switchPlayer();
  persistGameState();
}

/**
 * Resolves a matched pair from the runtime deck and advances the game.
 *
 * @param firstCardId Runtime id of the first selected card.
 * @param secondCardId Runtime id of the second selected card.
 */
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

/**
 * Resolves a mismatched pair and schedules the cards to flip back.
 *
 * @param firstCardId Runtime id of the first selected card.
 * @param secondCardId Runtime id of the second selected card.
 */
function handleMismatch(firstCardId: number, secondCardId: number): void {
  const firstCard = getCardById(firstCardId);
  const secondCard = getCardById(secondCardId);

  if (!firstCard || !secondCard) {
    return;
  }

  window.setTimeout(() => finalizeMismatchTurn(firstCard, secondCard), 700);
}

/**
 * Returns the two cards currently selected in this turn when both exist.
 *
 * @returns Both selected runtime cards, or `null` when the turn is incomplete.
 */
function getTurnCards(): TurnCards | null {
  if (RUNTIME.firstCardId === null || RUNTIME.secondCardId === null) {
    return null;
  }

  const firstCard = getCardById(RUNTIME.firstCardId);
  const secondCard = getCardById(RUNTIME.secondCardId);

  return firstCard && secondCard ? { firstCard, secondCard } : null;
}

/**
 * Compares two revealed cards and reports whether they belong to the same pair.
 *
 * @param firstCard First revealed card.
 * @param secondCard Second revealed card.
 * @returns `true` when both cards belong to the same pair id.
 */
function isMatchedPair(firstCard: CardModel, secondCard: CardModel): boolean {
  return firstCard.pairId === secondCard.pairId;
}

/**
 * Evaluates the second card selection and dispatches the matching outcome.
 */
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

/**
 * Marks a hidden card as revealed and updates its rendered state.
 *
 * @param card Card that should be revealed in the UI and runtime.
 */
function revealCard(card: CardModel): void {
  card.state = "revealed";
  syncCardElement(card);
}

/**
 * Stores the first selected card of the current turn.
 *
 * @param card First card selected by the player this turn.
 */
function handleFirstTurnCard(card: CardModel): void {
  RUNTIME.firstCardId = card.id;
  persistGameState();
}

/**
 * Stores the second selected card and locks the board for evaluation.
 *
 * @param card Second card selected by the player this turn.
 */
function handleSecondTurnCard(card: CardModel): void {
  RUNTIME.secondCardId = card.id;
  RUNTIME.lockBoard = true;
  persistGameState();
  evaluateTurn();
}

/**
 * Handles click events from the board and routes them into the turn flow.
 *
 * @param event Click event delegated from the board container.
 */
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

/**
 * Verifies whether a persisted snapshot matches the current theme and board size.
 *
 * @param storedGameState Snapshot restored from session storage.
 * @param boardSize Active board size for the current page load.
 * @returns Type-guard result that confirms the snapshot can be restored.
 */
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

/**
 * Restores a previously persisted runtime snapshot into the UI.
 *
 * @param storedGameState Validated snapshot loaded from storage.
 * @param boardSize Board size used to re-render the grid.
 */
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

/**
 * Creates a fresh game runtime for the selected board size.
 *
 * @param boardSize Number of cards that should be used for the new game.
 */
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

/**
 * Restores a saved game when valid or starts a fresh match otherwise.
 *
 * @param boardSize Active board size requested by the settings page.
 */
function initializeGameState(boardSize: number): void {
  const storedGameState = readStoredGameState();

  if (canRestoreGameState(storedGameState, boardSize)) {
    restoreGameState(storedGameState, boardSize);
    return;
  }

  startNewGame(boardSize);
}

/**
 * Opens the exit confirmation dialog and stores the last focused element.
 */
function openExitDialog(): void {
  if (!EXIT_DIALOG_ELEMENT) {
    return;
  }

  lastFocusedElement = document.activeElement as HTMLElement | null;
  EXIT_DIALOG_ELEMENT.showModal();
}

/**
 * Closes the exit confirmation dialog and restores focus.
 */
function closeExitDialog(): void {
  if (!EXIT_DIALOG_ELEMENT) {
    return;
  }

  EXIT_DIALOG_ELEMENT.close();
  lastFocusedElement?.focus();
}

/**
 * Confirms leaving the current match and returns to the settings page.
 */
function confirmExitGame(): void {
  window.removeEventListener("beforeunload", persistGameState);
  clearStoredGameState();
  window.location.href = "./settings.html";
}

/**
 * Binds the primary action buttons inside the exit dialog.
 */
function bindExitDialogActionButtons(): void {
  EXIT_GAME_TRIGGER_ELEMENT?.addEventListener("click", openExitDialog);
  EXIT_DIALOG_CLOSE_ELEMENT?.addEventListener("click", closeExitDialog);
  EXIT_DIALOG_CONFIRM_ELEMENT?.addEventListener("click", confirmExitGame);
}

/**
 * Binds overlay click and escape handling for the exit dialog.
 */
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

/**
 * Attaches all exit-dialog listeners once the required elements exist.
 */
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

/**
 * Binds board interaction, persistence, and dialog listeners for the game page.
 */
function bindGameListeners(): void {
  window.addEventListener("beforeunload", persistGameState);
  BOARD_ELEMENT?.addEventListener("click", onCardClick);
  bindExitDialogListeners();
}

/**
 * Boots the game page, restores or creates the board, and binds interactions.
 *
 * @returns Nothing. Exits early when the required game DOM is missing.
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
