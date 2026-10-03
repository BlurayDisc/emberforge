export interface Random {
  nextFloat(): number;
  nextInt(minimum: number, maximum: number): number;
  chance(probability: number): boolean;
  pick<Option>(options: readonly Option[]): Option;
  pickWeighted<Option>(options: readonly Option[], weightOf: (option: Option) => number): Option;
  fork(streamName: string): Random;
}

const UINT32_RANGE = 4294967296;

function hashText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createUnitSequence(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

class SeededRandom implements Random {
  private readonly seed: number;
  private readonly nextUnit: () => number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
    this.nextUnit = createUnitSequence(this.seed);
  }

  nextFloat(): number {
    return this.nextUnit();
  }

  nextInt(minimum: number, maximum: number): number {
    return minimum + Math.floor(this.nextUnit() * (maximum - minimum + 1));
  }

  chance(probability: number): boolean {
    return this.nextUnit() < probability;
  }

  pick<Option>(options: readonly Option[]): Option {
    if (options.length === 0) throw new Error('Cannot pick from an empty list');
    return options[this.nextInt(0, options.length - 1)] as Option;
  }

  pickWeighted<Option>(options: readonly Option[], weightOf: (option: Option) => number): Option {
    const totalWeight = options.reduce((sum, option) => sum + weightOf(option), 0);
    if (!(totalWeight > 0)) throw new Error('Weighted pick needs a positive total weight');
    let remainingWeight = this.nextUnit() * totalWeight;
    for (const option of options) {
      remainingWeight -= weightOf(option);
      if (remainingWeight < 0) return option;
    }
    return options[options.length - 1] as Option;
  }

  fork(streamName: string): Random {
    return new SeededRandom(this.seed ^ hashText(streamName));
  }
}

export function createRandom(seed: number): Random {
  return new SeededRandom(seed);
}
