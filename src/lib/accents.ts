// The site is mono; only the accent changes. Visitors can pick their own,
// remembered per browser. First entry is the default.
export const ACCENTS: [name: string, hex: string][] = [
  ['yellow', '#f5e70a'],
  ['orange', '#ff6a1a'],
  ['red', '#ff3b24'],
  ['lime', '#b6ff3b'],
  ['mint', '#3dffb0'],
  ['cyan', '#22d3ee'],
  ['blue', '#3d5afe'],
  ['violet', '#9b7bff'],
  ['pink', '#ff3ea5'],
  ['grey', '#8a8a86'],
];

export const ACCENT_KEY = 'accent';
export const DEFAULT_ACCENT = ACCENTS[0][1];

export function isHex(value: string | null | undefined): value is string {
  return !!value && /^#[0-9a-f]{6}$/i.test(value);
}
