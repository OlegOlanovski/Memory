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
import { applyThemePreview, clearThemePreview, setPlayer, setTheme } from "./preview";

/**
 * Writes a single summary value into the settings footer.
 *
 * @param element Footer element that should receive the summary text.
 * @param value Selected value or `null` when the field should be cleared.
 */
function setNavValue(element: HTMLElement | null, value: string | null): void {
  if (element) {
    element.textContent = value ?? "";
  }
}

/**
 * Updates all summary values in the settings footer.
 *
 * @param theme Selected theme label.
 * @param player Selected player label.
 * @param boardSize Selected board-size label.
 */
function updateSettingsNavSelection(theme: string | null, player: string | null, boardSize: string | null): void {
  setNavValue(NAV_THEME_VALUE, theme);
  setNavValue(NAV_PLAYER_VALUE, player);
  setNavValue(NAV_BOARD_SIZE_VALUE, boardSize);
}

/**
 * Persists the selected board size.
 *
 * @param boardSize Selected board-size value from the radio group.
 * @returns The same board-size value for chaining with generic handlers.
 */
function setBoardSize(boardSize: string): string {
  localStorage.setItem("boardSize", boardSize);
  return boardSize;
}

/**
 * Refreshes the settings summary from the currently checked inputs.
 */
function updateSettingsNavFromInputs(): void {
  const checkedTheme =
    Array.from(THEME_INPUTS).find((i) => i.checked)?.value ?? null;
  const checkedPlayer =
    Array.from(PLAYER_INPUTS).find((i) => i.checked)?.value ?? null;
  const checkedBoardSize =
    Array.from(BOARD_SIZE_INPUTS).find((i) => i.checked)?.value ?? null;

  updateSettingsNavSelection(checkedTheme, checkedPlayer, checkedBoardSize);
}

/**
 * Reads a stored selection when it still matches one of the available inputs.
 *
 * @param storageKey Local-storage key for the selection group.
 * @param inputs Radio inputs that define the allowed values.
 * @param fallbackValue Default value used when storage is missing or invalid.
 * @returns Stored valid value or the provided fallback.
 */
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

/**
 * Builds the stored settings selection used when restoring a running game.
 *
 * @returns Complete settings selection restored from storage or defaults.
 */
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

/**
 * Returns the persisted theme or the default theme when missing or invalid.
 *
 * @returns Valid stored theme name or the default theme.
 */
function getStoredTheme(): string {
  const availableThemes = getAvailableThemes();
  const storedTheme = localStorage.getItem("theme");

  return storedTheme && availableThemes.includes(storedTheme)
    ? storedTheme
    : DEFAULT_THEME;
}

/**
 * Clears the checked state of a radio input group.
 *
 * @param inputs Radio inputs that should all be unchecked.
 */
function clearSelection(inputs: NodeListOf<HTMLInputElement>): void {
  inputs.forEach((input) => {
    input.checked = false;
  });
}

/**
 * Removes all persisted settings values from local storage.
 */
function clearStoredSelection(): void {
  localStorage.removeItem("theme");
  localStorage.removeItem("player");
  localStorage.removeItem("boardSize");
}

/**
 * Resets the page to the default first theme with no player or board size selected.
 */
function resetSettingsSelection(): void {
  clearStoredSelection();
  clearSelection(PLAYER_INPUTS);
  clearSelection(BOARD_SIZE_INPUTS);
  const defaultTheme = THEME_INPUTS[0]?.value ?? DEFAULT_THEME;

  applyCheckedSelection(THEME_INPUTS, defaultTheme, setTheme);
  updateSettingsNavSelection(defaultTheme, null, null);
}

/**
 * Applies a stored selection to the radio inputs and summary.
 *
 * @param selection Selection payload restored from storage.
 */
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

/**
 * Runs a selection handler and syncs the checked input state.
 *
 * @param inputs Radio inputs belonging to the selection group.
 * @param value Value that should become selected.
 * @param onSelect Handler that persists and reacts to the selected value.
 */
function applyCheckedSelection(
  inputs: NodeListOf<HTMLInputElement>,
  value: string,
  onSelect: (value: string) => string
): void {
  onSelect(value);
  syncCheckedInput(inputs, value);
}

/**
 * Binds change listeners to a radio input group.
 *
 * @param inputs Radio inputs that should react to user changes.
 * @param onCheckedChange Handler called for the newly checked value.
 */
function bindInputChange(
  inputs: NodeListOf<HTMLInputElement>,
  onCheckedChange: (value: string) => void
): void {
  inputs.forEach((input) => {
    input.addEventListener("change", () => handleCheckedInput(input, onCheckedChange));
  });
}

/**
 * Handles one checked input change and updates the dependent UI state.
 *
 * @param input Radio input that fired the change event.
 * @param onCheckedChange Handler called for the checked value.
 */
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

/**
 * Restores the preview area to the currently selected theme after hover/focus previews.
 */
function restoreSelectedThemePreview(): void {
  const selectedTheme = Array.from(THEME_INPUTS).find(
    (input) => input.checked
  )?.value;

  if (!selectedTheme) {
    clearThemePreview();
    return;
  }

  applyThemePreview(selectedTheme);
}

/**
 * Binds hover preview behavior to the nearest interactive container for one theme input.
 *
 * @param input Theme radio input whose hover behavior is being bound.
 * @param previewTheme Callback that applies the temporary theme preview.
 */
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

/**
 * Registers hover events that temporarily preview a theme.
 *
 * @param element Element that should respond to hover interactions.
 * @param previewTheme Callback that applies the temporary theme preview.
 */
function bindThemeHoverEvents(
  element: Element,
  previewTheme: () => void
): void {
  element.addEventListener("mouseenter", previewTheme);
  element.addEventListener("mouseleave", restoreSelectedThemePreview);
}

/**
 * Binds hover and focus preview behavior for one theme radio input.
 *
 * @param input Theme radio input whose preview events should be registered.
 */
function bindThemePreviewListener(input: HTMLInputElement): void {
  const previewTheme = (): void => applyThemePreview(input.value);
  bindThemeHoverListeners(input, previewTheme);
  input.addEventListener("focus", previewTheme);
  input.addEventListener("blur", restoreSelectedThemePreview);
}

/**
 * Binds preview interactions for all theme options.
 */
function bindThemePreviewListeners(): void {
  THEME_INPUTS.forEach((input) => {
    bindThemePreviewListener(input);
  });
}

/**
 * Opens the game page when the Start button is pressed.
 */
function bindStartButtonListener(): void {
  if (!START_BUTTON) {
    return;
  }

  START_BUTTON.addEventListener("click", () => {
    window.location.href = "./game.html";
  });
}

/**
 * Binds all interactive listeners required by the settings page.
 */
function bindSettingsListeners(): void {
  bindThemePreviewListeners();
  bindInputChange(THEME_INPUTS, setTheme);
  bindInputChange(PLAYER_INPUTS, setPlayer);
  bindInputChange(BOARD_SIZE_INPUTS, setBoardSize);
  bindStartButtonListener();
}

/**
 * Reports whether the back-to-game button should be visible.
 *
 * @returns `true` when a running game can be resumed from settings.
 */
function shouldShowBackToGameButton(): boolean {
  const fromGame = new URLSearchParams(window.location.search).get("fromGame");
  const hasGameInProgress =
    sessionStorage.getItem(GAME_IN_PROGRESS_STORAGE_KEY) === "true";

  return fromGame === "1" || hasGameInProgress;
}

/**
 * Uses the same condition as the back button to decide whether selections should be restored.
 */
function shouldRestoreStoredSelection(): boolean {
  return shouldShowBackToGameButton();
}

/**
 * Checks whether theme, player, and board size have all been selected.
 *
 * @returns `true` when the Start button can be enabled.
 */
function isAllSettingsSelected(): boolean {
  const hasTheme = Array.from(THEME_INPUTS).some((input) => input.checked);
  const hasPlayer = Array.from(PLAYER_INPUTS).some((input) => input.checked);
  const hasBoardSize = Array.from(BOARD_SIZE_INPUTS).some(
    (input) => input.checked
  );

  return hasTheme && hasPlayer && hasBoardSize;
}

/**
 * Enables or disables the Start button based on selection completeness.
 */
function updateStartButtonState(): void {
  if (!START_BUTTON) {
    return;
  }

  const isEnabled = isAllSettingsSelected();

  START_BUTTON.disabled = !isEnabled;
}

/**
 * Shows the back-to-game button only when a running match can be resumed.
 */
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
 *
 * @returns Nothing. Exits early when the page does not contain theme inputs.
 */
export function initSettings(): void {
  if (!THEME_INPUTS.length) {
    return;
  }

  initBackToGameButton();

  if (shouldRestoreStoredSelection()) {
    const initialSelection = getInitialSelection();
    applyInitialSelection(initialSelection);
  } else {
    resetSettingsSelection();
  }

  bindSettingsListeners();
  updateStartButtonState();
}
