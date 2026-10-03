import { Color, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { PALETTE } from './palette';

export { LOGICAL_HEIGHT, LOGICAL_WIDTH };

export interface PixelStage {
  readonly scene: Scene;
  readonly overlay: HTMLElement;
  // Moves the camera along x, in scene pixels. The town scrolls with it. Battle scenes keep it at 0.
  setCameraX(sceneX: number): void;
  onFrame(update: (elapsedSeconds: number) => void): void;
}

// The frame outline is a box-shadow outside the frame. This margin keeps it from being cut by the container.
const FRAME_OUTLINE_MARGIN_PIXELS = 8;

// The stage grows to fill the window, so the scale is not always a whole number. The canvas is
// still drawn at 480x270 and scaled with nearest-neighbour, so pixels stay hard-edged.
function fitFrameToContainer(frame: HTMLElement, container: HTMLElement): void {
  const availableWidth = container.clientWidth - 2 * FRAME_OUTLINE_MARGIN_PIXELS;
  const availableHeight = container.clientHeight - 2 * FRAME_OUTLINE_MARGIN_PIXELS;
  const fittingScale = Math.max(1, Math.min(availableWidth / LOGICAL_WIDTH, availableHeight / LOGICAL_HEIGHT));
  frame.style.width = `${Math.floor(LOGICAL_WIDTH * fittingScale)}px`;
  frame.style.height = `${Math.floor(LOGICAL_HEIGHT * fittingScale)}px`;
  frame.style.setProperty('--stage-scale', fittingScale.toFixed(3));
}

export function createPixelStage(container: HTMLElement): PixelStage {
  const renderer = new WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(1);
  renderer.setSize(LOGICAL_WIDTH, LOGICAL_HEIGHT, false);

  const overlay = document.createElement('div');
  overlay.className = 'stage-overlay';
  const frame = document.createElement('div');
  frame.className = 'stage-frame';
  frame.append(renderer.domElement, overlay);
  container.appendChild(frame);
  fitFrameToContainer(frame, container);
  new ResizeObserver(() => fitFrameToContainer(frame, container)).observe(container);

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
  // requestAnimationFrame stops in a hidden browser tab, so the game pauses there.
  const renderFrame = (timestampMilliseconds: number): void => {
    const elapsedSeconds = timestampMilliseconds / 1000;
    frameListeners.forEach((listener) => listener(elapsedSeconds));
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  };
  requestAnimationFrame(renderFrame);

  return {
    scene,
    overlay,
    setCameraX: (sceneX) => {
      camera.position.x = Math.round(sceneX);
    },
    onFrame: (update) => {
      frameListeners.push(update);
    },
  };
}
