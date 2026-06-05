const BASE = import.meta.env.BASE_URL;

/**
 * Allowed player identifiers used across the game flow.
 */
export type Player = "Blue" | "Orange";

/**
 * Runtime model for a single memory card.
 */
export interface CardModel {
  id: number;
  pairId: number;
  value: string;
  state: "hidden" | "revealed" | "matched";
}

/**
 * Serialized game state stored between page navigations.
 */
export interface GameStateSnapshot {
  theme: string;
  boardSize: number;
  currentPlayer: Player;
  cards: CardModel[];
  scores: Record<Player, number>;
  matchedPairs: number;
}

/**
 * Root element for the game page.
 */
export const GAME_ROOT = document.querySelector(
  ".game-page"
) as HTMLElement | null;
/**
 * Board container that renders all memory cards.
 */
export const BOARD_ELEMENT = document.querySelector(
  "[data-game-grid]"
) as HTMLElement | null;
/**
 * Current player icon in the game header.
 */
export const CURRENT_PLAYER_ICON_ELEMENT = document.querySelector(
  "[data-current-player-icon]"
) as HTMLImageElement | null;
/**
 * Score value element for the blue player.
 */
export const BLUE_SCORE_ELEMENT = document.querySelector(
  '[data-score="Blue"]'
) as HTMLElement | null;
/**
 * Score value element for the orange player.
 */
export const ORANGE_SCORE_ELEMENT = document.querySelector(
  '[data-score="Orange"]'
) as HTMLElement | null;
/**
 * Score icon element for the blue player.
 */
export const BLUE_SCORE_ICON_ELEMENT = document.querySelector(
  '[data-score-icon="Blue"]'
) as HTMLImageElement | null;
/**
 * Score icon element for the orange player.
 */
export const ORANGE_SCORE_ICON_ELEMENT = document.querySelector(
  '[data-score-icon="Orange"]'
) as HTMLImageElement | null;
/**
 * Intro overlay shown before the final game-over result.
 */
export const GAMEOVER_INTRO_OVERLAY = document.querySelector(
  "[data-gameover-intro]"
) as HTMLElement | null;
/**
 * Blue score icon shown in the game-over overlay.
 */
export const GAMEOVER_BLUE_SCORE_ICON_ELEMENT = document.querySelector(
  '[data-gameover-score-icon="Blue"]'
) as HTMLImageElement | null;
/**
 * Orange score icon shown in the game-over overlay.
 */
export const GAMEOVER_ORANGE_SCORE_ICON_ELEMENT = document.querySelector(
  '[data-gameover-score-icon="Orange"]'
) as HTMLImageElement | null;
/**
 * Blue score value shown in the game-over overlay.
 */
export const GAMEOVER_BLUE_SCORE = document.querySelector(
  '[data-gameover-score="Blue"]'
) as HTMLElement | null;
/**
 * Orange score value shown in the game-over overlay.
 */
export const GAMEOVER_ORANGE_SCORE = document.querySelector(
  '[data-gameover-score="Orange"]'
) as HTMLElement | null;
/**
 * Final overlay that displays the game result.
 */
export const GAME_OVER_OVERLAY = document.querySelector(
  "[data-game-over]"
) as HTMLElement | null;
/**
 * Dedicated overlay that is shown when the match ends in a draw.
 */
export const DRAW_OVERLAY = document.querySelector(
  "[data-draw-overlay]"
) as HTMLElement | null;
/**
 * Winner icon element for non-draw results.
 */
export const WINNER_ICON_ELEMENT = document.querySelector(
  "[data-winner-icon]"
) as HTMLImageElement | null;
/**
 * Winner label element in the result overlay.
 */
export const WINNER_NAME_ELEMENT = document.querySelector(
  "[data-winner-name]"
) as HTMLElement | null;
/**
 * Winner pawn or trophy image element.
 */
export const WINNER_PAWN_ELEMENT = document.querySelector(
  "[data-winner-pawn]"
) as HTMLImageElement | null;
/**
 * Draw illustration element in the dedicated draw overlay.
 */
export const DRAW_IMAGE_ELEMENT = document.querySelector(
  "[data-draw-image]"
) as HTMLImageElement | null;
/**
 * Subtitle element above the winner label.
 */
export const WINNER_SUBTITLE_ELEMENT = document.querySelector(
  "[data-winner-subtitle]"
) as HTMLElement | null;
/**
 * Container for animated confetti pieces.
 */
export const CONFETTI_CONTAINER = document.querySelector(
  "[data-confetti]"
) as HTMLElement | null;

/**
 * Delay before the main game-over overlay is revealed.
 */
export const GAME_OVER_INTRO_MS = 2000;
/**
 * Session storage flag for an unfinished game.
 */
export const GAME_IN_PROGRESS_STORAGE_KEY = "memoryGameInProgress";
/**
 * Session storage key for the serialized game snapshot.
 */
export const GAME_STATE_STORAGE_KEY = "memoryGameState";
/**
 * Default theme used when no selection is stored.
 */
export const DEFAULT_THEME = "Code vibes theme";
const DEFAULT_PLAYER: Player = "Blue";
/**
 * Default board size used when no valid selection is stored.
 */
export const DEFAULT_BOARD_SIZE = 16;

/**
 * Fallback header and score icons for each player.
 */
export const DEFAULT_PLAYER_ICON_MAP: Record<Player, string> = {
  Blue: `${BASE}img/label_blue.svg`,
  Orange: `${BASE}img/label2.svg`,
};

/**
 * Theme-specific player icons used in the game UI.
 */
export const PLAYER_ICON_MAP_BY_THEME: Record<string, Record<Player, string>> = {
  "Code vibes theme": DEFAULT_PLAYER_ICON_MAP,
  "Gaming theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
  "DA Projects theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
};

/**
 * Fallback winner pawn images for both players.
 */
export const WINNER_PAWN_MAP: Record<Player, string> = {
  Blue: `${BASE}img/player_blue.png`,
  Orange: `${BASE}img/player-orange.png`,
};

/**
 * Theme-specific winner images shown in the result overlay.
 */
export const WINNER_IMAGE_MAP_BY_THEME: Record<string, Record<Player, string>> = {
  "Code vibes theme": WINNER_PAWN_MAP,
  "Gaming theme": {
    Blue: `${BASE}img/pokal.png`,
    Orange: `${BASE}img/pokal.png`,
  },
  "DA Projects theme": WINNER_PAWN_MAP,
};

/**
 * Theme-specific card back image sources.
 */
export const CARD_BACK_BY_THEME: Record<string, string> = {
  "Code vibes theme": `${BASE}themes/code-vibes-card-1.svg`,
  "Gaming theme": `${BASE}themes/gaming-card-1.png`,
  "DA Projects theme": `${BASE}themes/da-projects-card-1.png`,
};

/**
 * Theme-specific card front image sets used to build the deck.
 */
export const CARD_FRONT_BY_THEME: Record<string, string[]> = {
  "Code vibes theme": [
    `${BASE}img/theme-img/code-vibes-front-1.png`,
    `${BASE}img/theme-img/code-vibes-front-2.png`,
    `${BASE}img/theme-img/code-vibes-front-3.png`,
    `${BASE}img/theme-img/code-vibes-front-4.png`,
    `${BASE}img/theme-img/code-vibes-front-5.png`,
    `${BASE}img/theme-img/code-vibes-front-6.png`,
    `${BASE}img/theme-img/code-vibes-front-7.png`,
    `${BASE}img/theme-img/code-vibes-front-8.png`,
    `${BASE}img/theme-img/code-vibes-front-9.png`,
    `${BASE}img/theme-img/code-vibes-front-10.png`,
    `${BASE}img/theme-img/code-vibes-front-11.png`,
    `${BASE}img/theme-img/code-vibes-front-12.png`,
    `${BASE}img/theme-img/code-vibes-front-13.png`,
    `${BASE}img/theme-img/code-vibes-front-14.png`,
    `${BASE}img/theme-img/code-vibes-front-15.png`,
  ],
  "Gaming theme": [
    `${BASE}img/theme-img/gaming-front-1.png`,
    `${BASE}img/theme-img/gaming-front-2.png`,
    `${BASE}img/theme-img/gaming-front-3.png`,
    `${BASE}img/theme-img/gaming-front-4.png`,
    `${BASE}img/theme-img/gaming-front-5.png`,
    `${BASE}img/theme-img/gaming-front-6.png`,
    `${BASE}img/theme-img/gaming-front-7.png`,
    `${BASE}img/theme-img/gaming-front-8.png`,
    `${BASE}img/theme-img/gaming-front-9.png`,
    `${BASE}img/theme-img/gaming-front-10.png`,
    `${BASE}img/theme-img/gaming-front-11.png`,
    `${BASE}img/theme-img/gaming-front-12.png`,
    `${BASE}img/theme-img/gaming-front-13.png`,
    `${BASE}img/theme-img/gaming-front-14.png`,
    `${BASE}img/theme-img/gaming-front-15.png`,
    `${BASE}img/theme-img/gaming-front-16.png`,
    `${BASE}img/theme-img/gaming-front-17.png`,
  ],
  "DA Projects theme": [
    `${BASE}img/theme-img/da-projects-front-1.png`,
    `${BASE}img/theme-img/da-projects-front-2.png`,
    `${BASE}img/theme-img/da-projects-front-3.png`,
    `${BASE}img/theme-img/da-projects-front-4.png`,
    `${BASE}img/theme-img/da-projects-front-5.png`,
    `${BASE}img/theme-img/da-projects-front-6.png`,
    `${BASE}img/theme-img/da-projects-front-7.png`,
    `${BASE}img/theme-img/da-projects-front-8.png`,
    `${BASE}img/theme-img/da-projects-front-9.png`,
    `${BASE}img/theme-img/da-projects-front-10.png`,
    `${BASE}img/theme-img/da-projects-front-11.png`,
    `${BASE}img/theme-img/da-projects-front-12.png`,
    `${BASE}img/theme-img/da-projects-front-13.png`,
    `${BASE}img/theme-img/da-projects-front-14.png`,
    `${BASE}img/theme-img/da-projects-front-15.png`,
    `${BASE}img/theme-img/da-projects-front-16.png`,
    `${BASE}img/theme-img/da-projects-front-17.png`,
  ],
};

/**
 * Theme-specific draw illustration used for tied matches.
 */
export const DRAW_IMAGE_BY_THEME: Record<string, string> = {
  "Code vibes theme": `${BASE}img/draw-code-vibes-theme.png`,
  "Gaming theme": `${BASE}img/draw-gaming-theme.png`,
  "DA Projects theme": `${BASE}img/draw-da-projects-theme.png`,
};

/**
 * Palette used for confetti pieces on the result screen.
 */
export const CONFETTI_COLORS = [
  "#f58e39",
  "#2bb1ff",
  "#ff4d4d",
  "#4dff91",
  "#ffe600",
  "#c44dff",
];
/**
 * Number of confetti pieces rendered for the celebration effect.
 */
export const CONFETTI_COUNT = 60;

interface RuntimeState {
  cards: CardModel[];
  currentPlayer: Player;
  activeCardBackImage: string;
  activeTheme: string;
  lockBoard: boolean;
  firstCardId: number | null;
  secondCardId: number | null;
  matchedPairs: number;
  scores: Record<Player, number>;
}

/**
 * Mutable runtime state shared across the game modules.
 */
export const RUNTIME: RuntimeState = {
  cards: [] as CardModel[],
  currentPlayer: DEFAULT_PLAYER,
  activeCardBackImage: CARD_BACK_BY_THEME[DEFAULT_THEME],
  activeTheme: DEFAULT_THEME,
  lockBoard: false,
  firstCardId: null as number | null,
  secondCardId: null as number | null,
  matchedPairs: 0,
  scores: { Blue: 0, Orange: 0 } as Record<Player, number>,
};
