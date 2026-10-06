export function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16);
}

export function mixHex(fromHex: string, toHex: string, amount: number): number {
  const from = hexToNumber(fromHex);
  const to = hexToNumber(toHex);
  const channel = (shift: number): number => Math.round(((from >> shift) & 255) * (1 - amount) + ((to >> shift) & 255) * amount);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}
