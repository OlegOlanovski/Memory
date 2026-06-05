import {
  BOARD_ELEMENT,
  CARD_FRONT_BY_THEME,
  DEFAULT_THEME,
  RUNTIME,
  type CardModel,
} from "./game-shared";

const FALLBACK_CARD_ACCENT_BY_THEME: Record<string, string> = {
  "Code vibes theme": "#49baa5",
  "Gaming theme": "#e71c4f",
  "DA Projects theme": "#1e7594",
};

/**
 * Returns a shuffled copy of the provided array using Fisher-Yates.
 *
 * @param items Source array that should be copied and shuffled.
 * @returns New array instance with the same items in randomized order.
 */
function shuffle<T>(items: T[]): T[] {
  const copied = [...items];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]];
  }

  return copied;
}

/**
 * Builds a readable fallback label for generated card fronts.
 */
function buildFallbackCardLabel(theme: string, index: number): string {
  return `${theme.replace(" theme", "")} ${index + 1}`;
}

/**
 * Builds a simple inline SVG used when a themed front image is unavailable.
 */
function buildFallbackCardSvg(accentColor: string, label: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="24" fill="#1b1f23" />
      <rect x="12" y="12" width="216" height="216" rx="18" fill="${accentColor}" opacity="0.18" />
      <circle cx="120" cy="84" r="38" fill="${accentColor}" opacity="0.92" />
      <text x="120" y="160" text-anchor="middle" fill="#ffffff" font-size="26" font-family="Arial, sans-serif">
        ${label}
      </text>
    </svg>
  `;
}

/**
 * Generates a data-URL fallback front image for a missing themed card asset.
 */
function createFallbackCardFront(theme: string, index: number): string {
  const accentColor =
    FALLBACK_CARD_ACCENT_BY_THEME[theme] ??
    FALLBACK_CARD_ACCENT_BY_THEME[DEFAULT_THEME];
  const label = buildFallbackCardLabel(theme, index);
  const svg = buildFallbackCardSvg(accentColor, label);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns the list of card face values needed for the selected board size.
 *
 * @param boardSize Total number of cards required for the board.
 * @returns Array of front-face image sources sized to the pair count.
 */
function getCardValues(boardSize: number): string[] {
  const pairCount = boardSize / 2;
  const theme = RUNTIME.activeTheme;
  const themedValues =
    CARD_FRONT_BY_THEME[theme] || CARD_FRONT_BY_THEME[DEFAULT_THEME] || [];
  const values = [...themedValues];

  while (values.length < pairCount) {
    values.push(createFallbackCardFront(theme, values.length));
  }

  return values.slice(0, pairCount);
}

/**
 * Creates a pair of matching card descriptors for a given face value.
 *
 * @param value Front-face image source shared by the pair.
 * @param pairId Logical pair identifier used for matching.
 * @returns Two lightweight card descriptors with the same pair id and face.
 */
function createCardPair(value: string, pairId: number): Array<Pick<CardModel, "pairId" | "value">> {
  return [{ pairId, value }, { pairId, value }];
}

/**
 * Creates a shuffled card deck for the selected board size.
 *
 * @param boardSize Total number of cards that should appear on the board.
 * @returns Shuffled runtime deck with stable ids and hidden initial state.
 */
export function createCards(boardSize: number): CardModel[] {
  const values = getCardValues(boardSize);

  return shuffle(
    values.flatMap((value, pairId) => createCardPair(value, pairId))
  ).map((card, id) => ({
    id,
    pairId: card.pairId,
    value: card.value,
    state: "hidden",
  }));
}

/**
 * Calculates how many cards should be rendered per row for a given board size.
 *
 * @param boardSize Total number of cards that need to be split into rows.
 * @returns Array where each value represents the number of cards in one row.
 */
function getRowDistribution(boardSize: number): number[] {
  const rowCount = Number.isInteger(Math.sqrt(boardSize))
    ? Math.sqrt(boardSize)
    : Math.floor(Math.sqrt(boardSize));
  const baseRowSize = Math.floor(boardSize / rowCount);
  const remainder = boardSize % rowCount;

  return Array.from({ length: rowCount }, (_, index) =>
    baseRowSize + (index < remainder ? 1 : 0)
  );
}

/**
 * Creates the back face element for a single memory card.
 */
function createCardBackFace(): HTMLSpanElement {
  const cardBack = document.createElement("span");
  cardBack.className = "memory-card__face memory-card__face--back";

  const cardBackImage = document.createElement("img");
  cardBackImage.className = "memory-card__image memory-card__image--back";
  cardBackImage.src = RUNTIME.activeCardBackImage;
  cardBackImage.alt = "Hidden card";

  cardBack.appendChild(cardBackImage);
  return cardBack;
}

/**
 * Creates the front face element for a single memory card.
 */
function createCardFrontFace(src: string): HTMLSpanElement {
  const cardFront = document.createElement("span");
  cardFront.className = "memory-card__face memory-card__face--front";

  const cardFrontImage = document.createElement("img");
  cardFrontImage.className = "memory-card__image";
  cardFrontImage.src = src;
  cardFrontImage.alt = "Memory card image";

  cardFrontImage.addEventListener("error", () => {
    cardFrontImage.style.display = "none";
  });

  cardFront.appendChild(cardFrontImage);
  return cardFront;
}

/**
 * Creates the inner flipping wrapper that contains both card faces.
 */
function createCardInner(card: CardModel): HTMLSpanElement {
  const cardInner = document.createElement("span");
  cardInner.className = "memory-card__inner";
  cardInner.appendChild(createCardBackFace());
  cardInner.appendChild(createCardFrontFace(card.value));
  return cardInner;
}

/**
 * Creates the interactive button element for a single card model.
 */
function createCardButton(card: CardModel): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "memory-card";
  button.dataset.cardId = String(card.id);
  button.dataset.state = card.state;
  button.setAttribute("aria-label", "Memory card");
  button.appendChild(createCardInner(card));
  return button;
}

/**
 * Clears the current board content before a fresh render.
 */
function resetBoard(boardElement: HTMLElement): void {
  boardElement.innerHTML = "";
  boardElement.removeAttribute("style");
}

/**
 * Creates one visual row for a slice of cards.
 */
function createBoardRow(cards: CardModel[]): HTMLDivElement {
  const rowElement = document.createElement("div");
  rowElement.className = "game-grid__row";
  cards.forEach((card) => rowElement.appendChild(createCardButton(card)));
  return rowElement;
}

/**
 * Splits the deck into rows and appends them to the board container.
 *
 * @param boardElement Board container that receives the rendered rows.
 * @param boardSize Total number of cards for the current match.
 */
function appendBoardRows(boardElement: HTMLElement, boardSize: number): void {
  let startIndex = 0;

  getRowDistribution(boardSize).forEach((rowSize) => {
    const cards = RUNTIME.cards.slice(startIndex, startIndex + rowSize);
    boardElement.appendChild(createBoardRow(cards));
    startIndex += rowSize;
  });
}

/**
 * Renders the current runtime deck into the game board container.
 *
 * @param boardSize Total number of cards for the current board layout.
 */
export function renderBoard(boardSize: number): void {
  const boardElement = BOARD_ELEMENT;

  if (!boardElement) {
    return;
  }

  resetBoard(boardElement);
  appendBoardRows(boardElement, boardSize);
}

/**
 * Syncs a rendered card button with the current runtime card state.
 *
 * @param card Runtime card whose DOM element should be updated.
 */
export function syncCardElement(card: CardModel): void {
  if (!BOARD_ELEMENT) {
    return;
  }

  const cardElement = BOARD_ELEMENT.querySelector(
    `[data-card-id="${card.id}"]`
  ) as HTMLButtonElement | null;

  if (!cardElement) {
    return;
  }

  cardElement.dataset.state = card.state;
  cardElement.disabled = card.state === "matched";
}

/**
 * Returns a card model by id from the current runtime deck.
 *
 * @param id Runtime id of the card to look up.
 * @returns Matching card model or `undefined` when no card exists.
 */
export function getCardById(id: number): CardModel | undefined {
  return RUNTIME.cards.find((card) => card.id === id);
}

/**
 * Resolves the closest card button for a click target inside the board.
 */
function getClickedCardElement(target: HTMLElement): HTMLButtonElement | null {
  return target.closest(".memory-card") as HTMLButtonElement | null;
}

/**
 * Resolves the clicked hidden card from a board click event.
 *
 * @param event Click event originating inside the board container.
 * @returns Hidden runtime card for the clicked element, or `null` when invalid.
 */
export function resolveClickedCard(event: Event): CardModel | null {
  const target = event.target as HTMLElement;
  const cardElement = getClickedCardElement(target);

  if (!cardElement) {
    return null;
  }

  const cardId = Number(cardElement.dataset.cardId);
  const card = getCardById(cardId);

  return card && card.state === "hidden" ? card : null;
}
