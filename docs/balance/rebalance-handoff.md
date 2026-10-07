# Rebalance and real-time battle rebuild - handoff (2026-10-08)

Read this first in a new session. It says where we are, what is decided, and what comes next. The rules and numbers live in the spec files named below; this file does not repeat them.

## Where the truth lives

| File | What |
|---|---|
| `docs/balance/combat-and-growth-mechanism.md` | THE SPEC. Sections 1-14: principles, attribute stats, attack time, hit order, crit, monsters and boss, round 2 draft numbers (updated by passes 3 and 4), real-time battle rules (12), later work (13), gear budget (14). |
| `docs/balance/realtime-battle.md` | Real-time simulation design, placeholder numbers (field 36 x 8, speeds, ranges), report and track format. |
| `design.md` | Game rules source of truth. Updated for flat armour, attributes, real-time battle, gear, Enchanting. |
| `docs/agent/battle-sim.md` | Battle sim page (`npm run battlesim`) and how to shoot the real game (`tools/shot-save-fixture.ts`). |
| `docs/agent/balance-and-validation.md` | Balance tools and validator. |

## Decided rules (short list; details are in the spec)

- Flat damage: hit = (attack x swing x spell power x crit) - armour, minimum 1, rounded once. Swing is on the attack. Spells can crit (each hit rolls); Burn and heals cannot.
- Skill is deleted. Strength, Agility, Intelligence drive HP, damage, Resistance, attack time. Defence comes only from class base, gear and abilities. Resource pools are fixed. Crit 4%, damage 200%, Thief +2%.
- Attack time = base attack seconds / (1 + bonus). Slow is a negative value in the same pool. No minimum attack time (code guard 0.1 on the factor). Spells have a fixed cast time (default 0.8 s, 0 = instant), cooldown starts at cast start.
- Scale 10x, whole numbers everywhere (stats, items). Class attribute totals within 15% of each other.
- Real-time battle: both sides run in, melee meet after about 2-3 s, ranged range about 1/3 of the field, units block each other, nearest-target with a switch margin, boss priority overrides. Run-up time is not in duration targets (each class got +5 base damage).
- Gear: whole numbers, basic gear has NO HP (HP only from affixes and set bonuses). Unlock order: boots 1, gloves 2, helm 4, shield 5, legs 6, chest 8 (belt 6, ring 7, amulet 9). Every armour piece gives at least 2 Defence. Weapon damage 7 + 1.6 per item level with type multipliers. Upgrade = flat +1 main stat per step. Boots give +5% movement speed. Set recipes: all armour pieces have them (the "crafter level 2" rule is for weapons only); belt and jewellery have none. Mace stays with Weaponsmithing. Profession `woodworking` was renamed `enchanting` (wands, staffs, Tome).
- Every craft must matter: no zero-bonus item. Targets are soft (tolerance 15%). 10-20 battles per balance case are enough (presets are set to 20; `resource-use` still 200).
- Boss is a normal monster lifted by ONE common factor (validator, 15%), flat numbers in `data/monsters.json`, attack time 1.65 s. All mobs attack every 1.0-2.0 s (validator).

## Done (all built, `npm run check` passes)

1. Phase 1: stats and damage core, Skill removal, save version 25 migration.
2. Balance passes 2, 3, 4: monster anchors (levels 1-10), boss flat numbers, per-mob `statFactor` = sqrt(attack seconds / 1.65), rare factor 1.25.
3. Phase 5: items (gear budget, Enchanting, boots movement speed, validator `tools/validate-gear-budget.ts`), save version 26 migration.
4. Mana Shield: absorbs flat 45 / 90 / 140 + 6 / 9 / 12% of max HP (placeholder numbers).
5. Real-time simulation (`src/systems/battle/realtime/`), wired into `src/game/encounterPlanner.ts`. `check:realtime` is part of `npm run check`.
6. Battle view plays tracks (run, lunge, ranged shot with projectile, cast pose, death). Battle sim page `npm run battlesim`.
7. In-game check: looked at a real run at 1280x720 and 412x915. Two small fixes (health bar spread, taller ground band).

Last known numbers (20 battles, first meeting, HP lost, average of Warrior / Archer / Mage): level 1 about 48%, levels 2-10 about 60-70%. Boss (HP 1,500, damage 138, armour 17, Resistance 7): gear floor 55-60%, crafted gear 77%, weapon only 25-28%, one hero no gear 0%.

## Working tree

- Commits `v0.5.1` and `v0.5.2` were made by the user. Pass 4 data, the view fixes, `tools/shot-save-fixture.ts`, `docs/agent/battle-sim.md`, `src/render/healthBarSpread.ts` and this file may be uncommitted. Run `git status`.
- `CLAUDE.md` and `story-and-lore.md` changes are the user's own.
- Do not commit unless the user asks. Work on main, no branches. Do not leave a dev server running (a worker once left `vite preview` on port 5180).

## Open decisions (ask the user)

1. Keep the per-mob `statFactor`, or use factor 1 and change attack times?
2. Boss crafted-gear win rate is 77% (target about 85%). Accept (inside tolerance)?
3. Fight length target for the real-time model (kill times are 12-22 s; old `mob-kill-time` targets 7-25 s are from the old model; the user once wanted level 1 under 10 s).
4. Spell pass: Volley and multi-hit spells lose a lot to flat armour (a Volley arrow is 34 raw at level 10). Options discussed: higher power per arrow (0.45 to about 0.55), an `armourPenetration` field on spells (about 30%). Volley is level 12, above the cap of 10, so it is not live yet.
5. Whether Archer and Mage should kite (today they stand and shoot).
6. A start line of 8 or more units on one side overlaps (field depth 8, body width 1.0). Needs a second rank or a deeper field before such fights exist.

## Known issues

- Mobile (412x915) battle stage is small with large empty bands above and below.
- A run is one fight; no walk to the next fight, no heal between fights.
- `src/render/battleView.ts` is 243 lines (event effects moved to `battleEventEffects.ts`).
- Goblin Chief's Lair backdrop has a white block shape.
- Priest, Thief, Barbarian, Fighter are placeholders and far outside the band at levels 8-10 (Priest 96-100% HP lost, Fighter 91-99%, Thief about 69-88%, Barbarian 61% then 92% at level 10).
- Not verified: sound (nobody can hear it), pause and playback speed in the game run view, phone frame rate, a Mage cast, a rare creep or a multi-monster fight on the real stage, Chinese text visually.
- Old saves keep old boots (attack speed +3, no movement speed).

## Next steps (suggested order)

1. View work left: bigger mobile battle stage. (Combat log in seconds and the `battleView.ts` split are done, not yet looked at in a browser.)
2. Balance pass 5: the four placeholder classes, using Warrior, Archer, Mage as the baseline.
3. Spell pass: flat spell numbers, Volley and multi-hit, Mana Shield check, spell choice in the sim ("last 3 by unlock level").
4. Phase 4: customisable hero sprites (equipped items change the battle sprite and the full-body figure; portraits stay).
5. Commit when the user says so.

## How we worked (keep doing it)

- The user designs in chat rounds with real numbers, approves, then workers build. Chat replies: ASD-STE100 Simplified Technical English, no em dashes anywhere.
- One WORKER agent per task with a full written brief (spec files to read, rules, scope, report format), then a read-only REVIEWER agent when the change is big. Run workers in parallel only when their file sets are disjoint; say which files each may edit.
- Always run `npm run check` yourself after a worker reports. Do not trust a report without checking.
- Visual work: `npm run shot`, then LOOK at the PNGs. A background tab gets no animation frames.
- Tools: `npm run scenarios -- first-fight | boss-fight | mob-kill-time`, `npm run check:realtime`, `npm run timeline:realtime -- archer 5 1 2 1`, `npm run battlesim`.

## Starter prompt for the new session

"Read docs/balance/rebalance-handoff.md and docs/balance/combat-and-growth-mechanism.md. We are continuing the flat-combat rebalance and real-time battle rebuild. Run `git status` and `npm run check` first. Then ask me which next step to start (see 'Next steps' and 'Open decisions' in the handoff)."
