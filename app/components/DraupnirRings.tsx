'use client';

import { useEffect, useRef } from 'react';

/**
 * DraupnirRings
 * -------------
 * On mount the header mark multiplies into eight rings; one of them flies to
 * the pointer and becomes the cursor. Clicking anywhere throws eight more.
 *
 * Mount it ONCE, high in the tree (app/layout.tsx), and mark the logo:
 *
 *   <svg data-ring-origin ... />        // in the header
 *   <DraupnirRings />                   // in the layout, after {children}
 *
 * No dependencies. Renders a single fixed, pointer-events:none canvas.
 */

type ColorMode = 'gold' | 'cream' | 'flash';

export type DraupnirRingsProps = {
  /** Element the rings are born from. Defaults to the first [data-ring-origin]. */
  originSelector?: string;
  /** Fall of the rings, px/s². Higher drops them faster. */
  gravity?: number;
  /** Floor restitution, 0–1. Lower settles them sooner. */
  bounce?: number;
  /** Rings per event. Eight, in the myth. */
  ringCount?: number;
  /** Radius of every ring, px. */
  ringSize?: number;
  /** Halo strength, 0–1. */
  glow?: number;
  /** Halo spread, px. */
  glowRadius?: number;
  /** Blurs the ring line itself, 0–1. */
  softness?: number;
  /** 'gold' draws normally; 'cream'/'flash' invert against the page. */
  color?: ColorMode;
  /** Radius the cursor ring grows to over links and buttons. */
  cursorHoverSize?: number;
  /** Replace the native cursor with a ring. Desktop only either way. */
  cursorRing?: boolean;
  /** Throw rings on click. */
  clickBurst?: boolean;
  zIndex?: number;
};

const CREAM = [243, 239, 232] as const;
const GOLD = [222, 168, 72] as const;

const DEFAULTS = {
  originSelector: '[data-ring-origin]',
  gravity: 4100,
  bounce: 0.27,
  ringCount: 8,
  ringSize: 7,
  glow: 1,
  glowRadius: 20,
  softness: 1,
  color: 'gold' as ColorMode,
  cursorHoverSize: 20,
  cursorRing: true,
  clickBurst: true,
  zIndex: 60,
};

/** Timing that rarely needs touching. */
const TIMING = {
  startDelay: 0.45,   // s after mount before the logo fires
  stagger: 0.07,      // s between rings leaving the logo
  flyDelay: 0.5,      // s the carrier tumbles before homing in
  life: 2.8,          // s a ring lives
  restFade: 0.8,      // s it lingers once it stops moving
  airDrag: 0.12,
  wallBounce: 0.55,
  floorPad: 22,
  lineWidth: 1.3,
  maxRings: 48,
  bloomScale: 0.5,    // bloom is blurred at half resolution, then scaled up
};

const CURSOR_CLASS = 'draupnir-ring-cursor';

export default function DraupnirRings(props: DraupnirRingsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfg = useRef({ ...DEFAULTS, ...stripUndefined(props) });

  // keep live config in sync without restarting the animation
  useEffect(() => {
    cfg.current = { ...DEFAULTS, ...stripUndefined(props) };
  });

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // offscreen: rings are drawn once, then composited as halo + crisp pass
    const fx = document.createElement('canvas');
    const fctx = fx.getContext('2d')!;
    const lo = document.createElement('canvas');
    const lctx = lo.getContext('2d')!;

    let W = 0, H = 0, DPR = 1;
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      fx.width = W * DPR; fx.height = H * DPR;
      fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      lo.width = Math.max(1, Math.ceil(W * DPR * TIMING.bloomScale));
      lo.height = Math.max(1, Math.ceil(H * DPR * TIMING.bloomScale));
    };
    resize();
    window.addEventListener('resize', resize);

    // hide the native cursor only once a ring has taken its place
    const styleEl = document.createElement('style');
    styleEl.textContent =
      `body.${CURSOR_CLASS}, body.${CURSOR_CLASS} * { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    const originPos = () => {
      const el = document.querySelector(cfg.current.originSelector);
      if (el) {
        const b = el.getBoundingClientRect();
        if (b.width || b.height) return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      }
      return { x: Math.min(120, W * 0.1), y: 40 }; // fallback: top-left
    };
    const popOrigin = (big: boolean) => {
      const el = document.querySelector(cfg.current.originSelector) as HTMLElement | null;
      if (!el) return;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = big
        ? 'draupnir-pop-big .6s cubic-bezier(.3,1.9,.5,1)'
        : 'draupnir-pop .32s cubic-bezier(.3,2.2,.5,1)';
    };

    type Ring = {
      kind: 'spark' | 'carrier' | 'ripple';
      mode: 'free' | 'seek' | 'ripple';
      x: number; y: number; vx: number; vy: number; r: number;
      s: number; sv: number; q: number; qv: number;
      flash: number; age: number; life: number; dead: boolean;
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
      ...o,
    });
    const spawnRipple = (x: number, y: number, r0: number, r1: number, dur = 0.6) => {
      rings.push(makeRing({ kind: 'ripple', mode: 'ripple', x, y, r: r0, r1, dur, s: 1, sv: 0, life: Infinity }));
    };

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

    /** The logo multiplies; the last ring goes and becomes the cursor. */
    const originSequence = () => {
      rings = []; timeline = [];
      cur.active = false; cur.alpha = 0;
      document.body.classList.remove(CURSOR_CLASS);

      if (reduced) { activateCursor(null); return; }

      const n = cfg.current.ringCount;
      at(0, () => {
        popOrigin(true);
        const L = originPos();
        spawnRipple(L.x, L.y, 10, 40, 0.5);
      });
      for (let i = 0; i < n; i++) {
        const isCarrier = cfg.current.cursorRing && finePointer && i === n - 1;
        at(0.18 + i * TIMING.stagger, () => {
          popOrigin(false);
          const L = originPos();
          const a = -0.55 + (i / Math.max(1, n - 1)) * 1.9 + rnd(-0.1, 0.1);
          const sp = rnd(640, 1020);
          const g = makeRing({ x: L.x, y: L.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
          if (isCarrier) { g.kind = 'carrier'; g.life = Infinity; g.flyAt = T + TIMING.flyDelay; }
          rings.push(g);
        });
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
          const tx = cur.known ? cur.mx : L.x + 70;
          const ty = cur.known ? cur.my : L.y + 70;
          const dx = tx - r.x, dy = ty - r.y;
          r.vx += (dx * 170 - r.vx * 13) * dt;
          r.vy += (dy * 170 - r.vy * 13) * dt;
          r.x += r.vx * dt; r.y += r.vy * dt;
          r.r += (c.ringSize - r.r) * (1 - Math.exp(-6 * dt));
          if (!cur.known) r.y += Math.sin(T * 4) * 0.25;
          if (cur.known && Math.hypot(dx, dy) < 9) { r.dead = true; activateCursor(r); }
          continue;
        }

        r.vy += c.gravity * dt;
        r.vx *= Math.exp(-TIMING.airDrag * dt);
        r.x += r.vx * dt; r.y += r.vy * dt;

        const floor = H - TIMING.floorPad - r.r;
        if (r.y > floor) {
          r.y = floor;
          if (r.vy > 90) { r.qv += Math.min(20, r.vy / 95); r.vy = -r.vy * c.bounce; }
          else {
            r.vy = 0; r.vx *= Math.exp(-3.5 * dt);
            if (Math.abs(r.vx) < 40 && r.life !== Infinity) {
              r.life = Math.min(r.life, r.age + TIMING.restFade);
            }
          }
        }
        if (r.x < r.r) { r.x = r.r; r.vx = Math.abs(r.vx) * TIMING.wallBounce; }
        if (r.x > W - r.r) { r.x = W - r.r; r.vx = -Math.abs(r.vx) * TIMING.wallBounce; }
      }
      rings = rings.filter(g => !g.dead);

      cur.x += (cur.mx - cur.x) * (1 - Math.exp(-26 * dt));
      cur.y += (cur.my - cur.y) * (1 - Math.exp(-26 * dt));
      cur.rv += (cur.tr - cur.r) * 520 * dt; cur.rv *= Math.exp(-13 * dt); cur.r += cur.rv * dt;
      const want = cur.active && cur.vis ? 1 : 0;
      cur.alpha += (want - cur.alpha) * (1 - Math.exp(-14 * dt));
    };

    // ---- drawing ----
    const colour = (flash: number) => {
      const c = cfg.current.color;
      if (c === 'gold') return GOLD as unknown as number[];
      if (c === 'cream') return CREAM as unknown as number[];
      return CREAM.map((v, i) => v + (GOLD[i] - v) * Math.min(1, flash * 1.1));
    };
    const strokeRing = (
      c: CanvasRenderingContext2D, x: number, y: number,
      rx: number, ry: number, col: number[], alpha: number,
    ) => {
      c.globalAlpha = alpha;
      c.strokeStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
      c.beginPath();
      c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
      c.stroke();
    };

    let idleFrames = 0;
    const draw = () => {
      const c = cfg.current;

      // skip the whole composite when nothing is moving
      const still =
        rings.length === 0 &&
        Math.abs(cur.x - cur.mx) < 0.08 && Math.abs(cur.y - cur.my) < 0.08 &&
        Math.abs(cur.r - cur.tr) < 0.08 &&
        Math.abs(cur.alpha - (cur.active && cur.vis ? 1 : 0)) < 0.01;
      if (still && idleFrames > 1) return;
      idleFrames = still ? idleFrames + 1 : 0;

      fctx.clearRect(0, 0, W, H);
      fctx.lineWidth = TIMING.lineWidth;
      for (const r of rings) {
        const col = colour(r.flash);
        if (r.mode === 'ripple') {
          strokeRing(fctx, r.x, r.y, r.rr || r.r, r.rr || r.r, col, Math.max(0, r.alpha || 0) * 0.9);
          continue;
        }
        const sc = Math.max(0, r.s);
        const q = Math.max(-0.2, Math.min(0.45, r.q));
        const rx = r.r * sc * (1 + q * 0.5);
        const ry = r.r * sc * (1 - q);
        const fade = r.life === Infinity ? 1 : Math.min(1, (r.life - r.age) / 0.7);
        fctx.lineWidth = r.kind === 'carrier' ? TIMING.lineWidth + 0.2 : TIMING.lineWidth;
        strokeRing(fctx, r.x, r.y + (r.r * sc - ry), rx, ry, col, Math.max(0, fade));
      }
      if (cur.alpha > 0.01) {
        const col = c.color === 'gold' ? (GOLD as unknown as number[]) : (CREAM as unknown as number[]);
        fctx.lineWidth = TIMING.lineWidth + 0.2;
        strokeRing(fctx, cur.x, cur.y, cur.r, cur.r, col, cur.alpha);
        fctx.globalAlpha = cur.alpha;
        fctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        fctx.beginPath(); fctx.arc(cur.mx, cur.my, 1.8, 0, Math.PI * 2); fctx.fill();
      }
      fctx.globalAlpha = 1;

      ctx.clearRect(0, 0, W, H);
      if (c.glow > 0.01 && c.glowRadius > 0) {
        lctx.setTransform(1, 0, 0, 1, 0, 0);
        lctx.clearRect(0, 0, lo.width, lo.height);
        lctx.save();
        lctx.filter = `blur(${(c.glowRadius * DPR * TIMING.bloomScale).toFixed(2)}px)`;
        lctx.drawImage(fx, 0, 0, lo.width, lo.height);
        lctx.restore();
        ctx.save();
        ctx.globalAlpha = Math.min(1, c.glow);
        ctx.drawImage(lo, 0, 0, W, H);
        ctx.restore();
      }
      ctx.save();
      if (c.softness > 0.01) ctx.filter = `blur(${(c.softness * 1.6).toFixed(2)}px)`;
      ctx.drawImage(fx, 0, 0, W, H);
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      step(dt); draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const startTimer = window.setTimeout(originSequence, TIMING.startDelay * 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove(CURSOR_CLASS);
      styleEl.remove();
    };
  }, []);

  const color = props.color ?? DEFAULTS.color;

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
      `}</style>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: props.zIndex ?? DEFAULTS.zIndex,
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
