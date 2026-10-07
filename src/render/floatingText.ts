import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './pixelStage';

const FLOATING_TEXT_SECONDS = 1.1;

interface FloatingLabel {
  element: HTMLElement;
  expiresAtSeconds: number;
}

// Damage numbers are DOM text over the stage. They expire on the battle clock, not on a browser timer,
// so pause stops them and a fast playback speed shortens them with everything else.
export interface FloatingTextLayer {
  spawn(centerX: number, topY: number, text: string, className: string, nowSeconds: number): void;
  update(nowSeconds: number): void;
  setTimeScale(timeScale: number): void;
  clear(): void;
}

export function createFloatingTextLayer(overlay: HTMLElement): FloatingTextLayer {
  const labels: FloatingLabel[] = [];
  let timeScale = 1;

  const applyPace = (element: HTMLElement): void => {
    element.style.animationDuration = `${FLOATING_TEXT_SECONDS / Math.max(timeScale, 0.001)}s`;
    element.style.animationPlayState = timeScale === 0 ? 'paused' : 'running';
  };

  return {
    spawn: (centerX, topY, text, className, nowSeconds) => {
      const element = document.createElement('div');
      element.className = `floating-text ${className}`;
      element.textContent = text;
      element.style.left = `${(centerX / LOGICAL_WIDTH) * 100}%`;
      element.style.top = `${(topY / LOGICAL_HEIGHT) * 100}%`;
      applyPace(element);
      overlay.append(element);
      labels.push({ element, expiresAtSeconds: nowSeconds + FLOATING_TEXT_SECONDS });
    },
    update: (nowSeconds) => {
      for (let index = labels.length - 1; index >= 0; index--) {
        const label = labels[index] as FloatingLabel;
        if (nowSeconds < label.expiresAtSeconds) continue;
        label.element.remove();
        labels.splice(index, 1);
      }
    },
    setTimeScale: (newTimeScale) => {
      timeScale = newTimeScale;
      labels.forEach((label) => applyPace(label.element));
    },
    clear: () => {
      labels.splice(0).forEach((label) => label.element.remove());
    },
  };
}
