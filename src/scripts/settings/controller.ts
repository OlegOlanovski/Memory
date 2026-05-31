import {
  GAME_IN_PROGRESS_STORAGE_KEY,
  SettingsSelection,
  backToGameButton,
  boardSizeInputs,
  defaultBoardSize,
  defaultPlayer,
  defaultTheme,
  getAvailableThemes,
  navBoardSizeValue,
  navPlayerValue,
  navThemeValue,
  playerInputs,
  startButton,
  syncCheckedInput,
  themeInputs,
} from "./shared";
import { applyThemePreview, setPlayer, setTheme } from "./preview";

function updateSettingsNavSelection(
  theme: string | null,
  player: string | null,
  boardSize: string | null
) {
  if (navThemeValue) {
    navThemeValue.textContent = theme ?? "—";
  }
  if (navPlayerValue) {
    navPlayerValue.textContent = player ?? "—";
  }
  if (navBoardSizeValue) {
    navBoardSizeValue.textContent = boardSize ?? "—";
  }
}

function setBoardSize(boardSize: string): string {
  localStorage.setItem("boardSize", boardSize);
  return boardSize;
}

function updateSettingsNavFromInputs() {
  const checkedTheme =
    Array.from(themeInputs).find((i) => i.checked)?.value ?? null;
  const checkedPlayer =
    Array.from(playerInputs).find((i) => i.checked)?.value ?? null;
  const checkedBoardSize =
    Array.from(boardSizeInputs).find((i) => i.checked)?.value ?? null;

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
  const availableThemes = getAvailableThemes();
  const storedTheme = localStorage.getItem("theme");

  return {
    theme:
      storedTheme && availableThemes.includes(storedTheme)
        ? storedTheme
        : defaultTheme,
    player: getStoredSelectionValue("player", playerInputs, defaultPlayer),
    boardSize: getStoredSelectionValue(
      "boardSize",
      boardSizeInputs,
      defaultBoardSize
    ),
  };
}

function applyInitialSelection(selection: SettingsSelection) {
  setTheme(selection.theme);
  syncCheckedInput(themeInputs, selection.theme);

  setPlayer(selection.player);
  syncCheckedInput(playerInputs, selection.player);

  setBoardSize(selection.boardSize);
  syncCheckedInput(boardSizeInputs, selection.boardSize);

  updateSettingsNavSelection(
    selection.theme,
    selection.player,
    selection.boardSize
  );
}

function bindInputChange(
  inputs: NodeListOf<HTMLInputElement>,
  onCheckedChange: (value: string) => void
) {
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) {
        return;
      }

      onCheckedChange(input.value);
      updateSettingsNavFromInputs();
      updateStartButtonState();
    });
  });
}

function restoreSelectedThemePreview() {
  const selectedTheme =
    Array.from(themeInputs).find((input) => input.checked)?.value ??
    defaultTheme;

  applyThemePreview(selectedTheme);
}

function bindThemeHoverListeners(
  input: HTMLInputElement,
  previewTheme: () => void
) {
  const inputContainer = input.closest(".input-container");

  if (inputContainer) {
    inputContainer.addEventListener("mouseenter", previewTheme);
    inputContainer.addEventListener("mouseleave", restoreSelectedThemePreview);
    return;
  }

  input.addEventListener("mouseenter", previewTheme);
  input.addEventListener("mouseleave", restoreSelectedThemePreview);
}

function bindThemePreviewListener(input: HTMLInputElement) {
  const previewTheme = () => {
    applyThemePreview(input.value);
  };

  bindThemeHoverListeners(input, previewTheme);
  input.addEventListener("focus", previewTheme);
  input.addEventListener("blur", restoreSelectedThemePreview);
}

function bindThemePreviewListeners() {
  themeInputs.forEach((input) => {
    bindThemePreviewListener(input);
  });
}

function bindStartButtonListener() {
  if (!startButton) {
    return;
  }

  const button = startButton;

  button.addEventListener("click", (event) => {
    if (button.hasAttribute("disabled")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

function bindSettingsListeners() {
  bindThemePreviewListeners();

  bindInputChange(themeInputs, (value) => {
    setTheme(value);
  });

  bindInputChange(playerInputs, (value) => {
    setPlayer(value);
  });

  bindInputChange(boardSizeInputs, (value) => {
    setBoardSize(value);
  });

  bindStartButtonListener();
}

function shouldShowBackToGameButton(): boolean {
  const fromGame = new URLSearchParams(window.location.search).get("fromGame");
  const hasGameInProgress =
    sessionStorage.getItem(GAME_IN_PROGRESS_STORAGE_KEY) === "true";

  return fromGame === "1" || hasGameInProgress;
}

function isAllSettingsSelected(): boolean {
  const hasTheme = Array.from(themeInputs).some((input) => input.checked);
  const hasPlayer = Array.from(playerInputs).some((input) => input.checked);
  const hasBoardSize = Array.from(boardSizeInputs).some(
    (input) => input.checked
  );

  return hasTheme && hasPlayer && hasBoardSize;
}

function updateStartButtonState(): void {
  if (!startButton) {
    return;
  }

  const isEnabled = isAllSettingsSelected();

  if (isEnabled) {
    startButton.removeAttribute("disabled");
  } else {
    startButton.setAttribute("disabled", "");
  }
}

function initBackToGameButton() {
  if (!backToGameButton) {
    return;
  }

  if (shouldShowBackToGameButton()) {
    backToGameButton.hidden = false;
    return;
  }

  backToGameButton.hidden = true;
}

export function initSettings() {
  if (!themeInputs.length) {
    return;
  }

  initBackToGameButton();
  bindSettingsListeners();
  updateSettingsNavFromInputs();
  updateStartButtonState();

  if (shouldShowBackToGameButton()) {
    const initialSelection = getInitialSelection();
    applyInitialSelection(initialSelection);
  }
}
