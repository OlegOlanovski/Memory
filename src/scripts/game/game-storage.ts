import {
  DEFAULT_BOARD_SIZE,
  GAME_IN_PROGRESS_STORAGE_KEY,
  GAME_STATE_STORAGE_KEY,
  RUNTIME,
  type GameStateSnapshot,
  type Player,
} from "./game-shared";

/**
 * Checks whether an unknown value matches the supported player identifiers.
 *
 * @param value Unknown value restored from storage.
 * @returns `true` when the value is one of the supported players.
 */
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

/**
 * Creates the serializable snapshot persisted between page loads.
 *
 * @param boardSize Total number of cards in the active match.
 * @returns Snapshot that can be stored safely in session storage.
 */
function buildGameSnapshot(boardSize: number): GameStateSnapshot {
  return {
    theme: RUNTIME.activeTheme,
    boardSize,
    currentPlayer: RUNTIME.currentPlayer,
    cards: RUNTIME.cards,
    scores: { ...RUNTIME.scores },
    matchedPairs: RUNTIME.matchedPairs,
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

/**
 * Checks whether a stored board size belongs to the supported variants.
 *
 * @param boardSize Parsed value from stored data.
 * @returns `true` when the board size is one of the supported options.
 */
function hasValidBoardSize(boardSize: unknown): boolean {
  return boardSize === 16 || boardSize === 24 || boardSize === 36;
}

/**
 * Validates that both persisted score values are numeric.
 *
 * @param scores Unknown score object restored from storage.
 * @returns `true` when both player scores are present and numeric.
 */
function hasValidScores(scores: unknown): scores is Record<Player, number> {
  return (
    typeof scores === "object" &&
    scores !== null &&
    typeof (scores as Record<Player, number>).Blue === "number" &&
    typeof (scores as Record<Player, number>).Orange === "number"
  );
}

/**
 * Validates the basic shape of a stored snapshot before deeper checks run.
 *
 * @param parsed Partially parsed JSON snapshot.
 * @returns Type-guard result for the required top-level snapshot fields.
 */
function hasValidSnapshotShape(
  parsed: Partial<GameStateSnapshot>
): parsed is GameStateSnapshot {
  return (
    typeof parsed.theme === "string" &&
    hasValidBoardSize(parsed.boardSize) &&
    isPlayer(parsed.currentPlayer) &&
    Array.isArray(parsed.cards) &&
    typeof parsed.matchedPairs === "number" &&
    hasValidScores(parsed.scores)
  );
}

/**
 * Checks whether a stored card state is one of the supported runtime states.
 *
 * @param state Unknown card state value restored from storage.
 * @returns `true` when the card state is supported by the runtime.
 */
function hasValidCardState(state: unknown): boolean {
  return state === "hidden" || state === "revealed" || state === "matched";
}

/**
 * Validates all persisted cards inside a stored snapshot.
 *
 * @param snapshot Snapshot that already passed the top-level shape checks.
 * @returns `true` when every persisted card matches the expected runtime shape.
 */
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

/**
 * Copies a validated snapshot into the exact runtime-friendly shape.
 *
 * @param snapshot Validated snapshot restored from session storage.
 * @returns Normalized snapshot object safe to hydrate into the runtime.
 */
function normalizeSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  return {
    theme: snapshot.theme,
    boardSize: snapshot.boardSize,
    currentPlayer: snapshot.currentPlayer,
    cards: snapshot.cards,
    scores: { Blue: snapshot.scores.Blue, Orange: snapshot.scores.Orange },
    matchedPairs: snapshot.matchedPairs,
  };
}

/**
 * Parses and validates the serialized snapshot stored in session storage.
 *
 * @param raw Raw JSON string read from session storage.
 * @returns Valid normalized snapshot, or `null` when parsing fails validation.
 */
function parseStoredGameState(raw: string): GameStateSnapshot | null {
  const parsed = JSON.parse(raw) as Partial<GameStateSnapshot>;

  if (!hasValidSnapshotShape(parsed) || !hasValidCards(parsed)) {
    return null;
  }

  return parsed.cards.length === parsed.boardSize ? normalizeSnapshot(parsed) : null;
}

/**
 * Restores a previously saved game state from session storage when valid.
 *
 * @returns Restored snapshot or `null` when nothing valid is stored.
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
 *
 * @param value Raw board-size value read from local storage.
 * @returns Supported numeric board size, or the default fallback.
 */
export function parseBoardSize(value: string | null): number {
  const parsed = Number(value);
  return [16, 24, 36].includes(parsed) ? parsed : DEFAULT_BOARD_SIZE;
}
