import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9333;
const START_TIMEOUT_MILLISECONDS = 15000;

export interface ChromeSession {
  send(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  consoleErrors: string[];
  close(): void;
}

async function waitForDebugger(): Promise<string> {
  const deadline = Date.now() + START_TIMEOUT_MILLISECONDS;
  while (Date.now() < deadline) {
    try {
      const targets = (await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Chrome did not start in time');
}

// A headless Chrome window gets animation frames, which a background tab does not. SwiftShader gives it WebGL without a GPU.
export async function startChromeSession(width: number, height: number): Promise<ChromeSession> {
  const profileDirectory = mkdtempSync(join(tmpdir(), 'emberforge-chrome-'));
  const chrome: ChildProcess = spawn(CHROME_PATH, [
    '--headless=new', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profileDirectory}`, `--window-size=${width},${height}`,
    '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' });
  const socket = new WebSocket(await waitForDebugger());
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve());
    socket.addEventListener('error', () => reject(new Error('Chrome debugger connection failed')));
  });

  let nextId = 1;
  const pending = new Map<number, (result: Record<string, unknown>) => void>();
  const consoleErrors: string[] = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data)) as { id?: number; result?: Record<string, unknown>; method?: string; params?: Record<string, unknown> };
    if (message.id !== undefined) pending.get(message.id)?.(message.result ?? {});
    if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(JSON.stringify((message.params?.exceptionDetails as { exception?: { description?: string } })?.exception?.description ?? message.params));
    if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') consoleErrors.push(JSON.stringify(message.params.args));
  });
  const send: ChromeSession['send'] = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  return {
    send,
    consoleErrors,
    close: () => {
      socket.close();
      chrome.kill();
    },
  };
}
