import {
  DEFAULT_BOARD_SIZE,
  GAME_IN_PROGRESS_STORAGE_KEY,
  GAME_STATE_STORAGE_KEY,
  RUNTIME,
  STATUS_ELEMENT,
  type GameStateSnapshot,
  type Player,
} from "./game-shared";

function isPlayer(value: unknown): value is Player {
  return value === "Blue" || value === "Orange";
}

/**
 * Removes all persisted game state from session storage.
 */
export function clearStoredGameState(): void {
  sessionStorage.removeItem(GAME_IN_PROGRESS_STORAGE_KEY);
  sessionStorage.removeItem(GAME_STATE_STORAGE_KEY);
}

function buildGameSnapshot(boardSize: number): GameStateSnapshot {
  return {
    theme: RUNTIME.activeTheme,
    boardSize,
    currentPlayer: RUNTIME.currentPlayer,
    cards: RUNTIME.cards,
    scores: { ...RUNTIME.scores },
    matchedPairs: RUNTIME.matchedPairs,
    statusText: STATUS_ELEMENT?.textContent ?? "",
  };
}

/**
 * Persists the current game runtime state into session storage.
 */
export function persistGameState(): void {
  if (!RUNTIME.cards.length) {
    return;
  }

  const boardSize = RUNTIME.cards.length;
  const snapshot = buildGameSnapshot(boardSize);

  sessionStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(snapshot));
  sessionStorage.setItem(GAME_IN_PROGRESS_STORAGE_KEY, "true");
}

function hasValidBoardSize(boardSize: unknown): boolean {
  return boardSize === 16 || boardSize === 24 || boardSize === 36;
}

function hasValidScores(scores: unknown): scores is Record<Player, number> {
  return (
    typeof scores === "object" &&
    scores !== null &&
    typeof (scores as Record<Player, number>).Blue === "number" &&
    typeof (scores as Record<Player, number>).Orange === "number"
  );
}

function hasValidSnapshotShape(
  parsed: Partial<GameStateSnapshot>
): parsed is GameStateSnapshot {
  return (
    typeof parsed.theme === "string" &&
    hasValidBoardSize(parsed.boardSize) &&
    isPlayer(parsed.currentPlayer) &&
    Array.isArray(parsed.cards) &&
    typeof parsed.matchedPairs === "number" &&
    typeof parsed.statusText === "string" &&
    hasValidScores(parsed.scores)
  );
}

function hasValidCardState(state: unknown): boolean {
  return state === "hidden" || state === "revealed" || state === "matched";
}

function hasValidCards(snapshot: GameStateSnapshot): boolean {
  return snapshot.cards.every((card) => {
    return (
      typeof card.id === "number" &&
      typeof card.pairId === "number" &&
      typeof card.value === "string" &&
      hasValidCardState(card.state)
    );
  });
}

function normalizeSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  return {
    theme: snapshot.theme,
    boardSize: snapshot.boardSize,
    currentPlayer: snapshot.currentPlayer,
    cards: snapshot.cards,
    scores: { Blue: snapshot.scores.Blue, Orange: snapshot.scores.Orange },
    matchedPairs: snapshot.matchedPairs,
    statusText: snapshot.statusText,
  };
}

function parseStoredGameState(raw: string): GameStateSnapshot | null {
  const parsed = JSON.parse(raw) as Partial<GameStateSnapshot>;

  if (!hasValidSnapshotShape(parsed) || !hasValidCards(parsed)) {
    return null;
  }

  return parsed.cards.length === parsed.boardSize ? normalizeSnapshot(parsed) : null;
}

/**
 * Restores a previously saved game state from session storage when valid.
 */
export function readStoredGameState(): GameStateSnapshot | null {
  const raw = sessionStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return parseStoredGameState(raw);
  } catch {
    return null;
  }
}

/**
 * Parses the stored board size and falls back to the default value when invalid.
 */
export function parseBoardSize(value: string | null): number {
  const parsed = Number(value);
  return [16, 24, 36].includes(parsed) ? parsed : DEFAULT_BOARD_SIZE;
}
