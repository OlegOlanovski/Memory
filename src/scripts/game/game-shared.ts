const BASE = import.meta.env.BASE_URL;

export type Player = "Blue" | "Orange";

export interface CardModel {
  id: number;
  pairId: number;
  value: string;
  state: "hidden" | "revealed" | "matched";
}

export interface GameStateSnapshot {
  theme: string;
  boardSize: number;
  currentPlayer: Player;
  cards: CardModel[];
  scores: Record<Player, number>;
  matchedPairs: number;
  statusText: string;
}

export const gameRoot = document.querySelector(
  ".game-page"
) as HTMLElement | null;
export const boardElement = document.querySelector(
  "[data-game-grid]"
) as HTMLElement | null;
export const statusElement = document.querySelector(
  "[data-game-status]"
) as HTMLElement | null;
export const currentPlayerIconElement = document.querySelector(
  "[data-current-player-icon]"
) as HTMLImageElement | null;
export const currentPlayerNameElement = document.querySelector(
  "[data-current-player-name]"
) as HTMLElement | null;
export const blueScoreElement = document.querySelector(
  '[data-score="Blue"]'
) as HTMLElement | null;
export const orangeScoreElement = document.querySelector(
  '[data-score="Orange"]'
) as HTMLElement | null;
export const blueScoreIconElement = document.querySelector(
  '[data-score-icon="Blue"]'
) as HTMLImageElement | null;
export const orangeScoreIconElement = document.querySelector(
  '[data-score-icon="Orange"]'
) as HTMLImageElement | null;
export const gameoverIntroOverlay = document.querySelector(
  "[data-gameover-intro]"
) as HTMLElement | null;
export const gameoverBlueScoreIconElement = document.querySelector(
  '[data-gameover-score-icon="Blue"]'
) as HTMLImageElement | null;
export const gameoverOrangeScoreIconElement = document.querySelector(
  '[data-gameover-score-icon="Orange"]'
) as HTMLImageElement | null;
export const gameoverBlueScore = document.querySelector(
  '[data-gameover-score="Blue"]'
) as HTMLElement | null;
export const gameoverOrangeScore = document.querySelector(
  '[data-gameover-score="Orange"]'
) as HTMLElement | null;
export const gameOverOverlay = document.querySelector(
  "[data-game-over]"
) as HTMLElement | null;
export const winnerIconElement = document.querySelector(
  "[data-winner-icon]"
) as HTMLImageElement | null;
export const winnerNameElement = document.querySelector(
  "[data-winner-name]"
) as HTMLElement | null;
export const winnerPawnElement = document.querySelector(
  "[data-winner-pawn]"
) as HTMLImageElement | null;
export const winnerDrawIconElement = document.querySelector(
  "[data-winner-draw-icon]"
) as HTMLImageElement | null;
export const winnerSubtitleElement = document.querySelector(
  "[data-winner-subtitle]"
) as HTMLElement | null;
export const confettiContainer = document.querySelector(
  "[data-confetti]"
) as HTMLElement | null;

export const GAME_OVER_INTRO_MS = 2000;
export const GAME_OVER_DISPLAY_MS = 4000;
export const GAME_IN_PROGRESS_STORAGE_KEY = "memoryGameInProgress";
export const GAME_STATE_STORAGE_KEY = "memoryGameState";
export const defaultTheme = "Code vibes theme";
export const defaultPlayer: Player = "Blue";
export const defaultBoardSize = 16;

export const defaultPlayerIconMap: Record<Player, string> = {
  Blue: `${BASE}img/label_blue.svg`,
  Orange: `${BASE}img/label2.svg`,
};

export const playerIconMapByTheme: Record<string, Record<Player, string>> = {
  "Code vibes theme": defaultPlayerIconMap,
  "Gaming theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
  "DA Projects theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
};

export const winnerPawnMap: Record<Player, string> = {
  Blue: `${BASE}img/player_blue.png`,
  Orange: `${BASE}img/player-orange.png`,
};

export const winnerImageMapByTheme: Record<string, Record<Player, string>> = {
  "Code vibes theme": winnerPawnMap,
  "Gaming theme": {
    Blue: `${BASE}img/pokal.png`,
    Orange: `${BASE}img/pokal.png`,
  },
  "DA Projects theme": winnerPawnMap,
};

export const cardBackByTheme: Record<string, string> = {
  "Code vibes theme": `${BASE}themes/code-vibes-card-1.svg`,
  "Gaming theme": `${BASE}themes/gaming-card-1.png`,
  "DA Projects theme": `${BASE}themes/da-projects-card-1.png`,
};

export const cardFrontByTheme: Record<string, string[]> = {
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

export const CONFETTI_COLORS = [
  "#f58e39",
  "#2bb1ff",
  "#ff4d4d",
  "#4dff91",
  "#ffe600",
  "#c44dff",
];
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

export const runtime: RuntimeState = {
  cards: [] as CardModel[],
  currentPlayer: defaultPlayer,
  activeCardBackImage: cardBackByTheme[defaultTheme],
  activeTheme: defaultTheme,
  lockBoard: false,
  firstCardId: null as number | null,
  secondCardId: null as number | null,
  matchedPairs: 0,
  scores: { Blue: 0, Orange: 0 } as Record<Player, number>,
};
