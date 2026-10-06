# Languages (English and Chinese)

- Every text that a player can see goes through `t('key', params)` from `ui/i18n.ts`. Never write player text in code.
- Texts live in `data/i18n/en.json` and `data/i18n/zh.json` (flat keys). Content names use the content id: `monster.<id>`, `material.<id>`, `dungeon.<id>`, `base.<id>`, `affix.<id>`, `class.<id>.name`.
- `game/` and `systems/` never return English sentences. A rejected command carries a message key (`CommandRejected('reject.partyEmpty')`). An equip problem is `{ key, params }`.
- Saved data holds ids and parts, never display text. An item stores `baseId`, `materialId`, `affixes` and `rareNameParts`. `ui/displayNames.ts` builds the name in the current language.
- The language choice is saved apart from the game save (`emberforge.settings`), so a new game keeps it. The player changes it in the Settings screen. The UI redraws at once.
- Add a key to **both** files. `npm run validate` fails when a key is missing, empty or unknown, when a key used in code does not exist, or when a content name in `en.json` differs from the data file.
- To add a language: add `data/i18n/<id>.json`, add it to `data/i18n/languages.json` and to `LanguageId` in `content/translations.ts`.

