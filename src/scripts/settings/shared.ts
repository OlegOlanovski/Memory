const BASE = import.meta.env.BASE_URL;

/**
 * Preview image sources for a single theme option.
 */
export interface ThemePreview {
  card1: string;
  card2: string;
}

/**
 * Persisted settings values used to initialize the settings page.
 */
export interface SettingsSelection {
  theme: string;
  player: string;
  boardSize: string;
}

/**
 * Maps each theme to its preview card images.
 */
export const THEME_PREVIEW_MAP: Record<string, ThemePreview> = {
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

/**
 * Theme radio inputs on the settings page.
 */
export const THEME_INPUTS = document.querySelectorAll(
  'input[name="theme-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

/**
 * Player radio inputs on the settings page.
 */
export const PLAYER_INPUTS = document.querySelectorAll(
  'input[name="player-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

/**
 * Board size radio inputs on the settings page.
 */
export const BOARD_SIZE_INPUTS = document.querySelectorAll(
  'input[name="board-size-radio-btn"]'
) as NodeListOf<HTMLInputElement>;

/**
 * Theme section container used for preview styling.
 */
export const THEME_SECTION = document.querySelector(
  ".theme-section"
) as HTMLElement | null;

/**
 * First preview card image element.
 */
export const PREVIEW_CARD_1 = document.querySelector(
  ".preview-card--1"
) as HTMLImageElement | null;

/**
 * Second preview card image element.
 */
export const PREVIEW_CARD_2 = document.querySelector(
  ".preview-card--2"
) as HTMLImageElement | null;

/**
 * Current player icon displayed in the preview panel.
 */
export const CURRENT_PLAYER_ICON = document.querySelector(
  "[data-preview-current-player-icon]"
) as HTMLImageElement | null;

/**
 * Wrapper element for the current player preview icon.
 */
export const CURRENT_PLAYER_ICON_WRAPPER = document.querySelector(
  ".current-player-content-img"
) as HTMLElement | null;

/**
 * Blue player score icon in the preview panel.
 */
export const PREVIEW_BLUE_PLAYER_ICON = document.querySelector(
  '[data-preview-player-icon="Blue"]'
) as HTMLImageElement | null;

/**
 * Orange player score icon in the preview panel.
 */
export const PREVIEW_ORANGE_PLAYER_ICON = document.querySelector(
  '[data-preview-player-icon="Orange"]'
) as HTMLImageElement | null;

/**
 * Summary field for the selected theme value.
 */
export const NAV_THEME_VALUE = document.querySelector(
  '[data-settings-nav="theme"] .settings-nav__value'
) as HTMLElement | null;

/**
 * Summary field for the selected player value.
 */
export const NAV_PLAYER_VALUE = document.querySelector(
  '[data-settings-nav="player"] .settings-nav__value'
) as HTMLElement | null;

/**
 * Summary field for the selected board size value.
 */
export const NAV_BOARD_SIZE_VALUE = document.querySelector(
  '[data-settings-nav="board-size"] .settings-nav__value'
) as HTMLElement | null;

/**
 * Link back to the running game when one exists.
 */
export const BACK_TO_GAME_BUTTON = document.querySelector(
  "[data-back-to-game]"
) as HTMLAnchorElement | null;

/**
 * Start button that opens the game page.
 */
export const START_BUTTON = document.querySelector(
  "[data-start-button]"
) as HTMLButtonElement | null;

/**
 * Settings page header used for theme-specific styling.
 */
export const SETTINGS_HEADER = document.querySelector(
  ".settings-header"
) as HTMLElement | null;

/**
 * Default theme selection for the settings page.
 */
export const DEFAULT_THEME = "Code vibes theme";
/**
 * Default starting player selection.
 */
export const DEFAULT_PLAYER = "Blue";
/**
 * Default board size selection.
 */
export const DEFAULT_BOARD_SIZE = "16";
/**
 * Session storage flag that marks an unfinished game.
 */
export const GAME_IN_PROGRESS_STORAGE_KEY = "memoryGameInProgress";

/**
 * Fallback player icons used when no theme-specific override exists.
 */
export const DEFAULT_PLAYER_ICONS: Record<string, string> = {
  Blue: `${BASE}img/label_blue.svg`,
  Orange: `${BASE}img/label2.svg`,
};

/**
 * Theme-specific player icon sources for the settings preview.
 */
export const PLAYER_ICONS_BY_THEME: Record<string, Record<string, string>> = {
  "Code vibes theme": DEFAULT_PLAYER_ICONS,
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
 * Returns the checked input value or the provided fallback.
 */
export function getCheckedValue(
  inputs: NodeListOf<HTMLInputElement>,
  fallbackValue: string
): string {
  const checkedInput = Array.from(inputs).find((input) => input.checked);
  return checkedInput?.value ?? fallbackValue;
}

/**
 * Marks the matching input as checked for a persisted value.
 */
export function syncCheckedInput(
  inputs: NodeListOf<HTMLInputElement>,
  value: string
): void {
  inputs.forEach((input) => {
    input.checked = input.value === value;
  });
}

/**
 * Lists the available theme option values from the DOM.
 */
export function getAvailableThemes(): string[] {
  return Array.from(THEME_INPUTS).map((input) => input.value);
}
