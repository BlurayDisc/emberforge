import { startChromeSession } from './headless-browser/chromeSession';

// Usage: npm run audio-report -- <dev server url>   (start `npm run dev` first)
// Renders every music track and sound effect offline in a real Chrome and prints numbers. It cannot judge how a sound feels, so the player must still listen.
interface SoundReport {
  id: string;
  kind: 'effect' | 'music';
  peak: number;
  rms: number;
  leadingSilenceSeconds: number;
  soundSeconds: number;
  renderedSeconds: number;
  pitchHertz: number;
}

const CLIPPING_PEAK = 0.95;
const TOO_QUIET_PEAK = 0.02;
const LONG_LEADING_SILENCE_SECONDS = 0.1;

function problemsOf(report: SoundReport): string[] {
  const problems: string[] = [];
  if (report.peak >= CLIPPING_PEAK) problems.push('clips');
  if (report.peak < TOO_QUIET_PEAK) problems.push('too quiet or silent');
  if (report.leadingSilenceSeconds > LONG_LEADING_SILENCE_SECONDS && report.kind === 'effect') problems.push('starts late');
  return problems;
}

const url = process.argv[2];
if (!url) {
  console.error('Usage: npm run audio-report -- <dev server url>');
  process.exit(1);
}
const session = await startChromeSession(800, 600);
try {
  await session.send('Page.navigate', { url });
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const response = (await session.send('Runtime.evaluate', { expression: "import('/src/audio/offlineRender.ts').then((module) => module.reportAllAudio())", awaitPromise: true, returnByValue: true })) as { result?: { value?: SoundReport[] }; exceptionDetails?: unknown };
  const reports = response.result?.value;
  if (!reports) throw new Error(`Render failed: ${JSON.stringify(response.exceptionDetails)}`);
  let problemCount = 0;
  console.log('kind    id                          peak   rms    lead   sound  rendered  pitchHz');
  for (const report of reports) {
    const problems = problemsOf(report);
    problemCount += problems.length;
    console.log(`${report.kind.padEnd(7)} ${report.id.padEnd(27)} ${String(report.peak).padEnd(6)} ${String(report.rms).padEnd(6)} ${String(report.leadingSilenceSeconds).padEnd(6)} ${String(report.soundSeconds).padEnd(6)} ${String(report.renderedSeconds).padEnd(9)} ${report.pitchHertz}${problems.length > 0 ? `   <- ${problems.join(', ')}` : ''}`);
  }
  if (session.consoleErrors.length > 0) console.log('Browser errors:\n' + session.consoleErrors.join('\n'));
  process.exitCode = problemCount > 0 || session.consoleErrors.length > 0 ? 1 : 0;
} finally {
  session.close();
}
