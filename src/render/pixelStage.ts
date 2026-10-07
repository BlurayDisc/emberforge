import { Application, Container } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, TOWN_PAGE_WIDTH } from '../kernel/stageSize';
import { isWideTownView, onWideTownViewChange } from '../kernel/wideTownView';
import { PALETTE } from './palette';

export { LOGICAL_HEIGHT, LOGICAL_WIDTH };

// fixed: a 480x270 picture with a frame, as the battle and the castle need. fill: the picture fills the whole stage area, and
// the width of the view follows the shape of the screen. The town uses fill, so it works on a phone and on a wide window.
export type StageLayout = 'fixed' | 'fill';

export interface PixiLayer {
  // The Pixi views (town, battle, castle) are children of this container.
  readonly views: Container;
  // Drawn over every view, in screen space. The gold and the clock live here.
  readonly hud: Container;
  setLayout(layout: StageLayout): void;
  // The width of the view in logical pixels. The height is always LOGICAL_HEIGHT.
  viewWidth(): number;
  // Screen pixels for one logical pixel. Text is drawn at this scale, so it stays sharp.
  renderScale(): number;
  onViewResize(listener: () => void): void;
}

export interface PixelStage {
  readonly pixi: PixiLayer;
  readonly overlay: HTMLElement;
  // The box that holds the canvases. Pointer events from the picture reach it.
  readonly frame: HTMLElement;
  setLayout(layout: StageLayout): void;
  onFrame(update: (elapsedSeconds: number) => void): void;
}

// The frame outline is a box-shadow outside the frame. This margin keeps it from being cut by the container.
const FRAME_OUTLINE_MARGIN_PIXELS = 8;
// The view always shows a whole town page, because the town moves one page at a time. A very wide window stops growing at the maximum.
const MINIMUM_FILL_VIEW_WIDTH = TOWN_PAGE_WIDTH;
const MINIMUM_WIDE_VIEW_WIDTH = 2 * TOWN_PAGE_WIDTH;
const MAXIMUM_FILL_VIEW_WIDTH = 640;

interface ViewGeometry {
  viewWidth: number;
  scale: number;
  frameWidth: number;
  frameHeight: number;
}

// The stage grows to fill the window, so the scale is not always a whole number. Pixels are scaled with nearest-neighbour, so they stay hard-edged.
function fixedGeometry(container: HTMLElement): ViewGeometry {
  const availableWidth = container.clientWidth - 2 * FRAME_OUTLINE_MARGIN_PIXELS;
  const availableHeight = container.clientHeight - 2 * FRAME_OUTLINE_MARGIN_PIXELS;
  const scale = Math.max(1, Math.min(availableWidth / LOGICAL_WIDTH, availableHeight / LOGICAL_HEIGHT));
  return { viewWidth: LOGICAL_WIDTH, scale, frameWidth: Math.floor(LOGICAL_WIDTH * scale), frameHeight: Math.floor(LOGICAL_HEIGHT * scale) };
}

// The height fits the area. The width shows as much of the world as the shape of the screen allows, within the limits.
function fillGeometry(container: HTMLElement): ViewGeometry {
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  let scale = height / LOGICAL_HEIGHT;
  let viewWidth = Math.round(width / scale);
  const minimumViewWidth = isWideTownView() ? MINIMUM_WIDE_VIEW_WIDTH : MINIMUM_FILL_VIEW_WIDTH;
  if (viewWidth < minimumViewWidth) {
    viewWidth = minimumViewWidth;
    scale = width / viewWidth;
  } else if (viewWidth > MAXIMUM_FILL_VIEW_WIDTH) {
    viewWidth = MAXIMUM_FILL_VIEW_WIDTH;
  }
  return { viewWidth, scale, frameWidth: Math.floor(viewWidth * scale), frameHeight: Math.floor(LOGICAL_HEIGHT * scale) };
}

export function createPixelStage(container: HTMLElement): PixelStage {
  const overlay = document.createElement('div');
  overlay.className = 'stage-overlay';
  const frame = document.createElement('div');
  frame.className = 'stage-frame';
  frame.append(overlay);
  container.appendChild(frame);

  const pixiApplication = new Application();
  const pixiViews = new Container();
  pixiViews.sortableChildren = true;
  const pixiHud = new Container();
  let isPixiReady = false;
  let layout: StageLayout = 'fixed';
  let geometry: ViewGeometry = fixedGeometry(container);
  const viewResizeListeners: Array<() => void> = [];

  const applyLayout = (): void => {
    const previousViewWidth = geometry.viewWidth;
    geometry = layout === 'fill' ? fillGeometry(container) : fixedGeometry(container);
    frame.style.width = `${geometry.frameWidth}px`;
    frame.style.height = `${geometry.frameHeight}px`;
    frame.style.setProperty('--stage-scale', geometry.scale.toFixed(3));
    frame.classList.toggle('stage-frame-fill', layout === 'fill');
    if (isPixiReady) {
      pixiApplication.renderer.resize(geometry.viewWidth, LOGICAL_HEIGHT, geometry.scale * window.devicePixelRatio);
      pixiApplication.canvas.style.width = '100%';
      pixiApplication.canvas.style.height = '100%';
    }
    if (geometry.viewWidth !== previousViewWidth || isPixiReady) viewResizeListeners.forEach((listener) => listener());
  };
  applyLayout();
  onWideTownViewChange(applyLayout);
  new ResizeObserver(applyLayout).observe(container);

  // Pixi starts asynchronously. The stage shows its background colour until it is ready.
  pixiApplication
    .init({ width: geometry.viewWidth, height: LOGICAL_HEIGHT, antialias: false, resolution: geometry.scale * window.devicePixelRatio, autoDensity: false, roundPixels: true, background: PALETTE.night, autoStart: false, preference: 'webgl' })
    .then(() => {
      pixiApplication.ticker.stop();
      pixiApplication.canvas.className = 'stage-pixi-canvas';
      frame.insertBefore(pixiApplication.canvas, overlay);
      pixiApplication.stage.addChild(pixiViews, pixiHud);
      isPixiReady = true;
      applyLayout();
    })
    .catch((error: unknown) => console.error('Pixi.js could not start', error));

  const frameListeners: Array<(elapsedSeconds: number) => void> = [];
  // requestAnimationFrame stops in a hidden browser tab, so the game pauses there.
  const renderFrame = (timestampMilliseconds: number): void => {
    const elapsedSeconds = timestampMilliseconds / 1000;
    frameListeners.forEach((listener) => listener(elapsedSeconds));
    if (isPixiReady) pixiApplication.render();
    requestAnimationFrame(renderFrame);
  };
  requestAnimationFrame(renderFrame);

  const setLayout = (newLayout: StageLayout): void => {
    if (newLayout === layout) return;
    layout = newLayout;
    applyLayout();
  };

  return {
    pixi: {
      views: pixiViews,
      hud: pixiHud,
      setLayout,
      viewWidth: () => geometry.viewWidth,
      renderScale: () => geometry.scale * window.devicePixelRatio,
      onViewResize: (listener) => {
        viewResizeListeners.push(listener);
      },
    },
    overlay,
    frame,
    setLayout,
    onFrame: (update) => {
      frameListeners.push(update);
    },
  };
}
