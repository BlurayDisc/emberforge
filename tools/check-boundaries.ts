import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(projectRoot, 'src');
const dataRoot = join(projectRoot, 'data');

const layersEachLayerMayImport: Record<string, readonly string[]> = {
  kernel: [],
  model: ['kernel'],
  content: ['kernel', 'model'],
  systems: ['kernel', 'model', 'content'],
  game: ['kernel', 'model', 'content', 'systems'],
  render: ['kernel', 'model', 'content'],
  ui: ['kernel', 'model', 'content', 'game'],
  app: ['kernel', 'model', 'content', 'game', 'render', 'ui'],
};

const forbiddenInsideSystems = [
  { pattern: /Math\.random\(/, reason: 'use the seeded Random from kernel' },
  { pattern: /Date\.now\(|new Date\(|performance\.now\(/, reason: 'systems must not read the clock; pass time in' },
  { pattern: /\b(?:document|window|localStorage)\b/, reason: 'systems must not touch the browser' },
];

const relativeImportPattern = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]*)['"]/g;
const threeImportPattern = /from\s+['"]three(?:\/[^'"]*)?['"]/;

interface Location {
  layer: string | undefined;
  system: string | undefined;
  pathInsideSystem: string[];
}

function locate(absolutePath: string): Location {
  const segments = relative(sourceRoot, absolutePath).split(sep);
  const isLayerDirectory = segments.length === 1 && !segments[0]?.includes('.');
  const layer = segments.length > 1 || isLayerDirectory ? segments[0] : undefined;
  const isInsideSystem = layer === 'systems' && segments.length > 1;
  return {
    layer,
    system: isInsideSystem ? segments[1] : undefined,
    pathInsideSystem: isInsideSystem ? segments.slice(2) : [],
  };
}

function listTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => extname(entry) === '.ts')
    .map((entry) => join(directory, entry));
}

function isSystemEntryPoint(pathInsideSystem: string[]): boolean {
  if (pathInsideSystem.length === 0) return true;
  return pathInsideSystem.length === 1 && pathInsideSystem[0]?.replace(/\.ts$/, '') === 'index';
}

function findViolations(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const from = locate(file);
  const violations: string[] = [];

  if (from.layer !== 'render' && threeImportPattern.test(source)) {
    violations.push('only render/ may import three');
  }

  if (from.layer === 'systems') {
    for (const { pattern, reason } of forbiddenInsideSystems) {
      if (pattern.test(source)) violations.push(`${pattern.source} found: ${reason}`);
    }
  }

  if (from.layer === undefined) return violations;
  const allowedLayers = layersEachLayerMayImport[from.layer] ?? [];

  for (const match of source.matchAll(relativeImportPattern)) {
    const specifier = match[1] as string;
    const resolvedTarget = resolve(dirname(file), specifier);
    if (resolvedTarget.startsWith(dataRoot + sep)) {
      if (from.layer !== 'content') violations.push(`only content/ may read data/ ('${specifier}')`);
      continue;
    }
    const target = locate(resolvedTarget);
    if (target.layer === undefined) {
      violations.push(`'${specifier}' imports outside any layer`);
      continue;
    }
    if (target.layer !== from.layer && !allowedLayers.includes(target.layer)) {
      violations.push(`${from.layer}/ must not import ${target.layer}/ ('${specifier}')`);
    }
    if (target.layer === 'systems' && from.layer === 'systems' && target.system !== from.system) {
      violations.push(`system '${from.system}' must not import system '${target.system}' ('${specifier}')`);
    }
    if (target.layer === 'systems' && from.layer !== 'systems' && !isSystemEntryPoint(target.pathInsideSystem)) {
      violations.push(`import systems/${target.system} through its index only ('${specifier}')`);
    }
  }
  return violations;
}

const files = listTypeScriptFiles(sourceRoot);
const problems = files.flatMap((file) =>
  findViolations(file).map((violation) => `${relative(projectRoot, file)}: ${violation}`),
);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Boundaries OK (${files.length} files checked)`);
