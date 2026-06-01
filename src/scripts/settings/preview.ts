import {
  CURRENT_PLAYER_ICON,
  CURRENT_PLAYER_ICON_WRAPPER,
  DEFAULT_PLAYER,
  DEFAULT_PLAYER_ICONS,
  PLAYER_ICONS_BY_THEME,
  PLAYER_INPUTS,
  PREVIEW_BLUE_PLAYER_ICON,
  PREVIEW_CARD_1,
  PREVIEW_CARD_2,
  PREVIEW_ORANGE_PLAYER_ICON,
  THEME_PREVIEW_MAP,
  THEME_SECTION,
  getCheckedValue,
} from "./shared";

function applyTheme(theme: string): void {
  if (THEME_SECTION) {
    THEME_SECTION.setAttribute("data-theme", theme);
  }
}

function applyPreviewImages(theme: string): void {
  const preview = THEME_PREVIEW_MAP[theme];
  if (!preview) return;

  if (PREVIEW_CARD_1) {
    PREVIEW_CARD_1.src = preview.card1;
    PREVIEW_CARD_1.alt = `${theme} card 1`;
  }

  if (PREVIEW_CARD_2) {
    PREVIEW_CARD_2.src = preview.card2;
    PREVIEW_CARD_2.alt = `${theme} card 2`;
  }
}

function getPlayerIconsForTheme(theme: string): Record<string, string> {
  return PLAYER_ICONS_BY_THEME[theme] ?? DEFAULT_PLAYER_ICONS;
}

function setPreviewScoreIcon(
  element: HTMLImageElement | null,
  src: string,
  alt: string
): void {
  if (!element) {
    return;
  }

  element.src = src;
  element.alt = alt;
}

function updatePreviewScoreIcons(playerIcons: Record<string, string>): void {
  setPreviewScoreIcon(PREVIEW_BLUE_PLAYER_ICON, playerIcons.Blue, "Blue marker");
  setPreviewScoreIcon(
    PREVIEW_ORANGE_PLAYER_ICON,
    playerIcons.Orange,
    "Orange marker"
  );
}

function updateCurrentPreviewPlayerIcon(
  playerIcons: Record<string, string>,
  selectedPlayer: string
): void {
  if (!CURRENT_PLAYER_ICON) {
    return;
  }

  const currentPlayerIconSrc = playerIcons[selectedPlayer] ?? playerIcons.Blue;
  CURRENT_PLAYER_ICON.src = currentPlayerIconSrc;
  CURRENT_PLAYER_ICON.alt = `${selectedPlayer} player icon`;
}

function updateCurrentPreviewPlayerWrapper(selectedPlayer: string): void {
  if (CURRENT_PLAYER_ICON_WRAPPER) {
    CURRENT_PLAYER_ICON_WRAPPER.setAttribute("data-player", selectedPlayer);
  }
}

function applyPreviewPlayerIcons(theme: string, selectedPlayer: string): void {
  const playerIcons = getPlayerIconsForTheme(theme);
  updatePreviewScoreIcons(playerIcons);
  updateCurrentPreviewPlayerIcon(playerIcons, selectedPlayer);
  updateCurrentPreviewPlayerWrapper(selectedPlayer);
}

/**
 * Updates the settings preview cards and player markers for the selected theme.
 */
export function applyThemePreview(theme: string): void {
  applyTheme(theme);
  applyPreviewImages(theme);
  applyPreviewPlayerIcons(theme, getCheckedValue(PLAYER_INPUTS, DEFAULT_PLAYER));
}

/**
 * Persists the selected theme and refreshes the preview area.
 */
export function setTheme(theme: string): string {
  applyThemePreview(theme);
  localStorage.setItem("theme", theme);
  return theme;
}

/**
 * Persists the selected player and updates the preview player marker.
 */
export function setPlayer(player: string): string {
  const theme = localStorage.getItem("theme");
  applyPreviewPlayerIcons(theme ?? DEFAULT_PLAYER, player);

  localStorage.setItem("player", player);
  return player;
}
