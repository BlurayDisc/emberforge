# Real-time battle (phase 2, stage A)

Status: built in stage A and wired into the game in stage B (`src/game/encounterPlanner.ts` plans with `simulateRealtimeBattle`; the report is rebuilt from the seed and the party, so no save change was needed). `simulateRealtimeBattle(units, random)` takes the units and a seeded random. The spec is section 12 of `combat-and-growth-mechanism.md`. Numbers are placeholders in `data/balance/battlefield.json` (loader: `src/content/balance/battlefield.ts`).

## Placeholder numbers

| Item | Value | Note |
|---|---|---|
| Tick | 0.05 s | Fixed. |
| Field | 36 long x 8 deep | Heroes start left, monsters right, spread evenly in depth. |
| Body radius | hero and normal 0.5, rare 0.6, boss 1.0 | Units are circles. |
| Melee reach | 0.3 (edge to edge) | Melee = bodies touch. |
| Base movement speed | 6 per second | All melee classes and all monsters. |
| Ranged speed factor | 0.9 | Archer, Mage, Priest. |
| Ranged range | 0.38 x field length = 13.7 (edge to edge) | Per unit value (`attackReach`), so an ability can raise it later. |
| Melee meet time | 2.5 s | The start gap is computed from it: gap = 2.5 x (2 x 6) + contact distance. Party line x = 2.35. |
| Ranged start offset | 2 behind the melee line (kept inside the field) | Only when the side has a melee unit. |
| Attack hit fraction | 0.5 | The hit lands at half of the attack time. |
| Target switch margin | 2 (edge distance) | Switch only if another enemy is closer by this much. |
| Unreachable switch | 1 s | A unit that cannot make progress for 1 s takes another target. |
| Body overlap tolerance | 0.05 | Steps that push bodies deeper than this are refused. |
| Steering angles | 40, 80, 120 degrees | Tried in order when a blocker is in the way. |

The Priest is treated as ranged support (range 12, speed x0.9). Range and speed live in `battlefield.json` by class id (`classProfiles`) and for monsters by id (`monsterProfiles`) then rank (`monsterRankProfiles`). `spellRangeFieldFractions` can give one spell its own range (empty now). The unit input may carry `movementSpeedBonus` (0 by default; set from the boots, +5% each, by `heroToBattleUnit`).

## Algorithm

Each tick: burn ticks, then for each living unit in input order: regenerate resource, land a due hit or cast effect, and if free, decide.

Decide: choose the enemy target (nearest by edge distance, keep the current one unless another is closer by the margin). Then in this order: a ready, paid, useful spell (enemy spells need the target in the spell range, default the attack range; self, ally and shield spells need no range); else a Priest heals a wounded ally (below the heal threshold, not itself); else a basic attack if the goal is in reach; else move one step toward the goal.

Basic attack: the unit stands still for the attack time (base attack seconds / attack speed pool, same guard as the old sim). The hit lands at the hit fraction. Ranged hits land at release; the projectile is only visual. A target that is dead at the hit moment takes nothing. When the unit became ready between two ticks, the next attack starts at that exact time, so a run of attacks keeps the true rhythm.

Spell cast: resource and cooldown are taken at the start. The unit stands still for `castSeconds` (0 = instant, same tick). The effect and its events land at the end with the old effect code. A unit that dies during a cast casts nothing.

Blocking and steering: a step is refused when it brings the body inside another body by more than the tolerance. The unit then turns by a fixed angle away from the blocker and keeps that side until the straight way is free (no jitter). Ranged attacks ignore bodies. Dead units do not block.

Randomness: one stream `random.fork('realtimeCombat')`. Same seed and units give the same report.

Code reuse: `rollDamage`, armour, shield, dodge, burn, life steal, thorns, resource pool and the spell effect code come from `systems/battle`. The orchestration of one basic attack is in `realtime/basicStrike.ts`. `spellCasting.ts` offers `pickReadySpell`, `beginSpellCast` and `resolveSpellCast` (the heal and shield casting and the cast context are in `supportSpellCasting.ts` and `spellCastContext.ts`); an optional `focusTarget` aims single-target spells; two guards return no events when there is no opponent or no wounded ally.

## Report format (`src/model/realtimeBattle.ts`)

`RealtimeBattleReport` = old `BattleReport` (winner, durationSeconds, events, finalUnits) plus:

- `tickSeconds`, `field { length, depth }`.
- `tracks[]`: one per unit, structure of arrays `x[]`, `y[]`, `facing[]` (-1 or 1), `state[]` (`idle`, `moving`, `attacking`, `casting`, `dead`), plus `unitId`, `side`, `rank`, `bodyRadius`, `attackReach`. Sample i is the state at time i x tickSeconds, from tick 0 to the last tick. A dead unit keeps its last position.
- `events[]`: old `BattleEvent` shape, timestamped at the tick when the damage, heal or effect lands.
- `actionEvents[]`: `attackStart` (timeSeconds, actorId, targetId, hitAtSeconds, endsAtSeconds, projectile, isHeal), `castStart` (timeSeconds, actorId, targetId or null, spellId, effectAtSeconds), `death` (timeSeconds, unitId).

Playback: show the windup from `attackStart` to `hitAtSeconds`; the matching `events` entry lands at that time. For `projectile: true` fly a visual from the actor to the target; the damage is already applied at release. Positions come from the tracks by index (interpolate if the screen runs faster than 20 Hz).

## Open questions

- Cast delays the run-up a little: a hero that casts a buff or opener at contact meets the enemy about 0.4 s later than 2.5 s (see the compare table).
- Ranged units never kite: they stand and shoot when the enemy is in range, even when a monster is on top of them.
- Many units on one side are spread evenly in depth with no second column; a side of 8 or more would overlap at the start (depth 8, body 0.5).
- Units act in input order within a tick, so the first unit in the list wins a same-tick trade. Likely fine at 0.05 s.
- Boss body radius 1.0 and monster speed profiles are guesses. Real range and speed per class and monster need the user's decision.
- `maximumBattleSeconds` is 1200 s; at 20 ticks per second a stalemate stores 24000 samples per unit. Normal fights are 10 to 20 s.
- Fight length rose a little for melee and fell a little for ranged versus the old sim; no balance retune was done.

## Start and crowding rules

- **Start:** a buff or shield spell (self or allies) waits until the nearest enemy is within `prepareSpellsWithinDistance` (10, edge to edge). Every unit then walks from the first tick, and nobody stands still for the length of a cast while the others run.
- **Ranged heroes:** speed 0.8 of the base (it was 0.9) and a longer range (0.38 of the field, it was 0.3333). They keep shooting when a melee unit touches them.
- **Stuck units:** a unit that gains no ground for `holdWhenStuckSeconds` (0.15) stands still, and moves only when the straight way stays free for 4 steps. Big bodies (a boss is 2 wide) that meet in a narrow gap no longer push in and out. A unit that cannot reach its goal hits any enemy that is already in reach.
