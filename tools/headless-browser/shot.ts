import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startChromeSession, type ChromeSession } from './chromeSession';

// Usage: npm run shot -- <url> '<steps json>' [width] [height]
// A step is { "wait": ms }, { "click": "button text" }, { "eval": "javascript" } or { "shot": "name" }. Shots go to out/shots/<name>.png.
// Real mouse input: { "move": [x, y] }, { "tap": [x, y] } and { "drag": [fromX, fromY, toX, toY] }, in page pixels.
type Step = { wait: number } | { click: string } | { eval: string } | { shot: string } | { move: [number, number] } | { tap: [number, number] } | { drag: [number, number, number, number] };

const OUTPUT_DIRECTORY = join('out', 'shots');

async function evaluate(session: ChromeSession, expression: string): Promise<unknown> {
  const result = (await session.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })) as { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  if (result.exceptionDetails) throw new Error(`Page script failed: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result?.value;
}

const DRAG_STEPS = 12;

async function mouse(session: ChromeSession, type: 'mouseMoved' | 'mousePressed' | 'mouseReleased', x: number, y: number): Promise<void> {
  await session.send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: type === 'mouseMoved' ? 0 : 1 });
}

async function runStep(session: ChromeSession, step: Step): Promise<void> {
  if ('move' in step) await mouse(session, 'mouseMoved', step.move[0], step.move[1]);
  else if ('tap' in step) {
    await mouse(session, 'mouseMoved', step.tap[0], step.tap[1]);
    await mouse(session, 'mousePressed', step.tap[0], step.tap[1]);
    await mouse(session, 'mouseReleased', step.tap[0], step.tap[1]);
  } else if ('drag' in step) {
    const [fromX, fromY, toX, toY] = step.drag;
    await mouse(session, 'mouseMoved', fromX, fromY);
    await mouse(session, 'mousePressed', fromX, fromY);
    for (let index = 1; index <= DRAG_STEPS; index++) {
      await mouse(session, 'mouseMoved', fromX + ((toX - fromX) * index) / DRAG_STEPS, fromY + ((toY - fromY) * index) / DRAG_STEPS);
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    await mouse(session, 'mouseReleased', toX, toY);
  } else if ('wait' in step) await new Promise((resolve) => setTimeout(resolve, step.wait));
  else if ('click' in step) {
    const wanted = JSON.stringify(step.click);
    const clicked = await evaluate(session, `(() => { const target = [...document.querySelectorAll('button, [role=button]')].find((element) => element.textContent.trim() === ${wanted}); if (!target) return false; target.click(); return true; })()`);
    if (!clicked) throw new Error(`No button with the text "${step.click}"`);
  } else if ('eval' in step) console.log('eval ->', JSON.stringify(await evaluate(session, step.eval)));
  else {
    const capture = (await session.send('Page.captureScreenshot', { format: 'png' })) as { data: string };
    mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    const filePath = join(OUTPUT_DIRECTORY, `${step.shot}.png`);
    writeFileSync(filePath, Buffer.from(capture.data, 'base64'));
    console.log(`Wrote ${filePath}`);
  }
}

const [url, stepsJson = '[]', widthText = '1280', heightText = '720'] = process.argv.slice(2);
if (!url) {
  console.error("Usage: npm run shot -- <url> '<steps json>' [width] [height]");
  process.exit(1);
}
const session = await startChromeSession(Number(widthText), Number(heightText));
try {
  await session.send('Page.navigate', { url });
  for (const step of JSON.parse(stepsJson) as Step[]) await runStep(session, step);
  if (session.consoleErrors.length > 0) console.log('Browser errors:\n' + session.consoleErrors.join('\n'));
  else console.log('No browser errors.');
} finally {
  session.close();
}
