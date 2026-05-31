import {
  boardElement,
  cardFrontByTheme,
  defaultTheme,
  runtime,
  type CardModel,
} from "./game-shared";

function shuffle<T>(items: T[]): T[] {
  const copied = [...items];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]];
  }

  return copied;
}

export function createCards(boardSize: number): CardModel[] {
  const pairCount = boardSize / 2;
  const cardValues =
    cardFrontByTheme[runtime.activeTheme] || cardFrontByTheme[defaultTheme];
  const values = cardValues.slice(0, pairCount);

  return shuffle(
    values.flatMap((value, pairId) => [
      { pairId, value },
      { pairId, value },
    ])
  ).map((card, id) => ({
    id,
    pairId: card.pairId,
    value: card.value,
    state: "hidden",
  }));
}

function getGridColumns(boardSize: number): number {
  if (boardSize === 34) {
    return 6;
  }

  return Math.sqrt(boardSize);
}

function createCardBackFace(): HTMLSpanElement {
  const cardBack = document.createElement("span");
  cardBack.className = "memory-card__face memory-card__face--back";

  const cardBackImage = document.createElement("img");
  cardBackImage.className = "memory-card__image memory-card__image--back";
  cardBackImage.src = runtime.activeCardBackImage;
  cardBackImage.alt = "Hidden card";

  cardBack.appendChild(cardBackImage);
  return cardBack;
}

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

function createCardInner(card: CardModel): HTMLSpanElement {
  const cardInner = document.createElement("span");
  cardInner.className = "memory-card__inner";
  cardInner.appendChild(createCardBackFace());
  cardInner.appendChild(createCardFrontFace(card.value));
  return cardInner;
}

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

export function renderBoard(boardSize: number): void {
  if (!boardElement) {
    return;
  }

  const grid = boardElement;
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${getGridColumns(boardSize)}, minmax(0, 1fr))`;

  runtime.cards.forEach((card) => {
    grid.appendChild(createCardButton(card));
  });
}

export function syncCardElement(card: CardModel): void {
  if (!boardElement) {
    return;
  }

  const cardElement = boardElement.querySelector(
    `[data-card-id="${card.id}"]`
  ) as HTMLButtonElement | null;

  if (!cardElement) {
    return;
  }

  cardElement.dataset.state = card.state;
  cardElement.disabled = card.state === "matched";
}

export function getCardById(id: number): CardModel | undefined {
  return runtime.cards.find((card) => card.id === id);
}

export function resolveClickedCard(event: Event): CardModel | null {
  const target = event.target as HTMLElement;
  const cardElement = target.closest(
    ".memory-card"
  ) as HTMLButtonElement | null;

  if (!cardElement) {
    return null;
  }

  const cardId = Number(cardElement.dataset.cardId);
  const card = getCardById(cardId);

  return card && card.state === "hidden" ? card : null;
}
