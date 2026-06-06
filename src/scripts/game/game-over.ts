import {
  CONFETTI_CONTAINER,
  CONFETTI_COLORS,
  CONFETTI_COUNT,
  DEFAULT_THEME,
  DRAW_IMAGE_BY_THEME,
  DRAW_IMAGE_ELEMENT,
  DRAW_OVERLAY,
  GAME_OVER_INTRO_MS,
  GAME_OVER_OVERLAY,
  GAMEOVER_BLUE_SCORE,
  GAMEOVER_INTRO_OVERLAY,
  GAMEOVER_ORANGE_SCORE,
  RUNTIME,
  type Player,
  WINNER_ICON_ELEMENT,
  WINNER_NAME_ELEMENT,
  WINNER_PAWN_ELEMENT,
  WINNER_SUBTITLE_ELEMENT,
} from "./game-shared";

interface WinnerContentDeps {
  clearStoredGameState: () => void;
  getPlayerIcon: (player: Player) => string;
  getWinnerImage: (player: Player) => string;
  persistGameState: () => void;
  winnerPawnMap: Record<Player, string>;
}

const PLAY_AGAIN_BUTTONS = document.querySelectorAll(
  "[data-play-again]"
) as NodeListOf<HTMLButtonElement>;

let arePlayAgainListenersBound = false;

/**
 * Creates one animated confetti particle with randomized appearance.
 *
 * @returns Confetti element ready to be appended to the overlay.
 */
function createConfettiPiece(): HTMLSpanElement {
  const piece = document.createElement("span");
  piece.className = "confetti-piece";
  piece.style.left = `${Math.random() * 100}%`;
  piece.style.backgroundColor =
    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  piece.style.width = `${6 + Math.random() * 8}px`;
  piece.style.height = `${10 + Math.random() * 10}px`;
  piece.style.animationDuration = `${2.2 + Math.random() * 2}s`;
  piece.style.animationDelay = `${Math.random() * 1.5}s`;
  return piece;
}

/**
 * Rebuilds the confetti container for the winner overlay.
 */
function spawnConfetti(): void {
  if (!CONFETTI_CONTAINER) {
    return;
  }

  CONFETTI_CONTAINER.innerHTML = "";

  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    CONFETTI_CONTAINER.appendChild(createConfettiPiece());
  }
}

/**
 * Determines the winner identifier and display label from the current scores.
 *
 * @returns Winner id plus the label that should be rendered in the overlay.
 */
function determineWinner(): { winner: string; winnerLabel: string } {
  const winner =
    RUNTIME.scores.Blue > RUNTIME.scores.Orange
      ? "Blue"
      : RUNTIME.scores.Orange > RUNTIME.scores.Blue
        ? "Orange"
        : "draw";

  const winnerLabel =
    winner === "draw" ? "IT'S A DRAW" : `${winner.toUpperCase()} PLAYER`;

  return { winner, winnerLabel };
}

/**
 * Returns the draw illustration that matches the active theme.
 *
 * @returns Theme-specific draw result image source.
 */
function getDrawImage(): string {
  return DRAW_IMAGE_BY_THEME[RUNTIME.activeTheme] ?? DRAW_IMAGE_BY_THEME[DEFAULT_THEME];
}

/**
 * Copies the final score values into the game-over intro overlay.
 */
function applyGameoverScores(): void {
  if (GAMEOVER_BLUE_SCORE) {
    GAMEOVER_BLUE_SCORE.textContent = String(RUNTIME.scores.Blue);
  }

  if (GAMEOVER_ORANGE_SCORE) {
    GAMEOVER_ORANGE_SCORE.textContent = String(RUNTIME.scores.Orange);
  }
}

/**
 * Falls back to the default winner pawn if a theme-specific asset fails to load.
 *
 * @param pawn Winner image element that failed to load.
 * @param player Winning player used to select the fallback asset.
 * @param deps Shared dependencies required by the overlay flow.
 */
function applyWinnerPawnFallback(
  pawn: HTMLImageElement,
  player: Player,
  deps: WinnerContentDeps
): void {
  pawn.dataset.player = player;
  pawn.src = deps.winnerPawnMap[player];
  pawn.onerror = null;
}

/**
 * Applies the correct winner pawn or trophy image to the result card.
 *
 * @param pawn Winner image element in the overlay.
 * @param winner Player who won the match.
 * @param deps Shared dependencies required by the overlay flow.
 */
function setWinnerPawnImage(
  pawn: HTMLImageElement,
  winner: Player,
  deps: WinnerContentDeps
): void {
  const winnerImage = deps.getWinnerImage(winner);
  pawn.dataset.player = winnerImage.includes("img/pokal") ? "trophy" : winner;
  pawn.src = winnerImage;
  pawn.alt = `${winner} winner icon`;
  pawn.onerror = () => applyWinnerPawnFallback(pawn, winner, deps);
}

/**
 * Updates the winner pawn element when a non-draw result is shown.
 *
 * @param winner Winner id as resolved from the current score state.
 * @param deps Shared dependencies required by the overlay flow.
 */
function applyWinnerPawn(winner: string, deps: WinnerContentDeps): void {
  if (!WINNER_PAWN_ELEMENT) {
    return;
  }

  setWinnerPawnImage(WINNER_PAWN_ELEMENT, winner as Player, deps);
}

/**
 * Resets the winner subtitle text before showing the result card.
 */
function applyWinnerSubtitle(): void {
  if (!WINNER_SUBTITLE_ELEMENT) {
    return;
  }

  WINNER_SUBTITLE_ELEMENT.textContent = "The winner is";
}

/**
 * Writes the winner label and semantic state to the result title.
 *
 * @param winner Winner id or draw marker used for styling.
 * @param winnerLabel Human-readable label shown in the overlay.
 */
function applyWinnerName(winner: string, winnerLabel: string): void {
  if (!WINNER_NAME_ELEMENT) {
    return;
  }

  WINNER_NAME_ELEMENT.textContent = winnerLabel;
  WINNER_NAME_ELEMENT.dataset.player = winner;
}

/**
 * Updates the winner marker icon for the final result card.
 *
 * @param winner Winner id as resolved from the current score state.
 * @param deps Shared dependencies required by the overlay flow.
 */
function applyWinnerIcon(winner: string, deps: WinnerContentDeps): void {
  if (!WINNER_ICON_ELEMENT) {
    return;
  }

  WINNER_ICON_ELEMENT.src = deps.getPlayerIcon(winner as Player);
  WINNER_ICON_ELEMENT.hidden = false;
}

/**
 * Applies all winner-specific content to the result overlay.
 *
 * @param winner Winner id as resolved from the current score state.
 * @param winnerLabel Human-readable winner label for the overlay.
 * @param deps Shared dependencies required by the overlay flow.
 */
function applyWinnerElements(
  winner: string,
  winnerLabel: string,
  deps: WinnerContentDeps
): void {
  applyWinnerSubtitle();
  applyWinnerName(winner, winnerLabel);
  applyWinnerIcon(winner, deps);
  applyWinnerPawn(winner, deps);
}

/**
 * Updates the draw illustration before showing the draw overlay.
 */
function applyDrawImage(): void {
  if (!DRAW_IMAGE_ELEMENT) {
    return;
  }

  DRAW_IMAGE_ELEMENT.src = getDrawImage();
  DRAW_IMAGE_ELEMENT.alt = `${RUNTIME.activeTheme} draw result illustration`;
}

/**
 * Hides the intermediate game-over intro overlay.
 */
function hideGameOverIntro(): void {
  GAMEOVER_INTRO_OVERLAY?.setAttribute("hidden", "");
}

/**
 * Hides both final result overlays before showing the correct one.
 */
function hideResultOverlays(): void {
  GAME_OVER_OVERLAY?.setAttribute("hidden", "");
  DRAW_OVERLAY?.setAttribute("hidden", "");
}

/**
 * Clears the saved game and returns to the settings page for a new round.
 *
 * @param deps Shared dependencies required by the overlay flow.
 */
function startNextRound(deps: WinnerContentDeps): void {
  window.removeEventListener("beforeunload", deps.persistGameState);
  deps.clearStoredGameState();
  window.location.href = "./settings.html";
}

/**
 * Shows the winner overlay and starts confetti.
 */
function showWinnerOverlay(): void {
  spawnConfetti();
  GAME_OVER_OVERLAY?.removeAttribute("hidden");
}

/**
 * Shows the dedicated draw overlay.
 */
function showDrawOverlay(): void {
  DRAW_OVERLAY?.removeAttribute("hidden");
}

/**
 * Binds the play-again buttons once for both result overlays.
 *
 * @param deps Shared dependencies required by the overlay flow.
 */
function bindPlayAgainButtons(deps: WinnerContentDeps): void {
  if (arePlayAgainListenersBound) {
    return;
  }

  PLAY_AGAIN_BUTTONS.forEach((button) => {
    button.addEventListener("click", () => startNextRound(deps));
  });

  arePlayAgainListenersBound = true;
}

/**
 * Chooses and shows the correct final result overlay.
 *
 * @param winner Winner id or `"draw"` marker for the finished match.
 */
function showGameOverResult(winner: string): void {
  hideGameOverIntro();
  hideResultOverlays();

  if (winner === "draw") {
    showDrawOverlay();
  } else {
    showWinnerOverlay();
  }
}

/**
 * Reveals the game-over intro overlay before the final result card appears.
 *
 * @param winner Winner id or `"draw"` marker for the finished match.
 */
function showGameOverOverlay(winner: string): void {
  GAMEOVER_INTRO_OVERLAY?.removeAttribute("hidden");
  window.setTimeout(() => showGameOverResult(winner), GAME_OVER_INTRO_MS);
}

/**
 * Delays the final overlay sequence to let the last move settle visually.
 *
 * @param winner Winner id or `"draw"` marker for the finished match.
 */
function scheduleGameOverOverlay(winner: string): void {
  window.setTimeout(() => showGameOverOverlay(winner), 1500);
}

/**
 * Displays the game-over sequence and schedules the redirect to settings.
 *
 * @param deps Shared dependencies required by the overlay flow.
 */
export function showGameOver(deps: WinnerContentDeps): void {
  if (!GAME_OVER_OVERLAY && !DRAW_OVERLAY) {
    return;
  }

  deps.clearStoredGameState();
  const { winner, winnerLabel } = determineWinner();

  applyGameoverScores();
  bindPlayAgainButtons(deps);

  if (winner === "draw") {
    applyDrawImage();
  } else {
    applyWinnerElements(winner, winnerLabel, deps);
  }

  scheduleGameOverOverlay(winner);
}
