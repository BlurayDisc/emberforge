import monsterSpellsData from '../../data/monster-spells.json';
import type { BattleSpell } from '../model/spell';
import { DEFAULT_CAST_SECONDS } from './balance/spells';

type MonsterSpellRecord = Omit<BattleSpell, 'castSeconds'> & { castSeconds?: number };

export const MONSTER_SPELLS: readonly BattleSpell[] = (monsterSpellsData as unknown as readonly MonsterSpellRecord[]).map((spell) => ({ ...spell, castSeconds: spell.castSeconds ?? DEFAULT_CAST_SECONDS }));
