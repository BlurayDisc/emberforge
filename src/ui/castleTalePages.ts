const MAXIMUM_PAGE_WEIGHT = 520;
const WEIGHT_OF_WIDE_CHARACTER = 2.5;
const FIRST_WIDE_CHARACTER_CODE = 0x2e80;

function weightOfText(text: string): number {
  let weight = 0;
  for (const character of text) weight += (character.codePointAt(0) ?? 0) >= FIRST_WIDE_CHARACTER_CODE ? WEIGHT_OF_WIDE_CHARACTER : 1;
  return weight;
}

// Whole tales are grouped in order, so no tale is cut or reworded. A wide (Chinese) character weighs more than a Latin one because it takes more room on the line.
// A tale that is longer than a page alone gets its own page.
export function groupTalesIntoPages(tales: readonly string[]): string[][] {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentWeight = 0;
  for (const tale of tales) {
    const taleWeight = weightOfText(tale);
    if (currentPage.length > 0 && currentWeight + taleWeight > MAXIMUM_PAGE_WEIGHT) {
      pages.push(currentPage);
      currentPage = [];
      currentWeight = 0;
    }
    currentPage.push(tale);
    currentWeight += taleWeight;
  }
  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}
