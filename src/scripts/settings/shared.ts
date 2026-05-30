const BASE = import.meta.env.BASE_URL;

export interface ThemePreview {
  card1: string;
  card2: string;
}

export interface SettingsSelection {
  theme: string;
  player: string;
  boardSize: string;
}

export const themePreviewMap: Record<string, ThemePreview> = {
  "Code vibes theme": {
    card1: `${BASE}themes/code-vibes-card-1.svg`,
    card2: `${BASE}themes/code-vibes-card-2.png`,
  },
  "Gaming theme": {
    card1: `${BASE}themes/gaming-card-1.png`,
    card2: `${BASE}themes/gaming-card-3.png`,
  },
  "DA Projects theme": {
    card1: `${BASE}themes/da-projects-card-1.png`,
    card2: `${BASE}themes/da-projects-card-2.png`,
  },
};

export const themeInputs = document.querySelectorAll(
  'input[name="theme-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

export const playerInputs = document.querySelectorAll(
  'input[name="player-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

export const boardSizeInputs = document.querySelectorAll(
  'input[name="board-size-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

export const themeSection = document.querySelector(
  ".theme-section"
) as HTMLElement | null;

export const previewCard1 = document.querySelector(
  ".preview-card--1"
) as HTMLImageElement | null;

export const previewCard2 = document.querySelector(
  ".preview-card--2"
) as HTMLImageElement | null;

export const currentPlayerIcon = document.querySelector(
  "[data-preview-current-player-icon]"
) as HTMLImageElement | null;

export const currentPlayerIconWrapper = document.querySelector(
  ".current-player-content-img"
) as HTMLElement | null;

export const previewBluePlayerIcon = document.querySelector(
  '[data-preview-player-icon="Blue"]'
) as HTMLImageElement | null;

export const previewOrangePlayerIcon = document.querySelector(
  '[data-preview-player-icon="Orange"]'
) as HTMLImageElement | null;

export const navThemeValue = document.querySelector(
  '[data-settings-nav="theme"] .settings-nav__value'
) as HTMLElement | null;

export const navPlayerValue = document.querySelector(
  '[data-settings-nav="player"] .settings-nav__value'
) as HTMLElement | null;

export const navBoardSizeValue = document.querySelector(
  '[data-settings-nav="board-size"] .settings-nav__value'
) as HTMLElement | null;

export const backToGameButton = document.querySelector(
  "[data-back-to-game]"
) as HTMLAnchorElement | null;

export const startButton = document.querySelector(
  "[data-start-button]"
) as HTMLAnchorElement | null;

export const settingsHeader = document.querySelector(
  ".settings-header"
) as HTMLElement | null;

export const defaultTheme = "Code vibes theme";
export const defaultPlayer = "Blue";
export const defaultBoardSize = "16";
export const GAME_IN_PROGRESS_STORAGE_KEY = "memoryGameInProgress";

export const defaultPlayerIcons: Record<string, string> = {
  Blue: `${BASE}img/label_blue.svg`,
  Orange: `${BASE}img/label2.svg`,
};

export const playerIconsByTheme: Record<string, Record<string, string>> = {
  "Code vibes theme": defaultPlayerIcons,
  "Gaming theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
  "DA Projects theme": {
    Blue: `${BASE}img/player_blue.png`,
    Orange: `${BASE}img/player-orange.png`,
  },
};

export function getCheckedValue(
  inputs: NodeListOf<HTMLInputElement>,
  fallbackValue: string
): string {
  const checkedInput = Array.from(inputs).find((input) => input.checked);
  return checkedInput?.value ?? fallbackValue;
}

export function syncCheckedInput(
  inputs: NodeListOf<HTMLInputElement>,
  value: string
) {
  inputs.forEach((input) => {
    input.checked = input.value === value;
  });
}

export function getAvailableThemes(): string[] {
  return Array.from(themeInputs).map((input) => input.value);
}
