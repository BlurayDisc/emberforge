import type { SpellIconMotif } from '../content/spellVisuals';

// 12 by 12 pictures. w is white, l the light colour of the theme, m the main colour, d the dark colour.
export const SPELL_ICON_GLYPHS: Readonly<Record<SpellIconMotif, readonly string[]>> = {
  slash: ['..........ll', '.........lml', '........lml.', '.......lml..', '......lml...', '.l...lml....', '.ll.lml.....', '..lllml.....', '...lll......', '..dwwd......', '.ww.........', '............'],
  fist: ['............', '..mmmmmmm...', '.mllmllmllm.', '.mllmllmllm.', '.mmmmmmmmmm.', '.mmmmmmmmmm.', '.mmmmmmmmmd.', '..mmmmmmmd..', '..mmmmmmdd..', '..ddddddd...', '..ddddddd...', '............'],
  shield: ['............', '.wwwwwwwwww.', '.wmmmllmmmw.', '.wmmmllmmmw.', '.wllllllllw.', '.wllllllllw.', '.wmmmllmmmw.', '..wmmllmmw..', '...wmllmw...', '....wmmw....', '.....ww.....', '............'],
  arrow: ['............', '............', '........l...', '........ll..', '.wwwwwwwmml.', 'dwwwwwwwwmml', '.wwwwwwwmml.', '........ll..', '........l...', '............', '............', '............'],
  flame: ['.....m......', '....mm...m..', '...mmm..mm..', '...mmlmmmm..', '..mmllmmmmm.', '..mmlllmmmm.', '..mmlllllmm.', '..mmmlllmmd.', '...mmmlmmd..', '....mmmmd...', '.....dd.....', '............'],
  shard: ['.....l......', '....lll.....', '...lllml....', '..lllmmml...', '.llllmmmml..', 'lllllmmmmml.', '.llllmmmml..', '..lllmmml...', '...lllml....', '....lll.....', '.....l......', '............'],
  orb: ['............', '..l......l..', '....mmmm....', '...mllllm...', '..mlwwllmm..', '..mlwllmmm..', '..mllllmmm..', '..mmlllmmd..', '...mmmmmd...', '....dddd....', '............', '............'],
  heal: ['............', '....wwww....', '....wllw....', '....wllw....', '.wwwwllwwww.', '.wllllllllw.', '.wllllllllw.', '.wwwwllwwww.', '....wllw....', '....wllw....', '....wwww....', '............'],
  holy: ['.....ww.....', '..w..ww..w..', '...w.ll.w...', '....mllm....', 'ww.mllllm.ww', 'ww.mllllm.ww', '....mllm....', '...w.ll.w...', '..w..ww..w..', '.....ww.....', '............', '............'],
  dagger: ['..........ww', '.........wlw', '........wlw.', '.......wlw..', '......wlw...', '.....wlw....', '..d.wlw.....', '...ddw......', '..dd.d......', '.ddd........', '............', '............'],
  skull: ['............', '...llllll...', '..llllllll..', '.llllllllll.', '.lddllllddl.', '.lddllllddl.', '.llllddllll.', '..llllllll..', '...llllll...', '...ldldld...', '............', '............'],
  wind: ['............', '............', '..wwwwwww...', '.........w..', '.........ww.', '.llllllllll.', '............', '...mmmmmm...', '.........m..', '.........m..', '............', '............'],
  weaken: ['............', '....wwww....', '....wllw....', '....wllw....', '....wllw....', '.wwwwllwwww.', '..wllllllw..', '...wllllw...', '....wllw....', '.....ww.....', '............', '............'],
  snow: ['.....w......', '..w..w..w...', '...w.w.w....', '....www.....', '.wwwwlwwwww.', '....www.....', '...w.w.w....', '..w..w..w...', '.....w......', '............', '............', '............'],
  drop: ['.....w......', '.....ww.....', '....wmmw....', '....wmmw....', '...wmmmmw...', '..wmmlmmmw..', '..wmmlmmmw..', '..wmmmmmmw..', '...wmmmmw...', '....wwww....', '............', '............'],
};
