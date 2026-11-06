'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * DraupnirRings
 * -------------
 * The mark multiplies into eight rings; one flies to the pointer and becomes
 * the cursor. Clicking throws eight more.
 *
 * Two ways to run the opening:
 *
 *   <DraupnirRings loader />      dark loading screen, logo centred, rings
 *                                 spawn, overlay lifts once one reaches the
 *                                 cursor. Shown once per session.
 *
 *   <DraupnirRings />             no overlay; rings come from the header mark
 *                                 on mount.
 *
 * Mount ONCE in app/layout.tsx, after {children}. Mark the header logo with
 * data-ring-origin so the inline opening (and all later bursts) start there.
 *
 * Performance note: the glow is pre-rendered into small cached sprites at
 * startup, so no canvas filter runs per frame. Keep `color` on 'gold' where
 * you can — 'cream'/'flash' use mix-blend-mode, which forces the browser to
 * re-composite whatever is underneath (expensive over a playing video).
 */

type ColorMode = 'gold' | 'cream' | 'flash';

export type DraupnirRingsProps = {
  /** Element the rings are born from. Defaults to the first [data-ring-origin]. */
  originSelector?: string;
  gravity?: number;
  /** Floor restitution, 0–1. */
  bounce?: number;
  /** Floor hits before a ring stops colliding and drops out of frame. 0 = never bounces. */
  bounceLimit?: number;
  ringCount?: number;
  ringSize?: number;
  /** Halo strength, 0–1. */
  glow?: number;
  /** Halo spread, px. */
  glowRadius?: number;
  /** Blurs the ring line itself, 0–1. */
  softness?: number;
  color?: ColorMode;
  cursorHoverSize?: number;
  cursorRing?: boolean;
  clickBurst?: boolean;
  /**
   * Stacking order of the falling rings. Keep this BELOW the nav so rings
   * pass behind it, the way anything else on the page would.
   */
  zIndex?: number;
  /**
   * Stacking order of the cursor ring, which lives on its own canvas. It must
   * stay above everything hoverable: the ring replaces the real pointer, so
   * anything painted over it leaves the visitor with no cursor at all. Only
   * lower it if something genuinely must cover the pointer.
   */
  cursorZIndex?: number;
  /** Show the dark loading screen on first visit. */
  loader?: boolean;
  /** Wordmark on the loading screen. */
  loaderTitle?: string;
  /** Second line under the wordmark. */
  loaderSubtitle?: string;
  /** Mount -> loading bar full, ms. The rings follow, then the overlay lifts. */
  loaderDurationMs?: number;
  /** Width of the loading bar, px. */
  loaderBarWidth?: number;
  /** Only show the loader once per browser session. */
  loaderOnce?: boolean;
  /** Hard ceiling on the loader, ms. It always lifts by then. */
  loaderMaxMs?: number;
  /** Background of the loading screen. */
  loaderBackground?: string;
};

const CREAM: readonly number[] = [243, 239, 232];
const GOLD: readonly number[] = [222, 168, 72];
const TAU = Math.PI * 2;

const DEFAULTS = {
  originSelector: '[data-ring-origin]',
  gravity: 3050,
  bounce: 0.24,
  bounceLimit: 1,
  ringCount: 8,
  ringSize: 7,
  glow: 1,
  glowRadius: 20,
  softness: 1,
  color: 'gold' as ColorMode,
  cursorHoverSize: 20,
  cursorRing: true,
  clickBurst: true,
  zIndex: 30,
  cursorZIndex: 2147483000,
  loader: false,
  loaderTitle: 'DRAUPNIR',
  loaderSubtitle: 'MEDIA',
  loaderDurationMs: 2300,
  loaderBarWidth: 220,
  loaderOnce: true,
  loaderMaxMs: 7000,
  loaderBackground: '#0b0b0b',
};

const TIMING = {
  startDelay: 0.45,
  flyDelay: 0.32,
  life: 2.8,
  restFade: 0.8,
  airDrag: 0.12,
  wallBounce: 0.55,
  floorPad: 22,
  lineWidth: 1.3,
  maxRings: 48,
  loaderBarStartMs: 900,   // copy has finished arriving by here
  loaderFadeMs: 550,
  loaderHoldMs: 220,   // beat after the ring lands, before the site shows
};

const CURSOR_CLASS = 'draupnir-ring-cursor';
const SESSION_KEY = 'draupnir:loader-shown';
const LOADER_Z = 2147483640;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function DraupnirRings(props: DraupnirRingsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const loaderMarkRef = useRef<SVGSVGElement | null>(null);
  const loaderCopyRef = useRef<HTMLDivElement | null>(null);
  const loaderBarRef = useRef<HTMLSpanElement | null>(null);
  const cfg = useRef({ ...DEFAULTS, ...stripUndefined(props) });
  const skipLoader = useRef(false);
  const decided = useRef(false);
  // the canvas must outrank the overlay until the overlay is gone, and React
  // owns style.zIndex — setting it imperatively just gets overwritten
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    cfg.current = { ...DEFAULTS, ...stripUndefined(props) };
  });

  // decide before first paint whether the overlay should ever be seen
  useIsomorphicLayoutEffect(() => {
    if (decided.current) return;        // StrictMode mounts the effect twice
    decided.current = true;
    const c = cfg.current;
    if (!c.loader) { skipLoader.current = true; return; }
    let seen = false;
    try { seen = c.loaderOnce && sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* private mode */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      skipLoader.current = true;
      const el = overlayRef.current;
      if (el) { el.style.display = 'none'; }
    } else {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const cvCur = cursorCanvasRef.current;
    if (!cv || !cvCur) return;
    const ctx = cv.getContext('2d');
    const curCtx = cvCur.getContext('2d');
    if (!ctx || !curCtx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const useLoader = cfg.current.loader && !skipLoader.current && !reduced;

    let W = 0, H = 0, DPR = 1;
    const resize = () => {
      const next = Math.min(window.devicePixelRatio || 1, 2);
      if (next !== DPR) sprites.clear();
      DPR = next;
      W = window.innerWidth; H = window.innerHeight;
      for (const [el, c2] of [[cv, ctx], [cvCur, curCtx]] as const) {
        el.width = Math.round(W * DPR); el.height = Math.round(H * DPR);
        c2.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
    };

    // ----------------------------------------------------------------
    // Glow sprites. The halo is blurred ONCE per radius and cached, so the
    // frame loop only ever calls drawImage. This is the whole performance
    // story: a per-frame full-screen blur costs ~100x this.
    // ----------------------------------------------------------------
    type Sprite = { canvas: HTMLCanvasElement; size: number; radius: number };
    const sprites = new Map<string, Sprite>();

    const buildSprite = (radius: number, col: readonly number[]): Sprite => {
      const c = cfg.current;
      const pad = Math.ceil(c.glowRadius * 1.7 + c.softness * 4 + 4);
      const size = Math.ceil((radius + pad) * 2);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(size * DPR);
      canvas.height = Math.round(size * DPR);
      const x = canvas.getContext('2d')!;
      x.setTransform(DPR, 0, 0, DPR, 0, 0);
      const mid = size / 2;
      const rgb = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;

      if (c.glow > 0.01 && c.glowRadius > 0) {
        x.save();
        x.filter = `blur(${c.glowRadius.toFixed(2)}px)`;
        x.globalAlpha = Math.min(1, c.glow);
        x.strokeStyle = rgb;
        x.lineWidth = TIMING.lineWidth + 1;
        x.beginPath(); x.arc(mid, mid, radius, 0, TAU); x.stroke();
        x.restore();
      }
      x.save();
      if (c.softness > 0.01) x.filter = `blur(${(c.softness * 1.6).toFixed(2)}px)`;
      x.strokeStyle = rgb;
      x.lineWidth = TIMING.lineWidth;
      x.beginPath(); x.arc(mid, mid, radius, 0, TAU); x.stroke();
      x.restore();

      return { canvas, size, radius };
    };

    const getSprite = (radius: number, col: readonly number[], tag: string): Sprite => {
      const r = Math.max(1, Math.round(radius * 2) / 2);
      const key = `${r}|${tag}|${cfg.current.glow}|${cfg.current.glowRadius}|${cfg.current.softness}`;
      let s = sprites.get(key);
      if (!s) {
        if (sprites.size > 48) sprites.clear();
        s = buildSprite(r, col);
        sprites.set(key, s);
      }
      return s;
    };

    resize();
    window.addEventListener('resize', resize);

    const styleEl = document.createElement('style');
    styleEl.textContent =
      `body.${CURSOR_CLASS}, body.${CURSOR_CLASS} * { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    // ----------------------------------------------------------------
    // Where rings are born: the loader mark while it's up, else the header
    // ----------------------------------------------------------------
    let loaderUp = useLoader;
    const originEl = (): Element | null =>
      (loaderUp && loaderMarkRef.current) || document.querySelector(cfg.current.originSelector);

    const originPos = () => {
      const el = originEl();
      if (el) {
        const b = el.getBoundingClientRect();
        if (b.width || b.height) return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      }
      return loaderUp ? { x: W / 2, y: H / 2 } : { x: Math.min(120, W * 0.1), y: 40 };
    };
    const popOrigin = (big: boolean) => {
      const el = originEl() as HTMLElement | null;
      if (!el) return;
      el.style.animation = 'none';
      void el.getBoundingClientRect();
      el.style.animation = big
        ? 'draupnir-pop-big .6s cubic-bezier(.3,1.9,.5,1)'
        : 'draupnir-pop .32s cubic-bezier(.3,2.2,.5,1)';
    };

    // ----------------------------------------------------------------
    // Rings
    // ----------------------------------------------------------------
    type Ring = {
      kind: 'spark' | 'carrier' | 'ripple';
      mode: 'free' | 'seek' | 'ripple';
      x: number; y: number; vx: number; vy: number; r: number;
      s: number; sv: number; q: number; qv: number;
      flash: number; age: number; life: number; dead: boolean;
      hits: number; floor: boolean;
      r1?: number; dur?: number; rr?: number; alpha?: number; flyAt?: number;
    };

    let rings: Ring[] = [];
    let T = 0;
    let timeline: { t: number; fn: () => void }[] = [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const at = (d: number, fn: () => void) => {
      timeline.push({ t: T + d, fn });
      timeline.sort((a, b) => a.t - b.t);
    };

    const makeRing = (o: Partial<Ring>): Ring => ({
      kind: 'spark', mode: 'free',
      x: 0, y: 0, vx: 0, vy: 0, r: cfg.current.ringSize,
      s: 0.1, sv: 6, q: 0, qv: 0,
      flash: 1, age: 0, life: TIMING.life, dead: false,
      hits: 0, floor: true,
      ...o,
    });
    const spawnRipple = (x: number, y: number, r0: number, r1: number, dur = 0.6) =>
      rings.push(makeRing({ kind: 'ripple', mode: 'ripple', x, y, r: r0, r1, dur, s: 1, sv: 0, life: Infinity }));

    const cur = {
      x: 0, y: 0, r: cfg.current.ringSize, rv: 0, tr: cfg.current.ringSize,
      mx: 0, my: 0, known: false, vis: false, active: false, hover: false, alpha: 0,
    };

    const activateCursor = (from: Ring | null) => {
      if (!cfg.current.cursorRing || !finePointer) return;
      cur.active = true;
      document.body.classList.add(CURSOR_CLASS);
      if (from) {
        cur.x = from.x; cur.y = from.y;
        cur.r = from.r * Math.max(0.3, from.s);
        cur.alpha = 1; cur.rv += 380;
        spawnRipple(cur.mx, cur.my, cur.r, cur.r * 3.2, 0.45);
      } else { cur.x = cur.mx; cur.y = cur.my; }
    };

    // ---- the loading screen ----
    const prevOverflow = document.body.style.overflow;
    const mountedAt = performance.now();
    let loaderTimer = 0;
    let pageReady = document.readyState === 'complete';
    const onReady = () => { pageReady = true; };
    if (!pageReady) window.addEventListener('load', onReady, { once: true });

    let barShown = 0;        // what the bar is actually showing, 0..1
    let ringsFired = false;

    const liftLoader = (holdMs = 0) => {
      if (!loaderUp) return;
      loaderUp = false;
      clearTimeout(loaderTimer);
      window.setTimeout(() => {
        const el = overlayRef.current;
        if (el) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
        document.body.style.overflow = prevOverflow;
        window.setTimeout(() => {
          if (overlayRef.current) overlayRef.current.style.visibility = 'hidden';
          setLoaderDone(true);          // canvas drops back to its normal layer
        }, TIMING.loaderFadeMs + 50);
      }, holdMs);
    };

    /** Bar fills on a curve, but never completes before the page really has. */
    const stepLoaderBar = () => {
      if (!loaderUp || ringsFired) return;
      const c = cfg.current;
      const started = TIMING.loaderBarStartMs;
      const span = Math.max(600, c.loaderDurationMs - started);
      const raw = (performance.now() - mountedAt - started) / span;
      const eased = raw <= 0 ? 0 : 1 - Math.pow(1 - Math.min(1, raw), 2.2);
      const target = Math.min(eased, pageReady ? 1 : 0.92);
      barShown += (target - barShown) * 0.14;          // never jumps, never backs up
      if (target >= 0.999 && barShown > 0.985) barShown = 1;
      if (loaderBarRef.current) {
        loaderBarRef.current.style.transform = `scaleX(${barShown.toFixed(4)})`;
      }
      if (barShown >= 1) {
        ringsFired = true;
        loaderCopyRef.current?.classList.add('dl-out');   // copy + bar bow out
        window.setTimeout(originSequence, 150);
      }
    };

    /** The mark multiplies; the last ring goes and becomes the cursor. */
    const originSequence = () => {
      rings = []; timeline = [];
      cur.active = false; cur.alpha = 0;
      document.body.classList.remove(CURSOR_CLASS);

      if (reduced) { activateCursor(null); liftLoader(0); return; }

      const n = cfg.current.ringCount;
      const fromLoader = loaderUp;
      at(0, () => {
        popOrigin(true);
        const L = originPos();
        spawnRipple(L.x, L.y, 10, fromLoader ? 52 : 40, 0.5);
        // one volley, all together
        for (let i = 0; i < n; i++) {
          const isCarrier = cfg.current.cursorRing && finePointer && i === (n >> 1);
          const a = fromLoader
            ? (i / n) * TAU - Math.PI / 2 + rnd(-0.12, 0.12)
            : -0.55 + (i / Math.max(1, n - 1)) * 1.9 + rnd(-0.1, 0.1);
          const sp = fromLoader ? rnd(430, 780) : rnd(640, 1020);
          const g = makeRing({ x: L.x, y: L.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
          if (isCarrier) { g.kind = 'carrier'; g.life = Infinity; g.flyAt = T + TIMING.flyDelay; }
          rings.push(g);
        }
      });
      // nobody to hand the ring to: lift once the rings have had their moment
      if (!finePointer || !cfg.current.cursorRing) {
        at(0.95, () => liftLoader(TIMING.loaderHoldMs));
      }
    };

    const burst = (x: number, y: number) => {
      if (reduced || !cfg.current.clickBurst) return;
      const n = cfg.current.ringCount;
      for (let i = 0; i < n; i++) {
        if (rings.length >= TIMING.maxRings) break;
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * (2.2 / n) + rnd(-0.08, 0.08);
        const sp = rnd(620, 1050);
        rings.push(makeRing({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }));
      }
      spawnRipple(x, y, 8, 46, 0.4);
    };

    // ---- input ----
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!cur.known && cur.active) { cur.x = e.clientX; cur.y = e.clientY; }
      cur.mx = e.clientX; cur.my = e.clientY; cur.known = true; cur.vis = true;
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      cur.hover = !!(t && t.closest && t.closest('a, button, input, select, textarea, [role="button"]'));
      cur.tr = cur.hover ? cfg.current.cursorHoverSize : cfg.current.ringSize;
    };
    const onLeave = () => { cur.vis = false; };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') cur.tr = Math.max(4, cfg.current.ringSize * 0.65);
      burst(e.clientX, e.clientY);
    };
    const onUp = () => {
      cur.tr = cur.hover ? cfg.current.cursorHoverSize : cfg.current.ringSize;
      cur.rv += 260;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    // ---- simulation ----
    const step = (dt: number) => {
      T += dt;
      while (timeline.length && timeline[0].t <= T) timeline.shift()!.fn();
      const c = cfg.current;

      for (const r of rings) {
        r.age += dt;
        r.flash = Math.max(0, r.flash - dt * 1.7);
        r.sv += (1 - r.s) * 520 * dt; r.sv *= Math.exp(-13 * dt); r.s += r.sv * dt;
        r.qv += (0 - r.q) * 900 * dt; r.qv *= Math.exp(-15 * dt); r.q += r.qv * dt;

        if (r.age > r.life) { r.dead = true; continue; }

        if (r.mode === 'ripple') {
          const t = Math.min(1, r.age / (r.dur || 0.6));
          r.rr = r.r + ((r.r1 || r.r) - r.r) * (1 - Math.pow(1 - t, 3));
          r.alpha = 1 - t;
          if (t >= 1) r.dead = true;
          continue;
        }

        if (r.kind === 'carrier' && r.mode === 'free' && T >= (r.flyAt ?? Infinity)) r.mode = 'seek';

        if (r.mode === 'seek') {
          const L = originPos();
          const tx = cur.known ? cur.mx : L.x;
          const ty = cur.known ? cur.my : L.y + 90;
          const dx = tx - r.x, dy = ty - r.y;
          r.vx += (dx * 170 - r.vx * 13) * dt;
          r.vy += (dy * 170 - r.vy * 13) * dt;
          r.x += r.vx * dt; r.y += r.vy * dt;
          r.r += (c.ringSize - r.r) * (1 - Math.exp(-6 * dt));
          if (!cur.known) r.y += Math.sin(T * 4) * 0.25;
          if (cur.known && Math.hypot(dx, dy) < 9) {
            r.dead = true;
            activateCursor(r);
            liftLoader(TIMING.loaderHoldMs);
          }
          continue;
        }

        r.vy += c.gravity * dt;
        r.vx *= Math.exp(-TIMING.airDrag * dt);
        r.x += r.vx * dt; r.y += r.vy * dt;

        if (r.floor) {
          const floorY = H - TIMING.floorPad - r.r;
          if (r.y > floorY) {
            r.y = floorY;
            if (r.vy > 90 && r.hits < c.bounceLimit) {
              r.hits++;
              r.qv += Math.min(20, r.vy / 95);
              r.vy = -r.vy * c.bounce;
            } else if (r.hits >= c.bounceLimit) {
              // done bouncing: drop out of frame and fade on the way
              r.floor = false;
              r.qv += Math.min(14, r.vy / 130);
              r.vy = Math.max(r.vy * 0.25, 60);
              r.life = Math.min(r.life, r.age + 0.75);
            } else {
              r.vy = 0; r.vx *= Math.exp(-3.5 * dt);
              if (Math.abs(r.vx) < 40 && r.life !== Infinity) {
                r.life = Math.min(r.life, r.age + TIMING.restFade);
              }
            }
          }
          if (r.x < r.r) { r.x = r.r; r.vx = Math.abs(r.vx) * TIMING.wallBounce; }
          if (r.x > W - r.r) { r.x = W - r.r; r.vx = -Math.abs(r.vx) * TIMING.wallBounce; }
        } else if (r.y - r.r > H + 40) {
          r.dead = true;
        }
      }
      rings = rings.filter(g => !g.dead);

      cur.x += (cur.mx - cur.x) * (1 - Math.exp(-26 * dt));
      cur.y += (cur.my - cur.y) * (1 - Math.exp(-26 * dt));
      cur.rv += (cur.tr - cur.r) * 520 * dt; cur.rv *= Math.exp(-13 * dt); cur.r += cur.rv * dt;
      const want = cur.active && cur.vis ? 1 : 0;
      cur.alpha += (want - cur.alpha) * (1 - Math.exp(-14 * dt));
    };

    // ---- drawing: drawImage only ----
    const colourTag = () => cfg.current.color;

    const blitRing = (
      c2: CanvasRenderingContext2D,
      x: number, y: number, r: number, sx: number, sy: number, alpha: number, flash: number,
    ) => {
      const mode = cfg.current.color;
      if (mode === 'flash') {
        const f = Math.min(1, flash * 1.1);
        if (f < 0.99) blit(c2, getSprite(r, CREAM, 'c'), x, y, r, sx, sy, alpha * (1 - f));
        if (f > 0.01) blit(c2, getSprite(r, GOLD, 'g'), x, y, r, sx, sy, alpha * f);
        return;
      }
      blit(c2, getSprite(r, mode === 'gold' ? GOLD : CREAM, mode), x, y, r, sx, sy, alpha);
    };
    const blit = (
      c2: CanvasRenderingContext2D, sp: Sprite,
      x: number, y: number, r: number, sx: number, sy: number, alpha: number,
    ) => {
      if (alpha <= 0.004) return;
      const k = r / sp.radius;
      const w = sp.size * k * sx, h = sp.size * k * sy;
      c2.globalAlpha = alpha;
      c2.drawImage(sp.canvas, x - w / 2, y - h / 2, w, h);
    };

    // Two layers on purpose. Rings sit under the nav, like any other page
    // content. The cursor ring sits above everything, because it stands in for
    // the pointer and must never be covered.
    let ringsDrewLast = false;
    let cursorDrewLast = false;
    const draw = () => {
      const c = cfg.current;

      const hasRings = rings.length > 0;
      if (hasRings || ringsDrewLast) {
        ctx.clearRect(0, 0, W, H);
        for (const r of rings) {
          if (r.mode === 'ripple') {
            const col = c.color === 'cream' ? CREAM : GOLD;
            ctx.globalAlpha = Math.max(0, r.alpha || 0) * 0.85;
            ctx.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
            ctx.lineWidth = TIMING.lineWidth;
            ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(0.1, r.rr || r.r), 0, TAU); ctx.stroke();
            continue;
          }
          const sc = Math.max(0, r.s);
          const q = Math.max(-0.2, Math.min(0.45, r.q));
          const fade = r.life === Infinity ? 1 : Math.min(1, (r.life - r.age) / 0.7);
          blitRing(ctx, r.x, r.y, r.r, sc * (1 + q * 0.5), sc * (1 - q), Math.max(0, fade), r.flash);
        }
        ctx.globalAlpha = 1;
        ringsDrewLast = hasRings;
      }

      const wantAlpha = cur.active && cur.vis ? 1 : 0;
      const stillCursor =
        Math.abs(cur.x - cur.mx) < 0.08 && Math.abs(cur.y - cur.my) < 0.08 &&
        Math.abs(cur.r - cur.tr) < 0.08 && Math.abs(cur.alpha - wantAlpha) < 0.01;
      const showCursor = cur.alpha > 0.004;
      if (!stillCursor || showCursor !== cursorDrewLast) {
        curCtx.clearRect(0, 0, W, H);
        if (showCursor) {
          blitRing(curCtx, cur.x, cur.y, cur.r, 1, 1, cur.alpha, 0);
          const col = c.color === 'cream' ? CREAM : GOLD;
          curCtx.globalAlpha = cur.alpha;
          curCtx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
          curCtx.beginPath(); curCtx.arc(cur.mx, cur.my, 1.8, 0, TAU); curCtx.fill();
          curCtx.globalAlpha = 1;
        }
        cursorDrewLast = showCursor;
      }
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      if (!document.hidden) { if (loaderUp) stepLoaderBar(); step(dt); draw(); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // with the loader up the rings wait for the bar; without it they just go
    const startTimer = useLoader
      ? 0
      : window.setTimeout(originSequence, TIMING.startDelay * 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startTimer);
      clearTimeout(loaderTimer);
      window.removeEventListener('load', onReady);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove(CURSOR_CLASS);
      document.body.style.overflow = prevOverflow;
      styleEl.remove();
      sprites.clear();
    };
  }, []);

  const color = props.color ?? DEFAULTS.color;
  const loader = props.loader ?? DEFAULTS.loader;
  const loaderMaxMs = props.loaderMaxMs ?? DEFAULTS.loaderMaxMs;
  const title = props.loaderTitle ?? DEFAULTS.loaderTitle;
  const subtitle = props.loaderSubtitle ?? DEFAULTS.loaderSubtitle;
  const barWidth = props.loaderBarWidth ?? DEFAULTS.loaderBarWidth;

  // letters rise in one after another; the subtitle follows the title
  const LETTER_MS = 42;
  const titleDelay = 320;
  const subDelay = titleDelay + title.length * LETTER_MS + 120;

  return (
    <>
      <style>{`
        @keyframes draupnir-pop {
          0% { transform: scale(1); } 35% { transform: scale(1.35); } 100% { transform: scale(1); }
        }
        @keyframes draupnir-pop-big {
          0% { transform: scale(1); } 30% { transform: scale(.7); }
          60% { transform: scale(1.25); } 100% { transform: scale(1); }
        }
        @keyframes dl-mark-in {
          from { opacity: 0; transform: scale(.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dl-letter-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dl-bar-in { from { opacity: 0; } to { opacity: 1; } }
        /* if JS never runs, the overlay still gets out of the way */
        @keyframes draupnir-failsafe { to { opacity: 0; visibility: hidden; } }

        .draupnir-loader-inner {
          display: flex; flex-direction: column; align-items: center;
          gap: 0; user-select: none;
        }
        .dl-mark { animation: dl-mark-in .6s cubic-bezier(.2,.8,.3,1) both; }
        .dl-word { display: flex; margin-top: 26px; }
        .dl-word span {
          display: inline-block; white-space: pre;
          animation: dl-letter-in .52s cubic-bezier(.2,.8,.3,1) both;
        }
        .dl-copy { display: flex; flex-direction: column; align-items: center;
          transition: opacity .35s ease, transform .35s ease; }
        .dl-copy.dl-out { opacity: 0; transform: translateY(-6px); }
        .dl-bar-track {
          position: relative; height: 1px; margin-top: 34px; overflow: hidden;
          animation: dl-bar-in .5s ease both;
        }
        .dl-bar-fill {
          position: absolute; inset: 0; transform-origin: left center;
          transform: scaleX(0); will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .draupnir-loader { display: none !important; }
        }
      `}</style>

      {loader && (
        <div
          ref={overlayRef}
          className="draupnir-loader"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: LOADER_Z,
            background: props.loaderBackground ?? DEFAULTS.loaderBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1,
            transition: `opacity ${TIMING.loaderFadeMs}ms ease`,
            animation: `draupnir-failsafe 1ms linear ${loaderMaxMs + 1500}ms forwards`,
          }}
        >
          <div className="draupnir-loader-inner">
            <svg
              ref={loaderMarkRef}
              className="dl-mark"
              width="40"
              height="40"
              viewBox="0 0 28 28"
              style={{ overflow: 'visible' }}
            >
              <circle cx="14" cy="14" r="12" fill="none" stroke="#f3efe8" strokeWidth="1.1" />
              <circle cx="14" cy="14" r="6" fill="none" stroke="#f3efe8" strokeWidth="1.1" />
            </svg>

            <div className="dl-copy" ref={loaderCopyRef}>
              <div
                className="dl-word"
                style={{
                  color: '#f3efe8',
                  fontSize: 'clamp(26px, 4.6vw, 52px)',
                  letterSpacing: '.22em',
                  paddingLeft: '.22em',
                  lineHeight: 1,
                }}
              >
                {[...title].map((ch, i) => (
                  <span key={i} style={{ animationDelay: `${titleDelay + i * LETTER_MS}ms` }}>{ch}</span>
                ))}
              </div>

              {subtitle && (
                <div
                  className="dl-word"
                  style={{
                    color: '#b9b1a6',
                    marginTop: 10,
                    fontSize: 'clamp(12px, 1.9vw, 20px)',
                    letterSpacing: '.34em',
                    paddingLeft: '.34em',
                    lineHeight: 1,
                  }}
                >
                  {[...subtitle].map((ch, i) => (
                    <span key={i} style={{ animationDelay: `${subDelay + i * LETTER_MS}ms` }}>{ch}</span>
                  ))}
                </div>
              )}

              <div
                className="dl-bar-track"
                style={{
                  width: barWidth,
                  background: 'rgba(243,239,232,.2)',
                  animationDelay: `${TIMING.loaderBarStartMs - 250}ms`,
                }}
              >
                <span ref={loaderBarRef} className="dl-bar-fill" style={{ background: '#f3efe8' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* falling rings — below the nav, so they pass behind it */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: loader && !loaderDone ? LOADER_Z + 1 : (props.zIndex ?? DEFAULTS.zIndex),
          mixBlendMode: color === 'gold' ? 'normal' : 'difference',
        }}
      />
      {/* cursor ring — above everything, it stands in for the pointer */}
      <canvas
        ref={cursorCanvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: loader && !loaderDone ? LOADER_Z + 2 : (props.cursorZIndex ?? DEFAULTS.cursorZIndex),
          mixBlendMode: color === 'gold' ? 'normal' : 'difference',
        }}
      />
    </>
  );
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
  return out as Partial<T>;
}
