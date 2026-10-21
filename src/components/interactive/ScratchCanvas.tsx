import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface Props {
  revealed: boolean;
  onReveal: () => void;
  onScratchingChange?: (active: boolean) => void;
}
type Point = { x: number; y: number };

// A slightly arched foil panel, echoing the invitation's palace architecture.
function foilPath(width: number, height: number) {
  const path = new Path2D();
  path.moveTo(0, height);
  path.lineTo(0, 76);
  path.bezierCurveTo(0, -25, width, -25, width, 76);
  path.lineTo(width, height);
  path.closePath();
  return path;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  maxSize: number;
  life: number;
  maxLife: number;
  type: "dust" | "star" | "flake";
  color: string;
  shade?: string;
  shape?: number[][];
  twinkleSpeed: number;
  twinklePhase: number;
  rotation: number;
  rotSpeed: number;
}

// Lit and shaded faces of foil flakes, taken from the foil's own gradient.
const FLAKE_TONES = [
  ["#f0ddb2", "#c9a46a"],
  ["#e9d4a0", "#b8915a"],
  ["#cfad79", "#a98550"],
  ["#f6e7c4", "#d2b07a"],
];

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color: string,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;

  ctx.shadowColor = "rgba(160, 110, 35, 0.5)";
  ctx.shadowBlur = 3.5;

  ctx.fillStyle = color;
  ctx.beginPath();
  const validR = Math.max(0.5, r);
  const inner = Math.max(0.2, validR * 0.22);
  for (let i = 0; i < 4; i++) {
    const arm = (i * Math.PI) / 2;
    const dip = arm + Math.PI / 4;
    if (i === 0) ctx.moveTo(Math.cos(arm) * validR, Math.sin(arm) * validR);
    else ctx.lineTo(Math.cos(arm) * validR, Math.sin(arm) * validR);
    ctx.lineTo(Math.cos(dip) * inner, Math.sin(dip) * inner);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.4, inner * 0.8), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const path = foilPath(w, h);
  ctx.save();
  ctx.clip(path);
  const metal = ctx.createLinearGradient(0, 0, w, h);
  [
    [0, "#b59057"],
    [0.22, "#e9d4a0"],
    [0.45, "#c4a06a"],
    [0.57, "#f0ddb2"],
    [0.78, "#cfad79"],
    [1, "#9e7746"],
  ].forEach(([stop, color]) =>
    metal.addColorStop(stop as number, color as string),
  );
  ctx.fillStyle = metal;
  ctx.fillRect(0, 0, w, h);
  // Deterministic micro-grain, painted only on initialization (never per frame).
  let seed = 41;
  for (let i = 0; i < 9500; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % w;
    seed = (seed * 16807) % 2147483647;
    const y = seed % h;
    ctx.fillStyle = i % 2 ? "rgba(255,249,215,.13)" : "rgba(95,66,27,.08)";
    ctx.fillRect(x, y, 0.65, 0.65);
  }
  ctx.strokeStyle = "rgba(107,76,37,.28)";
  ctx.lineWidth = 0.65;
  // Repeating engraved floral rosettes are part of the foil, so they rub away.
  for (let y = 25; y < h; y += 53)
    for (let x = 12; x < w; x += 53) {
      ctx.save();
      ctx.translate(x, y);
      for (let n = 0; n < 6; n++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.ellipse(0, 7, 3, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  ctx.fillStyle = "rgba(235,215,175,.92)";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, 80, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#987643";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, 75, 67, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#70522e";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic 26px Georgia";
  ctx.fillText("Our forever", w / 2, h / 2 - 10);
  ctx.font = "10px Georgia";
  ctx.fillText("W A I T S   W I T H I N", w / 2, h / 2 + 23);
  ctx.restore();
}

export function ScratchCanvas({
  revealed,
  onReveal,
  onScratchingChange,
}: Props) {
  const dust = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sparkleCanvas = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const geometry = useRef({ width: 0, height: 0, dpr: 1 });
  const lastPoint = useRef<Point | null>(null);
  // Strokes run through midpoints of the finger's path, so fast swipes curve instead of zigzagging.
  const lastMid = useRef<Point | null>(null);
  const activePointer = useRef<number | null>(null);
  const completed = useRef(revealed);
  const lastSample = useRef(0);
  const sampleCanvas = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();
  completed.current = revealed;

  const particles = useRef<SparkleParticle[]>([]);
  const animFrameId = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const lastSpawn = useRef<number>(0);
  const revealSparklesTriggered = useRef<boolean>(false);

  const startParticleLoop = () => {
    if (animFrameId.current || reduced) return;
    lastTime.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(now - lastTime.current, 50));
      lastTime.current = now;
      renderSparkles(dt);
      if (particles.current.length > 0) {
        animFrameId.current = requestAnimationFrame(tick);
      } else {
        animFrameId.current = 0;
        const sCtx = sparkleCanvas.current?.getContext("2d");
        if (sCtx) sCtx.clearRect(0, 0, geometry.current.width, geometry.current.height);
      }
    };
    animFrameId.current = requestAnimationFrame(tick);
  };

  function renderSparkles(dt: number) {
    const el = sparkleCanvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const { width, height } = geometry.current;
    ctx.clearRect(0, 0, width, height);

    const arr = particles.current;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life -= dt;
      if (p.life <= 0) {
        arr.splice(i, 1);
        continue;
      }

      const progress = Math.max(0, Math.min(1, 1 - p.life / p.maxLife));
      let alpha = 1;
      if (progress < 0.25) alpha = progress / 0.25;
      else if (progress > 0.6) alpha = (1 - progress) / 0.4;

      p.twinklePhase += p.twinkleSpeed * (dt / 1000);
      const twinkle = 0.78 + 0.22 * Math.sin(p.twinklePhase);
      alpha = Math.max(0, Math.min(1, alpha * twinkle));

      if (p.type === "flake") {
        // Foil flakes tumble down: gravity with air drag, catching the light as they flip.
        p.vy += 0.05 * (dt / 16.67);
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx * (dt / 16.67);
        p.y += p.vy * (dt / 16.67);
        p.rotation += p.rotSpeed * (dt / 16.67);
        p.twinklePhase += p.twinkleSpeed * (dt / 1000);
        const face = Math.cos(p.twinklePhase);
        const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.max(0.18, Math.abs(face)));
        ctx.globalAlpha = Math.max(0, fade) * 0.95;
        ctx.fillStyle = face > 0 ? p.color : p.shade ?? p.color;
        ctx.beginPath();
        p.shape?.forEach(([angle, radius], k) => {
          const px = Math.cos(angle) * radius * p.maxSize, py = Math.sin(angle) * radius * p.maxSize;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        continue;
      }

      p.x += p.vx * (dt / 16.67);
      p.y += p.vy * (dt / 16.67);
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.rotation += p.rotSpeed * (dt / 16.67);

      const sizeScale = Math.max(0.05, progress < 0.2 ? progress / 0.2 : 1);
      const currentSize = Math.max(0.5, p.maxSize * sizeScale);

      if (p.type === "star") {
        drawStar(ctx, p.x, p.y, currentSize, alpha * 0.92, p.color, p.rotation);
      } else {
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, currentSize * 0.65), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function addScratchSparkles(x: number, y: number) {
    if (reduced || completed.current) return;
    const now = performance.now();
    if (now - lastSpawn.current < 25) return;
    lastSpawn.current = now;

    const flakes = particles.current.filter((p) => p.type === "flake").length;
    if (flakes < 28) {
      // A flake or two of foil breaks off at the edge of the finger.
      const pieces = Math.random() < 0.45 ? 2 : 1;
      for (let i = 0; i < pieces; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 10;
        const [color, shade] = FLAKE_TONES[Math.floor(Math.random() * FLAKE_TONES.length)];
        const life = 750 + Math.random() * 450;
        const corners = 4 + Math.floor(Math.random() * 2);
        particles.current.push({
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.5 + Math.random() * 0.6,
          maxSize: 2.2 + Math.random() * 2.2,
          life,
          maxLife: life,
          type: "flake",
          color,
          shade,
          shape: Array.from({ length: corners }, (_, k) => [
            ((k + Math.random() * 0.6) / corners) * Math.PI * 2,
            0.6 + Math.random() * 0.4,
          ]),
          twinkleSpeed: 7 + Math.random() * 8,
          twinklePhase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.18,
        });
      }
    }

    if (particles.current.length - flakes > 24) {
      startParticleLoop();
      return;
    }

    const count = Math.random() < 0.65 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 16;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;

      const isStar = Math.random() < 0.38;
      const colors = isStar
        ? ["#ffffff", "#fce5a3", "#e6b350", "#d49a3e"]
        : ["#fae2b5", "#f0cb77", "#d9a140", "#bf832b"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = isStar ? 450 + Math.random() * 260 : 340 + Math.random() * 200;

      particles.current.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.12 + Math.random() * 0.38,
        maxSize: isStar ? 3.6 + Math.random() * 1.8 : 1.2 + Math.random() * 1.2,
        life,
        maxLife: life,
        type: isStar ? "star" : "dust",
        color,
        twinkleSpeed: 8 + Math.random() * 6,
        twinklePhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
    startParticleLoop();
  }

  function triggerRevealSparkles() {
    if (revealSparklesTriggered.current || reduced) return;
    revealSparklesTriggered.current = true;

    const { width, height } = geometry.current;
    const cx = width > 0 ? width / 2 : 137;
    const cy = height > 0 ? height / 2 + 8 : 160;

    const count = 32;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 70;
      const px = cx + Math.cos(angle) * (dist * 0.85);
      const py = cy + Math.sin(angle) * (dist * 0.95);

      const speed = 0.25 + Math.random() * 0.95;
      const isStar = Math.random() < 0.5;
      const colors = isStar
        ? ["#c8963e", "#dca842", "#b58130", "#e2b34a", "#fff8db"]
        : ["#d4a355", "#c49344", "#e8ba5d", "#fae2b5"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = isStar ? 1000 + Math.random() * 750 : 700 + Math.random() * 550;

      particles.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed * 0.45,
        vy: Math.sin(angle) * speed * 0.45 - 0.2,
        maxSize: isStar ? 4.8 + Math.random() * 2.2 : 1.4 + Math.random() * 1.4,
        life,
        maxLife: life,
        type: isStar ? "star" : "dust",
        color,
        twinkleSpeed: 5 + Math.random() * 5,
        twinklePhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.2;
      const px = cx + Math.cos(angle) * (62 + Math.random() * 20);
      const py = cy + Math.sin(angle) * (54 + Math.random() * 24);
      const life = 1500 + Math.random() * 600;

      particles.current.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 + (Math.random() - 0.5) * 0.08,
        maxSize: 5.5 + Math.random() * 1.8,
        life,
        maxLife: life,
        type: "star",
        color: i % 2 === 0 ? "#c8963e" : "#dca842",
        twinkleSpeed: 3.5 + Math.random() * 2.5,
        twinklePhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    startParticleLoop();
  }

  useEffect(() => {
    if (revealed && !revealSparklesTriggered.current && !reduced) {
      triggerRevealSparkles();
    }
  }, [revealed, reduced]);

  useEffect(() => {
    if (reduced || !window.PointerEvent) return;
    const element = canvas.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;
    function resize() {
      if (!element) return;
      try {
        const rect = {
          width: element.clientWidth,
          height: element.clientHeight,
        };
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        if (context.current && geometry.current.width === rect.width && geometry.current.height === rect.height && geometry.current.dpr === dpr) return;
        const previous = document.createElement("canvas");
        previous.width = element.width;
        previous.height = element.height;
        if (context.current)
          previous.getContext("2d")?.drawImage(element, 0, 0);
        const hadDrawing = !!context.current;
        element.width = Math.round(rect.width * dpr);
        element.height = Math.round(rect.height * dpr);
        const ctx = element.getContext("2d");
        if (!ctx) throw Error("Canvas unavailable");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        geometry.current = { width: rect.width, height: rect.height, dpr };
        if (hadDrawing) ctx.drawImage(previous, 0, 0, rect.width, rect.height);
        else paintFoil(ctx, rect.width, rect.height);
        context.current = ctx;

        if (sparkleCanvas.current) {
          sparkleCanvas.current.width = Math.round(rect.width * dpr);
          sparkleCanvas.current.height = Math.round(rect.height * dpr);
          const sCtx = sparkleCanvas.current.getContext("2d");
          if (sCtx) sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        setReady(true);
      } catch {
        context.current = null;
        setReady(false);
      }
    }
    resize();
    if (window.ResizeObserver) {
      observer = new ResizeObserver(resize);
      observer.observe(element);
    } else window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      context.current = null;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [reduced]);

  function finish() {
    if (completed.current) return;
    completed.current = true;
    const pointer = activePointer.current;
    activePointer.current = null;
    lastPoint.current = null;
    lastMid.current = null;
    if (pointer !== null && canvas.current?.hasPointerCapture(pointer))
      canvas.current.releasePointerCapture(pointer);
    onScratchingChange?.(false);
    triggerRevealSparkles();
    onReveal();
  }
  function progress(force = false) {
    const now = performance.now();
    if (!force && now - lastSample.current < 240) return;
    lastSample.current = now;
    try {
      if (!canvas.current) return;
      const small = sampleCanvas.current ?? document.createElement("canvas");
      sampleCanvas.current = small;
      small.width = 64;
      small.height = 80;
      const ctx = small.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(canvas.current, 0, 0, 64, 80);
      const pixels = ctx.getImageData(0, 0, 64, 80).data;
      const { width, height } = geometry.current;
      const mask = foilPath(width, height);
      let total = 0,
        erased = 0,
        centreTotal = 0,
        centreErased = 0;
      for (let y = 0; y < 80; y++)
        for (let x = 0; x < 64; x++) {
          if (
            !ctx.isPointInPath(
              mask,
              ((x + 0.5) * width) / 64,
              ((y + 0.5) * height) / 80,
            )
          )
            continue;
          total++;
          const clear = pixels[(y * 64 + x) * 4 + 3] < 80;
          if (clear) erased++;
          // The day and month sit in the middle of the card.
          if (x >= 14 && x < 50 && y >= 22 && y < 58) {
            centreTotal++;
            if (clear) centreErased++;
          }
        }
      // Reveal once a third of the foil is gone, or as soon as the date itself shows.
      if (
        (total && erased / total >= 0.35) ||
        (centreTotal && centreErased / centreTotal >= 0.65)
      )
        finish();
    } catch {
      setReady(false);
    }
  }
  // Every position the finger passed through since the last frame (Chrome reports
  // in-between points on fast screens; other browsers give the one event).
  function points(event: PointerEvent<HTMLCanvasElement>): Point[] {
    const rect = event.currentTarget.getBoundingClientRect();
    const native = event.nativeEvent;
    const all = native.getCoalescedEvents?.() ?? [];
    return (all.length ? all : [native]).map((e) => ({
      x: ((e.clientX - rect.left) * geometry.current.width) / rect.width,
      y: ((e.clientY - rect.top) * geometry.current.height) / rect.height,
    }));
  }
  function brush(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 44;
    ctx.beginPath();
  }
  function erase(path: Point[]) {
    const ctx = context.current;
    if (!ctx || completed.current || !path.length) return;
    brush(ctx);
    for (const to of path) {
      const from = lastPoint.current;
      if (!from || !lastMid.current) {
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x + 0.01, to.y + 0.01);
        lastMid.current = to;
      } else {
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        ctx.moveTo(lastMid.current.x, lastMid.current.y);
        ctx.quadraticCurveTo(from.x, from.y, mid.x, mid.y);
        lastMid.current = mid;
      }
      lastPoint.current = to;
    }
    ctx.stroke();
    ctx.restore();
    const to = path[path.length - 1];
    addScratchSparkles(to.x, to.y);
    if (dust.current)
      dust.current.style.transform = `translate(${to.x}px, ${to.y}px)`;
  }
  // The curve stops at the last midpoint; finish the stroke under the finger.
  function endStroke() {
    const ctx = context.current;
    const from = lastMid.current, to = lastPoint.current;
    if (ctx && from && to && !completed.current) {
      brush(ctx);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x + 0.01, to.y + 0.01);
      ctx.stroke();
      ctx.restore();
    }
    lastPoint.current = null;
    lastMid.current = null;
  }
  function down(event: PointerEvent<HTMLCanvasElement>) {
    if (
      !ready ||
      completed.current ||
      activePointer.current !== null ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    activePointer.current = event.pointerId;
    setTouched(true);
    onScratchingChange?.(true);
    try { event.currentTarget.setPointerCapture(event.pointerId); }
    catch { /* Uncaptured pointers are cleaned up on leave. */ }
    erase(points(event).slice(-1));
    progress();
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (activePointer.current !== event.pointerId || completed.current) return;
    event.preventDefault();
    erase(points(event));
    progress();
  }
  function end(event: PointerEvent<HTMLCanvasElement>) {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    endStroke();
    onScratchingChange?.(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    progress(true);
  }
  return (
    <>
      <div
        className={`scratch-veil ${revealed ? "foil-released" : ""} ${touched ? "foil-touched" : ""}`}
        aria-hidden="true"
      >
        {(!ready || reduced) && (
          <div className="foil-fallback">
            <span>Our forever</span>
            <small>WAITS WITHIN</small>
          </div>
        )}
        <canvas
          ref={canvas}
          className="scratch-canvas"
          style={{ visibility: ready && !reduced ? "visible" : "hidden" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) end(event);
          }}
          onLostPointerCapture={end}
        />
        {!touched && !revealed && <span className="foil-reflection" />}
        <span className="scratch-dust" ref={dust}>
          <i />
          <i />
          <i />
        </span>
        <svg
          className="foil-light-traces"
          viewBox="0 0 274 310"
          preserveAspectRatio="none"
        >
          <path d="M137 45Q85 95 137 155Q190 210 137 275M137 155Q60 90 28 150M137 155Q204 95 246 148M137 155Q80 214 58 259M137 155Q205 205 222 254" />
          <path d="M137 125c-32-40-52 0 0 35 52-35 32-75 0-35Z" />
        </svg>
        {!touched && !revealed && ready && !reduced && (
          <span className="scratch-gesture" />
        )}
      </div>
      <canvas
        ref={sparkleCanvas}
        className="scratch-sparkle-canvas"
        aria-hidden="true"
      />
    </>
  );
}
