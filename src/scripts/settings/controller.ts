import {
  BACK_TO_GAME_BUTTON,
  BOARD_SIZE_INPUTS,
  DEFAULT_BOARD_SIZE,
  DEFAULT_PLAYER,
  DEFAULT_THEME,
  GAME_IN_PROGRESS_STORAGE_KEY,
  SettingsSelection,
  getAvailableThemes,
  NAV_BOARD_SIZE_VALUE,
  NAV_PLAYER_VALUE,
  NAV_THEME_VALUE,
  PLAYER_INPUTS,
  START_BUTTON,
  syncCheckedInput,
  THEME_INPUTS,
} from "./shared";
import { applyThemePreview, setPlayer, setTheme } from "./preview";

function setNavValue(element: HTMLElement | null, value: string | null): void {
  if (element) {
    element.textContent = value ?? "—";
  }
}

function updateSettingsNavSelection(theme: string | null, player: string | null, boardSize: string | null): void {
  setNavValue(NAV_THEME_VALUE, theme);
  setNavValue(NAV_PLAYER_VALUE, player);
  setNavValue(NAV_BOARD_SIZE_VALUE, boardSize);
}

function setBoardSize(boardSize: string): string {
  localStorage.setItem("boardSize", boardSize);
  return boardSize;
}

function updateSettingsNavFromInputs(): void {
  const checkedTheme =
    Array.from(THEME_INPUTS).find((i) => i.checked)?.value ?? null;
  const checkedPlayer =
    Array.from(PLAYER_INPUTS).find((i) => i.checked)?.value ?? null;
  const checkedBoardSize =
    Array.from(BOARD_SIZE_INPUTS).find((i) => i.checked)?.value ?? null;

  updateSettingsNavSelection(checkedTheme, checkedPlayer, checkedBoardSize);
}

function getStoredSelectionValue(
  storageKey: string,
  inputs: NodeListOf<HTMLInputElement>,
  fallbackValue: string
): string {
  const storedValue = localStorage.getItem(storageKey);

  return storedValue &&
    Array.from(inputs).some((input) => input.value === storedValue)
    ? storedValue
    : fallbackValue;
}

function getInitialSelection(): SettingsSelection {
  return {
    theme: getStoredTheme(),
    player: getStoredSelectionValue("player", PLAYER_INPUTS, DEFAULT_PLAYER),
    boardSize: getStoredSelectionValue(
      "boardSize",
      BOARD_SIZE_INPUTS,
      DEFAULT_BOARD_SIZE
    ),
  };
}

function getStoredTheme(): string {
  const availableThemes = getAvailableThemes();
  const storedTheme = localStorage.getItem("theme");

  return storedTheme && availableThemes.includes(storedTheme)
    ? storedTheme
    : DEFAULT_THEME;
}

function applyInitialSelection(selection: SettingsSelection): void {
  applyCheckedSelection(THEME_INPUTS, selection.theme, setTheme);
  applyCheckedSelection(PLAYER_INPUTS, selection.player, setPlayer);
  applyCheckedSelection(BOARD_SIZE_INPUTS, selection.boardSize, setBoardSize);
  updateSettingsNavSelection(
    selection.theme,
    selection.player,
    selection.boardSize
  );
}

function applyCheckedSelection(
  inputs: NodeListOf<HTMLInputElement>,
  value: string,
  onSelect: (value: string) => string
): void {
  onSelect(value);
  syncCheckedInput(inputs, value);
}

function bindInputChange(
  inputs: NodeListOf<HTMLInputElement>,
  onCheckedChange: (value: string) => void
): void {
  inputs.forEach((input) => {
    input.addEventListener("change", () => handleCheckedInput(input, onCheckedChange));
  });
}

function handleCheckedInput(
  input: HTMLInputElement,
  onCheckedChange: (value: string) => void
): void {
  if (!input.checked) {
    return;
  }

  onCheckedChange(input.value);
  updateSettingsNavFromInputs();
  updateStartButtonState();
}

function restoreSelectedThemePreview(): void {
  const selectedTheme =
    Array.from(THEME_INPUTS).find((input) => input.checked)?.value ??
    DEFAULT_THEME;

  applyThemePreview(selectedTheme);
}

function bindThemeHoverListeners(
  input: HTMLInputElement,
  previewTheme: () => void
): void {
  const inputContainer = input.closest(".input-container");

  if (inputContainer) {
    bindThemeHoverEvents(inputContainer, previewTheme);
    return;
  }

  bindThemeHoverEvents(input, previewTheme);
}

function bindThemeHoverEvents(
  element: Element,
  previewTheme: () => void
): void {
  element.addEventListener("mouseenter", previewTheme);
  element.addEventListener("mouseleave", restoreSelectedThemePreview);
}

function bindThemePreviewListener(input: HTMLInputElement): void {
  const previewTheme = (): void => applyThemePreview(input.value);
  bindThemeHoverListeners(input, previewTheme);
  input.addEventListener("focus", previewTheme);
  input.addEventListener("blur", restoreSelectedThemePreview);
}

function bindThemePreviewListeners(): void {
  THEME_INPUTS.forEach((input) => {
    bindThemePreviewListener(input);
  });
}

function bindStartButtonListener(): void {
  if (!START_BUTTON) {
    return;
  }

  START_BUTTON.addEventListener("click", () => {
    window.location.href = "./game.html";
  });
}

function bindSettingsListeners(): void {
  bindThemePreviewListeners();
  bindInputChange(THEME_INPUTS, setTheme);
  bindInputChange(PLAYER_INPUTS, setPlayer);
  bindInputChange(BOARD_SIZE_INPUTS, setBoardSize);
  bindStartButtonListener();
}

function shouldShowBackToGameButton(): boolean {
  const fromGame = new URLSearchParams(window.location.search).get("fromGame");
  const hasGameInProgress =
    sessionStorage.getItem(GAME_IN_PROGRESS_STORAGE_KEY) === "true";

  return fromGame === "1" || hasGameInProgress;
}

function isAllSettingsSelected(): boolean {
  const hasTheme = Array.from(THEME_INPUTS).some((input) => input.checked);
  const hasPlayer = Array.from(PLAYER_INPUTS).some((input) => input.checked);
  const hasBoardSize = Array.from(BOARD_SIZE_INPUTS).some(
    (input) => input.checked
  );

  return hasTheme && hasPlayer && hasBoardSize;
}

function updateStartButtonState(): void {
  if (!START_BUTTON) {
    return;
  }

  const isEnabled = isAllSettingsSelected();

  START_BUTTON.disabled = !isEnabled;
}

function initBackToGameButton(): void {
  if (!BACK_TO_GAME_BUTTON) {
    return;
  }

  if (shouldShowBackToGameButton()) {
    BACK_TO_GAME_BUTTON.hidden = false;
    return;
  }

  BACK_TO_GAME_BUTTON.hidden = true;
}

/**
 * Initializes the settings page from stored values and binds all UI listeners.
 */
export function initSettings(): void {
  if (!THEME_INPUTS.length) {
    return;
  }

  initBackToGameButton();
  const initialSelection = getInitialSelection();
  applyInitialSelection(initialSelection);
  bindSettingsListeners();
  updateStartButtonState();
}
