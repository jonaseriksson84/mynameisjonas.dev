export type SitePath = '/' | `/${string}/`;

export interface Command {
  readonly run: string;
  readonly name: string;
  readonly href: SitePath;
}

export const COMMANDS = [
  { run: 'cd ~', name: 'home', href: '/' },
  { run: 'ls blog/', name: 'blog', href: '/blog/' },
  { run: 'cat cv.md', name: 'cv', href: '/cv/' },
] as const satisfies readonly Command[];

declare const parsed: unique symbol;

export interface MissingPath {
  readonly shown: string;
  readonly leaf: string;
  readonly [parsed]: true;
}

export const SHOWN_MAX = 96;
export const LEAF_MAX = 32;

export function parseMissingPath(raw: string): MissingPath {
  let text = raw;
  try {
    text = decodeURIComponent(raw);
  } catch {
    text = raw;
  }
  text = text.replace(/\s+/g, ' ').replace(/[\p{Cc}\p{Cf}]/gu, '');
  if (!text.startsWith('/')) text = `/${text}`;
  const segments = text.split('/').filter(Boolean);
  return {
    shown: elideMiddle(text, SHOWN_MAX),
    leaf: elideEnd(segments.at(-1) ?? '/', LEAF_MAX),
  } as MissingPath;
}

function elideMiddle(text: string, max: number): string {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  const keep = Math.max(0, max - 1);
  const head = Math.ceil(keep / 2);
  const tail = keep - head;
  return `${chars.slice(0, head).join('')}…${chars.slice(chars.length - tail).join('')}`;
}

function elideEnd(text: string, max: number): string {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return `${chars.slice(0, Math.max(0, max - 1)).join('')}…`;
}

export type At = { readonly kind: 'page' } | { readonly kind: 'command'; readonly index: number };

export type NavKey =
  | 'next'
  | 'prev'
  | 'first'
  | 'last'
  | { readonly char: string; readonly time: number };

export interface TypeAhead {
  readonly typed: string;
  readonly time: number;
}

export const NO_TYPING: TypeAhead = { typed: '', time: Number.NEGATIVE_INFINITY };
export const TYPE_AHEAD_MS = 700;

export interface Move {
  readonly focus: number | null;
  readonly typeAhead: TypeAhead;
}

export function moveFocus(runs: readonly string[], at: At, key: NavKey, typeAhead: TypeAhead): Move {
  if (at.kind === 'page') return { focus: null, typeAhead: NO_TYPING };
  const last = runs.length - 1;
  if (key === 'next') return { focus: Math.min(at.index + 1, last), typeAhead: NO_TYPING };
  if (key === 'prev') return { focus: Math.max(at.index - 1, 0), typeAhead: NO_TYPING };
  if (key === 'first') return { focus: 0, typeAhead: NO_TYPING };
  if (key === 'last') return { focus: last, typeAhead: NO_TYPING };
  const typed = (key.time - typeAhead.time < TYPE_AHEAD_MS ? typeAhead.typed : '') + key.char;
  if (typed === ' ') return { focus: null, typeAhead: NO_TYPING };
  const head = typed[0] ?? '';
  const cycling = typed.length > 1 && [...typed].every((char) => char === head);
  const from = cycling ? at.index + 1 : at.index;
  const needle = cycling ? head : typed;
  const match = rotate(runs, from).find((run) => run.startsWith(needle));
  return {
    focus: match === undefined ? at.index : runs.indexOf(match),
    typeAhead: { typed, time: key.time },
  };
}

function rotate<T>(items: readonly T[], from: number): readonly T[] {
  const count = items.length;
  if (count === 0) return items;
  const start = ((from % count) + count) % count;
  return [...items.slice(start), ...items.slice(0, start)];
}

export function mountNotFound(root: HTMLElement, rawPath: string): void {
  const path = parseMissingPath(rawPath);
  for (const slot of all(root, '[data-missing-path]')) slot.textContent = path.shown;
  startGhost(one<HTMLCanvasElement>(root, 'canvas[data-ghost]'), path.leaf);
  bindCommands(all<HTMLAnchorElement>(root, 'a[data-run]'));
  one(root, '[data-keys-hint]').hidden = false;
}

function one<E extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string): E {
  const found = root.querySelector<E>(selector);
  if (!found) throw new Error(`404 markup is missing ${selector}`);
  return found;
}

function all<E extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string): E[] {
  const found = [...root.querySelectorAll<E>(selector)];
  if (found.length === 0) throw new Error(`404 markup is missing ${selector}`);
  return found;
}

function bindCommands(links: readonly HTMLAnchorElement[]): void {
  const runs = links.map((link) => link.dataset.run ?? '');
  let typeAhead = NO_TYPING;
  document.addEventListener('keydown', (event) => {
    const key = toNavKey(event);
    if (!key) return;
    const at = locate(links, document.activeElement);
    if (!at) return;
    const move = moveFocus(runs, at, key, typeAhead);
    typeAhead = move.typeAhead;
    if (move.focus === null) return;
    event.preventDefault();
    links[move.focus]?.focus();
  });
}

function toNavKey(event: KeyboardEvent): NavKey | null {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return null;
  if (event.key === 'ArrowDown') return 'next';
  if (event.key === 'ArrowUp') return 'prev';
  if (event.key === 'Home') return 'first';
  if (event.key === 'End') return 'last';
  if (event.key.length === 1) return { char: event.key.toLowerCase(), time: event.timeStamp };
  return null;
}

function locate(links: readonly HTMLAnchorElement[], active: Element | null): At | null {
  const index = active === null ? -1 : links.indexOf(active as HTMLAnchorElement);
  if (index >= 0) return { kind: 'command', index };
  if (active === null || active === document.body) return { kind: 'page' };
  return null;
}

const DOT_COLOR = '#cfcfcb';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);

function hash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

interface Grid {
  readonly cell: 4 | 3;
  readonly dot: 2 | 1.5;
  readonly cols: number;
  readonly rows: number;
  readonly dpr: number;
}

interface Raster {
  readonly grid: Grid;
  readonly lum: Float32Array;
  readonly fate: Float32Array;
  readonly haze: Uint8Array;
}

const TIMELINE = {
  sweepEnd: 0.8,
  glitch: [0.8, 1.4],
  decay: [1.3, 3.0],
  settled: 3.0,
} as const;

const SURVIVORS = 0.14;

function startGhost(canvas: HTMLCanvasElement, leaf: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('404 markup is missing a 2d context');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raster: Raster | null = null;
  let start: number | null = null;
  let t = reduce ? TIMELINE.settled : 0;
  let loop = 0;
  let ready = false;

  const tick = (now: number) => {
    start ??= now;
    t = Math.min(TIMELINE.settled, (now - start) / 1000);
    if (raster) drawGhost(ctx, raster, t);
    if (t < TIMELINE.settled) loop = window.requestAnimationFrame(tick);
    else loop = 0;
  };

  document.fonts
    .load("500 16px 'Geist Mono'")
    .catch(() => [])
    .then(() => {
      ready = true;
      raster = rasterize(canvas, leaf);
      if (reduce) drawGhost(ctx, raster, t);
      else loop = window.requestAnimationFrame(tick);
    });

  let pending = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(pending);
    pending = window.requestAnimationFrame(() => {
      if (!ready) return;
      raster = rasterize(canvas, leaf);
      if (reduce || loop === 0) drawGhost(ctx, raster, t);
    });
  });
}

function rasterize(canvas: HTMLCanvasElement, leaf: string): Raster {
  const wide = window.innerWidth > 720;
  const cell = wide ? 4 : 3;
  const dot = wide ? 2 : 1.5;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const cols = Math.floor(cssWidth / cell);
  const rows = Math.floor(cssHeight / cell);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const grid: Grid = { cell, dot, cols, rows, dpr };
  const count = cols * rows;
  const lum = new Float32Array(count);
  const fate = new Float32Array(count);
  const haze = new Uint8Array(count);
  if (cols < 1 || rows < 1) return { grid, lum, fate, haze };

  const sample = document.createElement('canvas');
  sample.width = cols;
  sample.height = rows;
  const o = sample.getContext('2d', { willReadFrequently: true });
  if (!o) throw new Error('404 markup is missing a 2d context');
  const fitted = fitLeaf((text, px) => {
    o.font = mono(px);
    return o.measureText(text).width;
  }, leaf, grid);
  o.clearRect(0, 0, cols, rows);
  o.font = mono(fitted.px);
  o.textBaseline = 'middle';
  o.fillStyle = '#ffffff';
  o.fillText(fitted.text, 0, rows / 2);
  const pixels = o.getImageData(0, 0, cols, rows).data;
  const gain = wide ? 0.62 : 0.8;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const p = j * cols + i;
      lum[p] = (pixels[p * 4 + 3]! / 255) * gain;
      fate[p] = hash(i + 2000, j);
      const chance = 0.03 * (1 - smoothstep(0.1, 1, i / cols));
      haze[p] = hash(i + 1000, j) < chance ? 1 + Math.floor(hash(i, j + 1000) * 3) : 0;
    }
  }
  return { grid, lum, fate, haze };
}

function mono(px: number): string {
  return `500 ${px}px 'Geist Mono', monospace`;
}

function fitLeaf(
  measure: (text: string, px: number) => number,
  leaf: string,
  grid: Grid,
): { readonly text: string; readonly px: number } {
  const max = grid.rows * 0.62;
  const min = grid.rows * 0.4;
  const width = measure(leaf, max);
  const px = width > 0 ? Math.min(max, Math.max(min, (max * grid.cols) / width)) : max;
  let text = leaf;
  while (measure(text, px) > grid.cols && Array.from(text).length > 1) {
    text = elideEnd(text, Array.from(text).length - 1);
  }
  return { text, px };
}

function drawGhost(ctx: CanvasRenderingContext2D, raster: Raster, t: number): void {
  const { cols, rows, cell, dot, dpr } = raster.grid;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (cols < 1 || rows < 1) return;

  const dotPx = Math.max(1, Math.floor(dot * dpr));
  const sweepRow = t >= TIMELINE.sweepEnd ? Infinity : (t / TIMELINE.sweepEnd) * rows;
  const slipTick = TIMELINE.glitch[0] <= t && t < TIMELINE.glitch[1] ? Math.floor(t * 15) : -1;
  const decayed = smoothstep(TIMELINE.decay[0], TIMELINE.decay[1], t);
  const dropout = (1 - SURVIVORS) * decayed;
  const solid = new Path2D();
  const groups = [new Path2D(), new Path2D(), new Path2D()];

  for (let j = 0; j < rows; j++) {
    const slip =
      slipTick >= 0 && hash(j, slipTick) < 0.18 ? Math.round((hash(j + 7, slipTick) - 0.5) * 8) : 0;
    for (let i = 0; i < cols; i++) {
      const src = i - slip;
      const l = src >= 0 && src < cols ? raster.lum[j * cols + src]! : 0;
      const v =
        j > sweepRow ? (j - sweepRow < 10 ? hash(i + slipTick * 31, j + Math.floor(t * 60)) * l : 0) : l;
      const p = j * cols + i;
      if (v > BAYER[(j & 3) * 4 + (i & 3)]! && raster.fate[p]! >= dropout) {
        const x = Math.round(i * cell * dpr);
        const y = Math.round(j * cell * dpr);
        if (decayed > 0) groups[Math.min(2, Math.floor(raster.fate[p]! * 3))]!.rect(x, y, dotPx, dotPx);
        else solid.rect(x, y, dotPx, dotPx);
      }
      if (raster.haze[p] && j <= sweepRow) {
        groups[raster.haze[p]! - 1]!.rect(Math.round(i * cell * dpr), Math.round(j * cell * dpr), dotPx, dotPx);
      }
    }
  }

  ctx.fillStyle = DOT_COLOR;
  ctx.globalAlpha = 1 - decayed;
  ctx.fill(solid);
  for (let k = 0; k < groups.length; k++) {
    ctx.globalAlpha = 1 + (0.18 + 0.18 * k - 1) * decayed;
    ctx.fill(groups[k]!);
  }
  ctx.globalAlpha = 1;
}
