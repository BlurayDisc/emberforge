import monsterSpellsData from '../../data/monster-spells.json';
import type { BattleSpell } from '../model/spell';

export const MONSTER_SPELLS = monsterSpellsData as unknown as readonly BattleSpell[];
