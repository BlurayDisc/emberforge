export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export interface CurveAnchor {
  x: number;
  y: number;
}

// A curve through anchor points that straight lines on a log-log scale join (y grows as a power of x between two anchors).
// Outside the anchors the curve goes on with the exponent of the nearest segment, so it never stops at the last anchor.
export function interpolatePowerCurve(anchors: readonly CurveAnchor[], x: number): number {
  const lastSegmentStart = Math.max(0, anchors.length - 2);
  const segmentStart = anchors.findIndex((_anchor, index) => index < anchors.length - 1 && x <= (anchors[index + 1] as CurveAnchor).x);
  const from = anchors[segmentStart === -1 ? lastSegmentStart : segmentStart] as CurveAnchor;
  const to = anchors[(segmentStart === -1 ? lastSegmentStart : segmentStart) + 1] as CurveAnchor;
  const exponent = Math.log(to.y / from.y) / Math.log(to.x / from.x);
  return from.y * (x / from.x) ** exponent;
}

// A curve of straight lines through anchor points. Outside the anchors it goes on with the slope of the nearest segment, so it never stops at the last anchor.
export function interpolateLinearCurve(anchors: readonly CurveAnchor[], x: number): number {
  const lastSegmentStart = Math.max(0, anchors.length - 2);
  const segmentStart = anchors.findIndex((_anchor, index) => index < anchors.length - 1 && x <= (anchors[index + 1] as CurveAnchor).x);
  const from = anchors[segmentStart === -1 ? lastSegmentStart : segmentStart] as CurveAnchor;
  const to = anchors[(segmentStart === -1 ? lastSegmentStart : segmentStart) + 1] as CurveAnchor;
  return from.y + ((to.y - from.y) / (to.x - from.x)) * (x - from.x);
}
