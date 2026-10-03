type Rows = readonly string[];

// Pictures for the stronger weapon bases of each class. Same letters as itemShapes.ts.
export const WEAPON_UPGRADE_SHAPE_ROWS: Readonly<Record<string, Rows>> = {
  broadsword: ['.....oo.....', '...oalaao...', '...oalaao...', '...oalaao...', '...oalaao...', '...oalaao...', '...oalaao...', '..oooooooo..', '..oggggggo..', '....owwo....', '....owwo....', '....oggo....'],
  longbow: ['.....ooo....', '....oaaso...', '....oaso....', '...oaaso....', '...oaso.....', '..odaso.....', '..odaso.....', '...oaso.....', '...oaaso....', '....oaso....', '....oaaso...', '.....ooo....'],
  'composite-bow': ['.oo.........', '.oaoooo.....', '..oaaaso....', '...oaaso....', '...oaso.....', '..oaaso.....', '..oaaso.....', '...oaso.....', '...oaaso....', '..oaaaso....', '.oaoooo.....', '.oo.........'],
  warbow: ['......oo....', '.....oaso...', '....ogsoo...', '...oaaso....', '...oaso.....', '..odaaso....', '..odaaso....', '...oaso.....', '...oaaso....', '....ogsoo...', '.....oaso...', '......oo....'],
  'runed-wand': ['....oooo....', '...obllbo...', '...obbbbo...', '....oooo....', '.....oaao...', '.....oaao...', '.....ogao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oaao...', '.....oooo...'],
  scepter: ['....oggo....', '...ogllgo...', '...oggggo...', '....oggo....', '.....oao....', '.....oao....', '.....odo....', '.....oao....', '.....oao....', '.....oao....', '.....oao....', '.....ooo....'],
  'arcane-staff': ['...oboobo...', '..obbllbbo..', '..obbbbbbo..', '...obbbbo...', '....oooo....', '....oaao....', '....odao....', '....oaao....', '....oaao....', '....oaao....', '....oaao....', '....oWWo....'],
  'morning-star': ['..o..oo..o..', '...oooooo...', '..oaalaaao..', '.ooaaaaaaoo.', '..oaaaaaao..', '...oooooo...', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  stiletto: ['............', '.....oo.....', '....olo.....', '....olo.....', '....olo.....', '....olo.....', '....olo.....', '...ooooo....', '....ogo.....', '....owo.....', '....owo.....', '....ooo.....'],
  dirk: ['............', '.....oo.....', '....olao....', '....olao....', '....olao....', '....olao....', '...oooooo...', '...oddddo...', '....owwo....', '....owwo....', '....oggo....', '............'],
  kris: ['.....oo.....', '....olao....', '.....olao...', '....olao....', '.....olao...', '....olao....', '...oooooo...', '...oggggo...', '....owwo....', '....owwo....', '....oggo....', '............'],
  sledgehammer: ['..oooooooo..', '.oaaaaaaaao.', '.oalaaaaaao.', '.oaaaaaaaao.', '.oddddddddo.', '..oooooooo..', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....owwo....', '....oWWo....'],
  'bearded-axe': ['..oooo......', '.oaaaaoo....', 'oalaaaowwo..', 'oaaaaaowwo..', '.oaaaaowwo..', '..ooooowwo..', '......owwo..', '......owwo..', '......owwo..', '......owwo..', '......owwo..', '......oWWo..'],
  'brass-knuckles': ['............', '............', '............', '.oooooooooo.', 'oalaaaaaaaao', 'ogggggggggdo', 'oaooaooaooao', 'oaooaooaooao', 'oaooaooaooao', 'oooooooooooo', '............', '............'],
  'spiked-knuckles': ['............', '............', '.s..s..s..s.', '.oooooooooo.', 'oalaaaaaaaao', 'oaaaaaaaaddo', 'oaooaooaooao', 'oaooaooaooao', 'oaooaooaooao', 'oooooooooooo', '............', '............'],
  'steel-claws': ['..s..s..s...', '..s..s..s...', '..s..s..s...', '.ooooooooo..', '.oaaaaaaaao.', '.oalaaaaaao.', '.oaaaaaaddo.', '.oooooooooo.', '............', '............', '............', '............'],
};
