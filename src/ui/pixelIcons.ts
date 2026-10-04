export type IconName = 'heroes' | 'inventory' | 'workshop' | 'merchant' | 'dungeons' | 'world' | 'menu' | 'coin-gold' | 'coin-silver' | 'coin-copper';

interface IconArt {
  rows: readonly string[];
  legend: Readonly<Record<string, string>>;
}

const BASE_LEGEND = {
  o: '#17110d',
  s: '#c0c8d0',
  S: '#6f7482',
  g: '#f2c14e',
  d: '#b9821f',
  r: '#b23a3a',
  w: '#8a6340',
  W: '#6a4a30',
  p: '#ead9a8',
  b: '#5a8fe0',
} as const;

const COIN_ROWS = [
  '..oooo..',
  '.oLLMMo.',
  'oLMMMMMo',
  'oMMMMMMo',
  'oMMMMMDo',
  'oMMMMDDo',
  '.oDDDDo.',
  '..oooo..',
] as const;

function coinLegend(light: string, middle: string, dark: string): Readonly<Record<string, string>> {
  return { o: '#17110d', L: light, M: middle, D: dark };
}

const ICONS: Record<IconName, IconArt> = {
  heroes: {
    rows: [
      'oooooooooooo',
      'ossssggsssso',
      'ossssggsssso',
      'oggggggggggo',
      'oggggggggggo',
      'ossssggsssso',
      '.ossssggsso.',
      '.ossssggsso.',
      '..ossggsso..',
      '...osggso...',
      '....oggo....',
      '....oooo....',
    ],
    legend: BASE_LEGEND,
  },
  inventory: {
    rows: [
      '...oo..oo...',
      '....oooo....',
      '....owwo....',
      '...oggggo...',
      '..owwwwwwo..',
      '.owwwwwwwwo.',
      '.owwwWwwwwo.',
      '.owwwwwwwwo.',
      '.owwwwwwwwo.',
      '.owwwwwwwwo.',
      '..oooooooo..',
      '............',
    ],
    legend: BASE_LEGEND,
  },
  workshop: {
    rows: [
      '............',
      '.oooooooooo.',
      'osssssssssso',
      'oSSSSSSSSSo.',
      '.osssssssso.',
      '..oSSSSSo...',
      '...oSSSo....',
      '...oSSSo....',
      '..oSSSSSo...',
      '.owwwwwwwwo.',
      '.oooooooooo.',
      '............',
    ],
    legend: BASE_LEGEND,
  },
  merchant: {
    rows: [
      '............',
      '...oooooo...',
      '..oggggggo..',
      '.oggddddggo.',
      '.ogdggggdgo.',
      '.ogdgddggdo.',
      '.ogdggdgdgo.',
      '.ogdgddggdo.',
      '.ogdggggdgo.',
      '.oggddddggo.',
      '..oggggggo..',
      '...oooooo...',
    ],
    legend: BASE_LEGEND,
  },
  dungeons: {
    rows: [
      '..oooooooo..',
      '.osssssssso.',
      'osssssssssso',
      'osssoooossso',
      'ossoooooosso',
      'ossoooooosso',
      'ossoooooosso',
      'ossoooooosso',
      'ossoooooosso',
      'ossoooooosso',
      'oooooooooooo',
      '............',
    ],
    legend: BASE_LEGEND,
  },
  world: {
    rows: [
      '............',
      'oooooooooooo',
      'oppppppppppo',
      'oppgpppppppo',
      'opppppbbpppo',
      'opppbbpppppo',
      'oppppppprppo',
      'oppppppppppo',
      'oooooooooooo',
      '............',
      '............',
      '............',
    ],
    legend: BASE_LEGEND,
  },
  menu: {
    rows: [
      '............',
      'oooooooooooo',
      'oppppppppppo',
      'opWWWWWWpppo',
      'oppppppppppo',
      'opWWWWWWWWpo',
      'oppppppppppo',
      'opWWWWWppppo',
      'oppppppppppo',
      'oooooooooooo',
      '............',
      '............',
    ],
    legend: BASE_LEGEND,
  },
  'coin-gold': { rows: COIN_ROWS, legend: coinLegend('#ffe9a0', '#f2c14e', '#b9821f') },
  'coin-silver': { rows: COIN_ROWS, legend: coinLegend('#f4f6fa', '#c0c8d0', '#7d8594') },
  'coin-copper': { rows: COIN_ROWS, legend: coinLegend('#f0b88a', '#d98a4e', '#8f4f26') },
};

const dataUrlByName = new Map<IconName, string>();

function drawIconToDataUrl(art: IconArt): string {
  const canvas = document.createElement('canvas');
  canvas.width = art.rows[0]?.length ?? 0;
  canvas.height = art.rows.length;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');
  art.rows.forEach((row, rowIndex) => {
    [...row].forEach((symbol, columnIndex) => {
      const color = art.legend[symbol];
      if (color === undefined) return;
      context.fillStyle = color;
      context.fillRect(columnIndex, rowIndex, 1, 1);
    });
  });
  return canvas.toDataURL();
}

export function createPixelIcon(name: IconName, scale = 2): HTMLImageElement {
  const art = ICONS[name];
  let dataUrl = dataUrlByName.get(name);
  if (dataUrl === undefined) {
    dataUrl = drawIconToDataUrl(art);
    dataUrlByName.set(name, dataUrl);
  }
  const icon = document.createElement('img');
  icon.className = 'pixel-icon';
  icon.src = dataUrl;
  icon.alt = '';
  icon.width = (art.rows[0]?.length ?? 0) * scale;
  icon.height = art.rows.length * scale;
  return icon;
}
