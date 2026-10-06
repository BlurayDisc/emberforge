import { createSoftCanvas, type SoftCanvas } from './softCanvas';

// The art code calls document.createElement('canvas'). This gives it a software canvas in Node.
export function installHeadlessCanvas(): void {
  const headlessDocument = {
    createElement(tagName: string) {
      if (tagName !== 'canvas') throw new Error(`Headless document cannot create <${tagName}>`);
      return createSoftCanvas();
    },
  };
  Object.assign(globalThis, { document: headlessDocument });
}

// Art functions are typed as DOM canvases. In Node they are software canvases.
export function headlessCanvasOf(canvas: HTMLCanvasElement): SoftCanvas {
  return canvas as unknown as SoftCanvas;
}
