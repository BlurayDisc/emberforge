import { WEAPON_UPGRADE_SHAPE_ROWS } from './itemShapesWeaponUpgrades';

type Rows = readonly string[];

// One 12 by 12 picture for each base item id. Letters are colours: see BASE_LEGEND and the material tint in iconArt.ts.
export const ITEM_SHAPE_ROWS: Readonly<Record<string, Rows>> = {
  sword: ['.....oo.....', '....olao....', '....olao....', '....olao....', '....olao....', '....olao....', '....olao....', '..oooooooo..', '..oggggggo..', '....owwo....', '....owwo....', '....oggo....'],
  axe: ['......oooo..', '.....oaaaao.', '....oaaalao.', '....oaaaaao.', '.....oaaao..', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  greataxe: ['..oo....oo..', '.oaao..oaao.', 'oalaaooaalao', 'oaaaowwoaaao', '.oaaowwoaao.', '..ooowwooo..', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  mace: ['....oooo....', '...oaaaao...', '...oalaao...', '...oaaaao...', '....oaao....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  maul: ['..oooooooo..', '.oaaaaaaaao.', '.oalaaaaaao.', '.oaaaaaaaao.', '.oaaaaaaado.', '..oooooooo..', '....oggo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  dagger: ['............', '............', '.....oo.....', '....olao....', '....olao....', '....olao....', '....olao....', '...oooooo...', '...oggggo...', '....owwo....', '....owwo....', '....oggo....'],
  'parrying-dagger': ['............', '............', '............', '.....oo.....', '....olao....', '....olao....', '....olao....', 'og.oooooo.go', 'oggggggggggo', '....owwo....', '....owwo....', '....oggo....'],
  knuckles: ['............', '............', '............', '.oooooooooo.', 'oalaaaaaaaao', 'oaaaaaaaaddo', 'oaooaooaooao', 'oaooaooaooao', 'oaooaooaooao', 'oooooooooooo', '............', '............'],
  cestus: ['..oo.oo.oo..', '.oaaoaaoaao.', '.oalaalaalo.', '.owwwwwwwwo.', '.owwwwwwwwo.', '.oWWWWWWWWo.', '.owwwwwwwwo.', '..owwwwwwo..', '..oWWWWWWo..', '..oggggggo..', '..oooooooo..', '............'],
  bow: ['......oo....', '.....oaso...', '....oasoo...', '...oaaso....', '...oaso.....', '..oaaso.....', '..oaaso.....', '...oaso.....', '...oaaso....', '....oasoo...', '.....oaso...', '......oo....'],
  staff: ['....oooo....', '...obbbbo...', '...obllbo...', '...obbbbo...', '....oooo....', '....oaao....', '....oaao....', '....oaao....', '....oaao....', '....oaao....', '....oaao....', '....oWWo....'],
  wand: ['......oo....', '....ooggoo..', '......oo....', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oooo...'],
  shield: ['..oooooooo..', '.oaaaaaaaao.', '.oaallaaaao.', '.oaaggggaao.', '.oaaggggaao.', '.oaallaaaao.', '..oaaaaaao..', '..oaaaaaao..', '...oaaaao...', '....oaao....', '.....oo.....', '............'],
  quiver: ['...r..r.r...', '...w..w.w...', '..owwwwwwo..', '..oaaaaaao..', '..oaaaaaao..', '..oaaaaaao..', '..oaaWWaao..', '..oaaaaaao..', '..oaaaaaao..', '...oaaaao...', '...oooooo...', '............'],
  tome: ['............', '.oooooooooo.', '.oaaaaaaaao.', '.oaaggggaao.', '.oaaggggaao.', '.oaaaaaaaao.', '.oaaaaaaaao.', '.oppppppppo.', '.oppppppppo.', '.oooooooooo.', '............', '............'],
  belt: ['............', '............', '............', 'oooooooooooo', 'oaaaaaaaaaao', 'oaaaggggaaao', 'oaaaaaaaaaao', 'oooooooooooo', '............', '............', '............', '............'],
  ring: ['............', '....oooo....', '...oaaaao...', '...oalaao...', '....oooo....', '...oggggo...', '..og....go..', '..og....go..', '..og....go..', '...oggggo...', '....oooo....', '............'],
  amulet: ['..o......o..', '..og....go..', '...og..go...', '....ogggo...', '.....oao....', '....oaaao...', '...oaalaao..', '...oaaaaao..', '....oaaao...', '.....ooo....', '............', '............'],
  'helm-heavy': ['....oooo....', '...oaaaao...', '..oaaaaaao..', '..oaaaaaao..', '..oaaooaao..', '..oaaooaao..', '..oaaaaaao..', '..oaa..aao..', '..ooo..ooo..', '............', '............', '............'],
  'helm-medium': ['............', '....oooo....', '...oaaaao...', '..oaaaaaao..', '..oaalaaao..', '..oaaaaaao..', '..oddddddo..', '..oooooooo..', '............', '............', '............', '............'],
  'helm-light': ['.....oo.....', '....oaao....', '...oaaaao...', '..oaaaaaao..', '.oaalaaaaao.', '.oaaoooaaao.', '.oaao..oaao.', '.oaao..oaao.', '.ooo....ooo.', '............', '............', '............'],
  'armour-heavy': ['..oo....oo..', '.oaaaoooaaao', '.oaaaaaaaaao', '.oaaaaaaaaao', '..oaaaggaao.', '..oaaaaaaao.', '..oaaaaaaao.', '..oaaaaaaao.', '..odddddddo.', '..oaaaaaaao.', '...oooooooo.', '............'],
  'armour-medium': ['............', '...oo..oo...', '..oaaooaao..', '..oaaaaaao..', '..oalaaaao..', '..oaawwaao..', '..oaawwaao..', '..oaaaaaao..', '..oddddddo..', '..oooooooo..', '............', '............'],
  'armour-light': ['....oooo....', '...oaaaao...', '.ooaaaaaaoo.', 'oaaoaaaaoaao', 'oaaoaaaaoaao', 'ooooggggoooo', '..oaaaaaao..', '..oaaaaaao..', '.oaaaaaaaao.', 'oaaaaaaaaaao', 'oooooooooooo', '............'],
  'gloves-heavy': ['..oo.oo.oo..', '.oSSoSSoSSo.', '.oaaaaaaaao.', '.oalaaaaaao.', '.oaaaaaaaao.', '..oaaaaaao..', '..oSSSSSSo..', '..oaaaaaao..', '..oSSSSSSo..', '..oooooooo..', '............', '............'],
  'gloves-medium': ['............', '..oo.oo.oo..', '.oaaoaaoaao.', '.oaaaaaaaao.', '.oaaaaaaaao.', '..oaaaaaao..', '..oaaaaaao..', '..oaaaaaao..', '..oddddddo..', '..oooooooo..', '............', '............'],
  'gloves-light': ['............', '...oooooo...', '..oaaaaaao..', '..oaaaaaaoo.', '..oalaaaaao.', '..oaaaaaaao.', '..oaaaaaao..', '..oddddddo..', '..oooooooo..', '............', '............', '............'],
  'boots-heavy': ['...oSSSSo...', '...oaaaao...', '...oSSSSo...', '...oaaaao...', '...oaaaao...', '...oSSSSo...', '...oaaaooo..', '...oaaaaaao.', '...oSSSSSSo.', '...oooooooo.', '............', '............'],
  'boots-medium': ['............', '...oaaao....', '...oaaao....', '...oaaao....', '...oaaao....', '...oaaao....', '...oaaaooo..', '...oaaaaaao.', '...oddddddo.', '...oooooooo.', '............', '............'],
  'boots-light': ['............', '............', '............', '............', '............', '...oaao.....', '...oaaoo....', '...oaaaaoo..', '..oaalaaaaoo', '..oddddddddo', '..oooooooooo', '............'],
  ...WEAPON_UPGRADE_SHAPE_ROWS,
};
