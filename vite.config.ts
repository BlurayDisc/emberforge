import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import packageJson from './package.json';

// Build number = commit count, so every push gives a higher number. Falls back to "dev" without git.
function readGitValue(command: string, fallback: string): string {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return fallback;
  }
}

const buildNumber = readGitValue('git rev-list --count HEAD', '0');
const commitHash = readGitValue('git rev-parse --short HEAD', 'dev');

export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 800 },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_LABEL__: JSON.stringify(`v${packageJson.version} build ${buildNumber} (${commitHash})`),
  },
});
