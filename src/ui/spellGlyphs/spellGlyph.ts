// One picture for a spell family, 14 rows of 14 symbols. '.' is transparent over the theme background.
// o outline, w white, l theme light, m theme main, d theme dark, g gold, r red, k black. theme overrides the class theme.
export interface SpellGlyph {
  rows: readonly string[];
  theme?: string;
}
