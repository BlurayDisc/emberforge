---
name: new-bracket
description: Interactive workflow to add a new bracket (town, dungeons, boss, tier materials, items, spells, balance) to Emberforge. Interviews the user, writes and gets approval for the targets half of docs/balance/bracket-NN.md, then builds the bracket. Use when the user says "new bracket", "add bracket N", "build the next town" or runs /new-bracket.
---

# New bracket workflow

You add one bracket to Emberforge together with the user. Do not guess what the user must decide. Ask with AskUserQuestion, and give a recommendation as the first option.

Read first: `CLAUDE.md`, `balance-template.md` in this folder, the balance file of the previous bracket (if it exists), `build-rules.md` in this folder (the build rules, Parts 1 to 9, the subagent plan, and "Done when"), and `docs/design.md` and the topic files for sections 4, 4b, 5, 6, 8 and 9. Read a file of `docs/agent/` only when you reach the part that needs it (for example `ui-rules.md` for a screen, `audio.md` for sounds). These files are for this skill only. Normal work does not read them. Follow every rule in `build-rules.md`. Where it says "the parameters", use the answers you collect below.

## Stage 1: Parameters

1. Find the next bracket: the highest `lastLevel` that has dungeons in `data/dungeons.json`, plus one. Read the town, region, families and boss from `docs/design/world-and-dungeons.md` section 9 and `data/towns.json`. Compute `FIRST`, `LAST` and `PARTNER_LEVEL`.
2. Show the values in one short table, and ask the user to confirm them (one AskUserQuestion: "Build bracket N, TOWN, levels FIRST-LAST?" with the options "Yes", and "Change something"). If the user changes something, ask what.
3. Check the prerequisites. Tell the user, and ask how to go on, if any of these is false:
   - The balance file of the previous bracket exists.
   - `npm run check` passes now.

## Stage 2: Curves and design (interview)

The new balance file grows out of the previous one. Read Part A (A2 curves, A4 pacing, A5 dungeons, A8 boss, A10 economy) and Part B (B7 kills to level, B8 crafts to level) of `docs/balance/bracket-(N-1).md`. A curve keeps its rule. Only its inputs change. Do not copy a number of the previous bracket.

**Round A: curves.** Fit each curve of A2 to the built brackets, and project it to FIRST and LAST. Show one table with the proposed value for each measure, and ask the user to accept or change it. Cover:
1. **Level-up pace:** kills of a normal monster to level up at FIRST, at the middle and at LAST in the best dungeon (default: the curve of the previous bracket, 5-7 kills), and minutes to level.
2. **Workshop curve:** crafts to raise the crafter level at FIRST and at LAST (crafter XP per unit), and the crafter fee.
3. **Economy:** sell value, gold per hour of a solo hero, spell price (under 65% of the solo income).
4. **Fights:** normal fight length and boss fight length targets, and the monster HP and damage anchors.

**Round B: content.** Every question has 2 to 4 options with a recommendation first. Skip a question when a rule already fixes the answer. Ask in rounds of up to 4 questions:
1. **Town:** name, mood, buildings, who lives there, and the link to PREVIOUS_BOSS and NEXT_TOWN.
2. **Dungeons:** the number (default: the shape of the previous bracket), the two starting dungeons, the unlock chain, and for each dungeon a name, a level and a mood.
3. **Monsters:** for each dungeon propose the families, the names of the normal monsters and of the rare monster. Show them in one table and let the user rename.
4. **Boss:** the idea, the adds, 3 spells (effect and cooldown) and the target priority.
5. **Materials and sets:** names of the tier materials and the set material of each dungeon, the set bonus, and how the sell price rises.
6. **Spells:** which classes get a new spell or only a new rank (follow the Warrior blueprint).
7. **Class unlocks and special mechanics:** `unlockAfterDungeonId` in `classes.json` (see the Hiring lock rule in `docs/design/heroes-and-spells.md`), and any new rule. Default: none.
8. **Art:** creature and town art direction, and anything to reuse.

After each round, repeat the answers back in 3 or 4 lines. Do not ask what the user already said.

## Stage 3: Targets file and draft data (gate 1)

1. Copy `balance-template.md` in this folder to `docs/balance/bracket-NN.md`.
2. Fill in Part A (A1 to A12) from the curves of Round A. Show the projection to level 100. Do not copy numbers of the earlier bracket. A5, A7 and A8 hold only the design intent and point to the data files.
3. Write the content of Round B into the data files, so each value has one copy: `towns.json`, `dungeons.json`, `monsters.json` (stats from the curves, drops, boss `flatStats`), `materials.json` (set materials and `setBonus`), `monster-spells.json`, and the names in `en.json` and `zh.json`. Run `npm run validate`. Errors about art that is not built yet are expected. Fix every other error.
4. Write every unresolved item in A12 with a recommendation.
5. Show the user a short summary in chat: the 5 numbers that matter most, any cliff found in A3, a table of the dungeons and monsters read from the data files, and the open questions. Give the file paths.
6. Ask: "Approve the targets and the draft data?" with the options "Approve", "Change something" and "Stop here". Repeat until the user approves or stops. After approval, set the status to "targets approved".

Before gate 1, edit only the files in step 3 and the balance file. Do not touch art, code, XP tables, recipes or preset files.

## Stage 4: Build

Follow `build-rules.md` Parts 1 to 9 and the execution order (subagents in parallel for art, spell looks and lore; the main session tunes the numbers). Take the lists from the data files and Part A of the balance file. The records of Stage 3 already exist, so this stage finishes them.

Stop and ask the user (do not decide alone) when:
- a target in Part A cannot be met after reasonable tuning (show the row, and give 2 options);
- a curve needs a one-off fix (say which curve, and that every earlier bracket must be checked again);
- a rule in `docs/design.md` must change;
- a new dependency is needed.

Report progress after each Part in 2 or 3 lines. Run `npm run check` after each Part.

## Stage 5: Balance and finish (gate 2)

1. Run `npm run balance` and `npm run scenarios` (all seven), write the results into Part B by hand, and tune `data/` and the preset files until every row in Part B passes. Never change the simulator code or weaken a target. Read the tables yourself.
2. Check the visual work in a browser at about 412x915 and 1280x720 (see CLAUDE.md "Visual validation"). Do not leave a dev server running.
3. Show the user the final summary: the Part B result, what was not verified, what is left. Ask: "Accept the bracket?" with the options "Accept", "Fix something" and "Review a part first".
4. After acceptance, set the status to "balanced", update the "Status" line in `build-rules.md`, and fix any step or template table that was wrong or missing. Do not commit unless the user asks.

## Style

Talk to the user in ASD-STE100 Simplified Technical English. Short questions. No em dashes anywhere.
