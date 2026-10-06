---
name: new-bracket
description: Interactive workflow to add a new bracket (town, dungeons, boss, tier materials, items, spells, balance) to Emberforge. Interviews the user, writes and gets approval for the targets half of docs/balance/bracket-NN.md, then builds the bracket. Use when the user says "new bracket", "add bracket N", "build the next town" or runs /new-bracket.
---

# New bracket workflow

You add one bracket to Emberforge together with the user. Do not guess what the user must decide. Ask with AskUserQuestion, and give a recommendation as the first option.

Read first: `CLAUDE.md`, `docs/balance/_template.md`, the balance file of the previous bracket (if it exists), `new-bracket-prompt.md` (the build rules, Parts 1 to 9, the subagent plan, and "Done when"), `design.md` sections 4, 4b, 5, 6, 8, 9, and the matching files in `docs/agent/`. Follow every rule in `new-bracket-prompt.md`. Where it says "the PARAMETERS block" or "the plan", use the answers you collect below.

## Stage 1: Parameters

1. Find the next bracket: the highest `lastLevel` that has dungeons in `data/dungeons.json`, plus one. Read the town, region, families and boss from `design.md` section 9 and `data/towns.json`. Compute `FIRST`, `LAST` and `PARTNER_LEVEL`.
2. Show the values in one short table, and ask the user to confirm them (one AskUserQuestion: "Build bracket N, TOWN, levels FIRST-LAST?" with the options "Yes", and "Change something"). If the user changes something, ask what.
3. Check the prerequisites. Tell the user, and ask how to go on, if any of these is false:
   - `npm run balance-report` exists.
   - The balance file of the previous bracket exists.
   - `npm run check` passes now.

## Stage 2: Decisions (interview)

Ask in rounds of up to 4 questions. Every question has 2 to 4 options with a recommendation first, based on the earlier brackets and the rules in `design.md`. Skip a question when the answer is already fixed by a rule. Cover, in this order:

1. **Shape:** number of dungeons (default: the shape of the previous bracket), the two starting dungeons, the unlock chain.
2. **Mood and theme:** tone of the town and each dungeon, and what to avoid.
3. **Boss:** the idea, the adds, the spells (name 3, with effect and cooldown) and the target priority.
4. **Class unlocks:** any "for now" row in the Hiring lock table (for example the Barbarian) and where it moves.
5. **Special mechanics:** any new rule (for example `armourPenetration` on a family). Default: none.
6. **Materials and set bonuses:** names, the set bonus of each set material, and how the sell price rises.
7. **Spells:** which classes get a new spell or only a new rank in this bracket (follow the Warrior blueprint).
8. **Pace:** any change to the pace targets (kills to level, minutes to level) against the previous bracket.
9. **Art:** creature and town art direction, and anything to reuse.

After each round, repeat the answers back in 3 or 4 lines. Do not ask what the user already said.

## Stage 3: Targets file (gate 1)

1. Copy `docs/balance/_template.md` to `docs/balance/bracket-NN.md`.
2. Fill in Part A (A1 to A12) from the answers and from the curves. Fit each curve to the earlier brackets and show the projection to level 100. Do not copy numbers of the earlier bracket.
3. Write every unresolved item in A12 with a recommendation.
4. Show the user a short summary (not the whole file): the 5 numbers that matter most, any cliff found in A3, and the open questions. Give the file path.
5. Ask: "Approve the targets?" with the options "Approve", "Change targets" and "Stop here". Repeat until the user approves or stops. After approval, set the status to "targets approved".

Do not edit `data/`, art or code before gate 1 is passed.

## Stage 4: Build

Follow `new-bracket-prompt.md` Parts 1 to 9 and the execution order (subagents in parallel for art, spell looks and lore; the main session tunes the numbers). Take the lists from Part A of the balance file.

Stop and ask the user (do not decide alone) when:
- a target in Part A cannot be met after reasonable tuning (show the row, and give 2 options);
- a curve needs a one-off fix (say which curve, and that every earlier bracket must be checked again);
- a rule in `design.md` must change;
- a new dependency is needed.

Report progress after each Part in 2 or 3 lines. Run `npm run check` after each Part.

## Stage 5: Balance and finish (gate 2)

1. Run `npm run balance-report -- N` and tune `data/` and the preset files until every row in Part B passes. Never change the simulator code or weaken a target. Read the tables yourself.
2. Check the visual work in a browser at about 360x640 and 1280x720 (see CLAUDE.md "Visual validation"). Do not leave a dev server running.
3. Show the user the final summary: the Part B result, what was not verified, what is left. Ask: "Accept the bracket?" with the options "Accept", "Fix something" and "Review a part first".
4. After acceptance, set the status to "balanced", update the "Status" line in `new-bracket-prompt.md`, and fix any step or template table that was wrong or missing. Do not commit unless the user asks.

## Style

Talk to the user in ASD-STE100 Simplified Technical English. Short questions. No em dashes anywhere.
