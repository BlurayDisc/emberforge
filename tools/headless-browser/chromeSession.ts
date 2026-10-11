import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const START_TIMEOUT_MILLISECONDS = 15000;
const SESSION_TIMEOUT_MILLISECONDS = 120000;
const STOP_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

export interface ChromeSession {
  send(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  consoleErrors: string[];
  close(): void;
}

// Chrome picks a free port (--remote-debugging-port=0) and writes it to DevToolsActivePort in the profile folder.
// A fixed port would let a leftover Chrome or a parallel run answer in place of this one.
async function waitForDebuggerUrl(profileDirectory: string): Promise<string> {
  const deadline = Date.now() + START_TIMEOUT_MILLISECONDS;
  while (Date.now() < deadline) {
    try {
      const port = readFileSync(join(profileDirectory, 'DevToolsActivePort'), 'utf8').split('\n')[0];
      const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Chrome did not start in time');
}

// Chrome starts in its own process group, so one kill stops its helper processes too (GPU, renderer, network).
function stopChromeAndRemoveProfile(chrome: ChildProcess, profileDirectory: string): void {
  try {
    if (chrome.pid !== undefined) process.kill(-chrome.pid, 'SIGKILL');
  } catch {
    // The process group is already gone.
  }
  rmSync(profileDirectory, { recursive: true, force: true, maxRetries: 3 });
}

// A headless Chrome window gets animation frames, which a background tab does not. SwiftShader gives it WebGL without a GPU.
// SwiftShader renders on the CPU, so a Chrome that is left running burns CPU. Every exit path must stop it.
export async function startChromeSession(width: number, height: number): Promise<ChromeSession> {
  const profileDirectory = mkdtempSync(join(tmpdir(), 'emberforge-chrome-'));
  const chrome: ChildProcess = spawn(CHROME_PATH, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDirectory}`, `--window-size=${width},${height}`,
    '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore', detached: true });

  let socket: WebSocket | undefined;
  let isClosed = false;
  const close = (): void => {
    if (isClosed) return;
    isClosed = true;
    clearTimeout(sessionTimer);
    process.off('exit', close);
    for (const signal of STOP_SIGNALS) process.off(signal, stopOnSignal);
    socket?.close();
    stopChromeAndRemoveProfile(chrome, profileDirectory);
  };
  const stopOnSignal = (signal: NodeJS.Signals): void => {
    close();
    process.exit(128 + (signal === 'SIGINT' ? 2 : signal === 'SIGHUP' ? 1 : 15));
  };
  // Without this limit a hung page keeps the script, and Chrome, alive for ever.
  const sessionTimer = setTimeout(() => {
    console.error(`Chrome session took longer than ${SESSION_TIMEOUT_MILLISECONDS / 1000} s. Stopping it.`);
    close();
    process.exit(1);
  }, SESSION_TIMEOUT_MILLISECONDS);
  sessionTimer.unref();
  process.on('exit', close);
  for (const signal of STOP_SIGNALS) process.on(signal, stopOnSignal);
  chrome.on('error', (error) => {
    console.error(`Chrome could not start: ${error.message}`);
    close();
    process.exit(1);
  });

  try {
    socket = new WebSocket(await waitForDebuggerUrl(profileDirectory));
    const openedSocket = socket;
    await new Promise<void>((resolve, reject) => {
      openedSocket.addEventListener('open', () => resolve());
      openedSocket.addEventListener('error', () => reject(new Error('Chrome debugger connection failed')));
    });

    let nextId = 1;
    const pending = new Map<number, (result: Record<string, unknown>) => void>();
    const consoleErrors: string[] = [];
    openedSocket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as { id?: number; result?: Record<string, unknown>; method?: string; params?: Record<string, unknown> };
      if (message.id !== undefined) pending.get(message.id)?.(message.result ?? {});
      if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(JSON.stringify((message.params?.exceptionDetails as { exception?: { description?: string } })?.exception?.description ?? message.params));
      if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') consoleErrors.push(JSON.stringify(message.params.args));
    });
    const send: ChromeSession['send'] = (method, params = {}) =>
      new Promise((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        openedSocket.send(JSON.stringify({ id, method, params }));
      });
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    return { send, consoleErrors, close };
  } catch (error) {
    close();
    throw error;
  }
}
