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

function spawnConfetti(): void {
  if (!CONFETTI_CONTAINER) {
    return;
  }

  CONFETTI_CONTAINER.innerHTML = "";

  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    CONFETTI_CONTAINER.appendChild(createConfettiPiece());
  }
}

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

function getDrawImage(): string {
  return DRAW_IMAGE_BY_THEME[RUNTIME.activeTheme] ?? DRAW_IMAGE_BY_THEME[DEFAULT_THEME];
}

function applyGameoverScores(): void {
  if (GAMEOVER_BLUE_SCORE) {
    GAMEOVER_BLUE_SCORE.textContent = String(RUNTIME.scores.Blue);
  }

  if (GAMEOVER_ORANGE_SCORE) {
    GAMEOVER_ORANGE_SCORE.textContent = String(RUNTIME.scores.Orange);
  }
}

function applyWinnerPawnFallback(
  pawn: HTMLImageElement,
  player: Player,
  deps: WinnerContentDeps
): void {
  pawn.dataset.player = player;
  pawn.src = deps.winnerPawnMap[player];
  pawn.onerror = null;
}

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

function applyWinnerPawn(winner: string, deps: WinnerContentDeps): void {
  if (!WINNER_PAWN_ELEMENT) {
    return;
  }

  setWinnerPawnImage(WINNER_PAWN_ELEMENT, winner as Player, deps);
}

function applyWinnerSubtitle(): void {
  if (!WINNER_SUBTITLE_ELEMENT) {
    return;
  }

  WINNER_SUBTITLE_ELEMENT.textContent = "The winner is";
}

function applyWinnerName(winner: string, winnerLabel: string): void {
  if (!WINNER_NAME_ELEMENT) {
    return;
  }

  WINNER_NAME_ELEMENT.textContent = winnerLabel;
  WINNER_NAME_ELEMENT.dataset.player = winner;
}

function applyWinnerIcon(winner: string, deps: WinnerContentDeps): void {
  if (!WINNER_ICON_ELEMENT) {
    return;
  }

  WINNER_ICON_ELEMENT.src = deps.getPlayerIcon(winner as Player);
  WINNER_ICON_ELEMENT.hidden = false;
}

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

function applyDrawImage(): void {
  if (!DRAW_IMAGE_ELEMENT) {
    return;
  }

  DRAW_IMAGE_ELEMENT.src = getDrawImage();
  DRAW_IMAGE_ELEMENT.alt = `${RUNTIME.activeTheme} draw result illustration`;
}

function hideGameOverIntro(): void {
  GAMEOVER_INTRO_OVERLAY?.setAttribute("hidden", "");
}

function hideResultOverlays(): void {
  GAME_OVER_OVERLAY?.setAttribute("hidden", "");
  DRAW_OVERLAY?.setAttribute("hidden", "");
}

function startNextRound(deps: WinnerContentDeps): void {
  window.removeEventListener("beforeunload", deps.persistGameState);
  deps.clearStoredGameState();
  window.location.href = "./settings.html";
}

function showWinnerOverlay(): void {
  spawnConfetti();
  GAME_OVER_OVERLAY?.removeAttribute("hidden");
}

function showDrawOverlay(): void {
  DRAW_OVERLAY?.removeAttribute("hidden");
}

function bindPlayAgainButtons(deps: WinnerContentDeps): void {
  if (arePlayAgainListenersBound) {
    return;
  }

  PLAY_AGAIN_BUTTONS.forEach((button) => {
    button.addEventListener("click", () => startNextRound(deps));
  });

  arePlayAgainListenersBound = true;
}

function showGameOverResult(winner: string): void {
  hideGameOverIntro();
  hideResultOverlays();

  if (winner === "draw") {
    showDrawOverlay();
  } else {
    showWinnerOverlay();
  }
}

function showGameOverOverlay(winner: string, deps: WinnerContentDeps): void {
  GAMEOVER_INTRO_OVERLAY?.removeAttribute("hidden");
  window.setTimeout(() => showGameOverResult(winner), GAME_OVER_INTRO_MS);
}

function scheduleGameOverOverlay(winner: string, deps: WinnerContentDeps): void {
  window.setTimeout(() => showGameOverOverlay(winner, deps), 1500);
}

/**
 * Displays the game-over sequence and schedules the redirect to settings.
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

  scheduleGameOverOverlay(winner, deps);
}
