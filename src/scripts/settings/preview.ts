import {
  CURRENT_PLAYER_ICON,
  CURRENT_PLAYER_ICON_WRAPPER,
  DEFAULT_THEME,
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

/**
 * Applies the selected theme token to the preview container.
 *
 * @param theme Theme name that should be reflected in preview styling.
 */
function applyTheme(theme: string): void {
  if (THEME_SECTION) {
    THEME_SECTION.setAttribute("data-theme", theme);
  }
}

/**
 * Updates both preview card images for the selected theme.
 *
 * @param theme Theme name used to look up preview assets.
 */
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

/**
 * Resolves the player icon mapping for the given theme.
 *
 * @param theme Theme name used to resolve the correct player icons.
 * @returns Player icon sources keyed by player name.
 */
function getPlayerIconsForTheme(theme: string): Record<string, string> {
  return PLAYER_ICONS_BY_THEME[theme] ?? DEFAULT_PLAYER_ICONS;
}

/**
 * Writes one preview score icon when the element exists.
 *
 * @param element Score icon element to update.
 * @param src Image source that should be applied.
 * @param alt Accessible alternative text for the icon.
 */
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

/**
 * Updates both preview score icons for the selected theme.
 *
 * @param playerIcons Player icon sources for the active theme.
 */
function updatePreviewScoreIcons(playerIcons: Record<string, string>): void {
  setPreviewScoreIcon(PREVIEW_BLUE_PLAYER_ICON, playerIcons.Blue, "Blue marker");
  setPreviewScoreIcon(
    PREVIEW_ORANGE_PLAYER_ICON,
    playerIcons.Orange,
    "Orange marker"
  );
}

/**
 * Updates the current-player preview icon for the selected player.
 *
 * @param playerIcons Player icon sources for the active theme.
 * @param selectedPlayer Player currently selected in settings.
 */
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

/**
 * Applies the selected player token to the current-player preview wrapper.
 *
 * @param selectedPlayer Player currently selected in settings.
 */
function updateCurrentPreviewPlayerWrapper(selectedPlayer: string): void {
  if (CURRENT_PLAYER_ICON_WRAPPER) {
    CURRENT_PLAYER_ICON_WRAPPER.setAttribute("data-player", selectedPlayer);
  }
}

/**
 * Refreshes all preview player icons for the current theme and player selection.
 *
 * @param theme Theme name used to resolve the preview assets.
 * @param selectedPlayer Player currently selected in settings.
 */
function applyPreviewPlayerIcons(theme: string, selectedPlayer: string): void {
  const playerIcons = getPlayerIconsForTheme(theme);
  updatePreviewScoreIcons(playerIcons);
  updateCurrentPreviewPlayerIcon(playerIcons, selectedPlayer);
  updateCurrentPreviewPlayerWrapper(selectedPlayer);
}

/**
 * Updates the settings preview cards and player markers for the selected theme.
 *
 * @param theme Theme name that should be previewed.
 */
export function applyThemePreview(theme: string): void {
  applyTheme(theme);
  applyPreviewImages(theme);
  applyPreviewPlayerIcons(theme, getCheckedValue(PLAYER_INPUTS, DEFAULT_PLAYER));
}

/**
 * Clears the theme preview when no theme has been selected yet.
 */
export function clearThemePreview(): void {
  if (THEME_SECTION) {
    THEME_SECTION.removeAttribute("data-theme");
  }

  if (PREVIEW_CARD_1) {
    PREVIEW_CARD_1.removeAttribute("src");
    PREVIEW_CARD_1.alt = "";
  }

  if (PREVIEW_CARD_2) {
    PREVIEW_CARD_2.removeAttribute("src");
    PREVIEW_CARD_2.alt = "";
  }
}

/**
 * Persists the selected theme and refreshes the preview area.
 *
 * @param theme Theme name selected by the user.
 * @returns The same theme value for reuse in generic handlers.
 */
export function setTheme(theme: string): string {
  applyThemePreview(theme);
  localStorage.setItem("theme", theme);
  return theme;
}

/**
 * Persists the selected player and updates the preview player marker.
 *
 * @param player Player selected by the user.
 * @returns The same player value for reuse in generic handlers.
 */
export function setPlayer(player: string): string {
  const theme = localStorage.getItem("theme");
  applyPreviewPlayerIcons(theme ?? DEFAULT_THEME, player);

  localStorage.setItem("player", player);
  return player;
}
