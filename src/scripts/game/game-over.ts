import {
  CONFETTI_COLORS,
  CONFETTI_COUNT,
  GAME_OVER_DISPLAY_MS,
  GAME_OVER_INTRO_MS,
  confettiContainer,
  gameOverOverlay,
  gameoverBlueScore,
  gameoverIntroOverlay,
  gameoverOrangeScore,
  runtime,
  type Player,
  winnerDrawIconElement,
  winnerIconElement,
  winnerNameElement,
  winnerPawnElement,
  winnerSubtitleElement,
} from "./game-shared";

interface WinnerContentDeps {
  clearStoredGameState: () => void;
  getPlayerIcon: (player: Player) => string;
  getWinnerImage: (player: Player) => string;
  persistGameState: () => void;
  winnerPawnMap: Record<Player, string>;
}

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
  if (!confettiContainer) {
    return;
  }

  confettiContainer.innerHTML = "";

  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    confettiContainer.appendChild(createConfettiPiece());
  }
}

function determineWinner(): { winner: string; winnerLabel: string } {
  const winner =
    runtime.scores.Blue > runtime.scores.Orange
      ? "Blue"
      : runtime.scores.Orange > runtime.scores.Blue
        ? "Orange"
        : "draw";

  const winnerLabel =
    winner === "draw" ? "IT'S A DRAW" : `${winner.toUpperCase()} PLAYER`;

  return { winner, winnerLabel };
}

function applyGameoverScores(): void {
  if (gameoverBlueScore) {
    gameoverBlueScore.textContent = String(runtime.scores.Blue);
  }

  if (gameoverOrangeScore) {
    gameoverOrangeScore.textContent = String(runtime.scores.Orange);
  }
}

function applyWinnerPawn(winner: string, deps: WinnerContentDeps): void {
  if (!winnerPawnElement) {
    return;
  }

  const pawn = winnerPawnElement;
  pawn.hidden = winner === "draw";

  if (winner === "draw") {
    return;
  }

  const player = winner as Player;
  const winnerImage = deps.getWinnerImage(player);
  pawn.dataset.player = winnerImage.includes("img/pokal") ? "trophy" : winner;
  pawn.src = winnerImage;

  pawn.onerror = () => {
    pawn.dataset.player = player;
    pawn.src = deps.winnerPawnMap[player];
    pawn.onerror = null;
  };

  pawn.alt = `${winner} winner icon`;
}

function applyWinnerElements(
  winner: string,
  winnerLabel: string,
  deps: WinnerContentDeps
): void {
  const isDraw = winner === "draw";

  if (winnerSubtitleElement) {
    winnerSubtitleElement.textContent = isDraw
      ? "It's a draw!"
      : "The winner is";
  }

  if (winnerNameElement) {
    winnerNameElement.textContent = winnerLabel;
    winnerNameElement.dataset.player = winner;
  }

  if (winnerIconElement) {
    winnerIconElement.hidden = isDraw;

    if (!isDraw) {
      winnerIconElement.src = deps.getPlayerIcon(winner as Player);
    }
  }

  if (winnerDrawIconElement) {
    winnerDrawIconElement.hidden = !isDraw;
  }

  applyWinnerPawn(winner, deps);
}

function showGameOverOverlay(deps: WinnerContentDeps): void {
  if (gameoverIntroOverlay) {
    gameoverIntroOverlay.removeAttribute("hidden");
  }

  window.setTimeout(() => {
    if (gameoverIntroOverlay) {
      gameoverIntroOverlay.setAttribute("hidden", "");
    }

    spawnConfetti();
    gameOverOverlay?.removeAttribute("hidden");

    window.setTimeout(() => {
      window.removeEventListener("beforeunload", deps.persistGameState);
      deps.clearStoredGameState();
      window.location.href = "./settings.html";
    }, GAME_OVER_DISPLAY_MS);
  }, GAME_OVER_INTRO_MS);
}

export function showGameOver(deps: WinnerContentDeps): void {
  if (!gameOverOverlay) {
    return;
  }

  deps.clearStoredGameState();
  const { winner, winnerLabel } = determineWinner();

  applyGameoverScores();
  applyWinnerElements(winner, winnerLabel, deps);

  window.setTimeout(() => {
    showGameOverOverlay(deps);
  }, 1500);
}
