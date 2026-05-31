import {
  GAME_IN_PROGRESS_STORAGE_KEY,
  GAME_STATE_STORAGE_KEY,
  defaultBoardSize,
  runtime,
  statusElement,
  type GameStateSnapshot,
  type Player,
} from "./game-shared";

function isPlayer(value: unknown): value is Player {
  return value === "Blue" || value === "Orange";
}

export function clearStoredGameState() {
  sessionStorage.removeItem(GAME_IN_PROGRESS_STORAGE_KEY);
  sessionStorage.removeItem(GAME_STATE_STORAGE_KEY);
}

function buildGameSnapshot(boardSize: number): GameStateSnapshot {
  return {
    theme: runtime.activeTheme,
    boardSize,
    currentPlayer: runtime.currentPlayer,
    cards: runtime.cards,
    scores: { ...runtime.scores },
    matchedPairs: runtime.matchedPairs,
    statusText: statusElement?.textContent ?? "",
  };
}

export function persistGameState() {
  if (!runtime.cards.length) {
    return;
  }

  const boardSize = runtime.cards.length;
  const snapshot = buildGameSnapshot(boardSize);

  sessionStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(snapshot));
  sessionStorage.setItem(GAME_IN_PROGRESS_STORAGE_KEY, "true");
}

export function readStoredGameState(): GameStateSnapshot | null {
  const raw = sessionStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GameStateSnapshot>;
    const isValidBoardSize =
      parsed.boardSize === 16 ||
      parsed.boardSize === 24 ||
      parsed.boardSize === 34;

    if (
      !parsed ||
      typeof parsed.theme !== "string" ||
      !isValidBoardSize ||
      !isPlayer(parsed.currentPlayer) ||
      !Array.isArray(parsed.cards) ||
      typeof parsed.matchedPairs !== "number" ||
      typeof parsed.statusText !== "string" ||
      !parsed.scores ||
      typeof parsed.scores.Blue !== "number" ||
      typeof parsed.scores.Orange !== "number"
    ) {
      return null;
    }

    const hasValidCards = parsed.cards.every((card) => {
      const isValidState =
        card.state === "hidden" ||
        card.state === "revealed" ||
        card.state === "matched";

      return (
        typeof card.id === "number" &&
        typeof card.pairId === "number" &&
        typeof card.value === "string" &&
        isValidState
      );
    });

    if (!hasValidCards || parsed.cards.length !== parsed.boardSize) {
      return null;
    }

    return {
      theme: parsed.theme,
      boardSize: parsed.boardSize,
      currentPlayer: parsed.currentPlayer,
      cards: parsed.cards,
      scores: {
        Blue: parsed.scores.Blue,
        Orange: parsed.scores.Orange,
      },
      matchedPairs: parsed.matchedPairs,
      statusText: parsed.statusText,
    };
  } catch {
    return null;
  }
}

export function parseBoardSize(value: string | null): number {
  const parsed = Number(value);
  return [16, 24, 34].includes(parsed) ? parsed : defaultBoardSize;
}
