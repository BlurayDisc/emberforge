import { Color, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { PALETTE } from './palette';

export const LOGICAL_WIDTH = 480;
export const LOGICAL_HEIGHT = 270;

export interface PixelStage {
  readonly scene: Scene;
  onFrame(update: (elapsedSeconds: number) => void): void;
}

function fitCanvasToContainer(canvas: HTMLCanvasElement, container: HTMLElement): void {
  const fittingScale = Math.min(container.clientWidth / LOGICAL_WIDTH, container.clientHeight / LOGICAL_HEIGHT);
  const integerScale = Math.max(1, Math.floor(fittingScale));
  canvas.style.width = `${LOGICAL_WIDTH * integerScale}px`;
  canvas.style.height = `${LOGICAL_HEIGHT * integerScale}px`;
}

export function createPixelStage(container: HTMLElement): PixelStage {
  const renderer = new WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(1);
  renderer.setSize(LOGICAL_WIDTH, LOGICAL_HEIGHT, false);
  container.appendChild(renderer.domElement);
  fitCanvasToContainer(renderer.domElement, container);
  new ResizeObserver(() => fitCanvasToContainer(renderer.domElement, container)).observe(container);

  const scene = new Scene();
  scene.background = new Color(PALETTE.night);
  const camera = new OrthographicCamera(
    -LOGICAL_WIDTH / 2,
    LOGICAL_WIDTH / 2,
    LOGICAL_HEIGHT / 2,
    -LOGICAL_HEIGHT / 2,
    -10,
    10,
  );

  const frameListeners: Array<(elapsedSeconds: number) => void> = [];
  const renderFrame = (timestampMilliseconds: number): void => {
    const elapsedSeconds = timestampMilliseconds / 1000;
    frameListeners.forEach((listener) => listener(elapsedSeconds));
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  };
  requestAnimationFrame(renderFrame);

  return {
    scene,
    onFrame: (update) => {
      frameListeners.push(update);
    },
  };
}
