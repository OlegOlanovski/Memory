import {
  currentPlayerIcon,
  currentPlayerIconWrapper,
  defaultPlayer,
  defaultPlayerIcons,
  playerIconsByTheme,
  playerInputs,
  previewBluePlayerIcon,
  previewCard1,
  previewCard2,
  previewOrangePlayerIcon,
  settingsHeader,
  themePreviewMap,
  themeSection,
  getCheckedValue,
} from "./shared";

function applyTheme(theme: string) {
  if (themeSection) {
    themeSection.setAttribute("data-theme", theme);
  }

  if (settingsHeader) {
    settingsHeader.setAttribute("data-theme", theme);
  }
}

function applyPreviewImages(theme: string) {
  const preview = themePreviewMap[theme];
  if (!preview) return;

  if (previewCard1) {
    previewCard1.src = preview.card1;
    previewCard1.alt = `${theme} card 1`;
  }

  if (previewCard2) {
    previewCard2.src = preview.card2;
    previewCard2.alt = `${theme} card 2`;
  }
}

function getPlayerIconsForTheme(theme: string): Record<string, string> {
  return playerIconsByTheme[theme] ?? defaultPlayerIcons;
}

function updatePreviewScoreIcons(playerIcons: Record<string, string>) {
  if (previewBluePlayerIcon) {
    previewBluePlayerIcon.src = playerIcons.Blue;
    previewBluePlayerIcon.alt = "Blue marker";
  }

  if (previewOrangePlayerIcon) {
    previewOrangePlayerIcon.src = playerIcons.Orange;
    previewOrangePlayerIcon.alt = "Orange marker";
  }
}

function updateCurrentPreviewPlayerIcon(
  playerIcons: Record<string, string>,
  selectedPlayer: string
) {
  if (!currentPlayerIcon) {
    return;
  }

  const currentPlayerIconSrc = playerIcons[selectedPlayer] ?? playerIcons.Blue;
  currentPlayerIcon.src = currentPlayerIconSrc;
  currentPlayerIcon.alt = `${selectedPlayer} player icon`;
}

function updateCurrentPreviewPlayerWrapper(selectedPlayer: string) {
  if (currentPlayerIconWrapper) {
    currentPlayerIconWrapper.setAttribute("data-player", selectedPlayer);
  }
}

function applyPreviewPlayerIcons(theme: string, selectedPlayer: string) {
  const playerIcons = getPlayerIconsForTheme(theme);
  updatePreviewScoreIcons(playerIcons);
  updateCurrentPreviewPlayerIcon(playerIcons, selectedPlayer);
  updateCurrentPreviewPlayerWrapper(selectedPlayer);
}

export function applyThemePreview(theme: string) {
  applyTheme(theme);
  applyPreviewImages(theme);
  applyPreviewPlayerIcons(theme, getCheckedValue(playerInputs, defaultPlayer));
}

export function setTheme(theme: string): string {
  applyThemePreview(theme);
  localStorage.setItem("theme", theme);
  return theme;
}

export function setPlayer(player: string): string {
  const theme = localStorage.getItem("theme");
  applyPreviewPlayerIcons(theme ?? defaultPlayer, player);

  localStorage.setItem("player", player);
  return player;
}
