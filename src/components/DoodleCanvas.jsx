import { useRef, useEffect } from 'react';

export default function DoodleCanvas({
  mode,
  strokeManager,
  activeColor,
  onStrokeCountChange,
  onEmitParticles,
  effectsRef,
}) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const dragging = useRef(null);
  const hovered = useRef(null);
  const cursor = useRef(null);
  const raf = useRef(null);

  const modeRef = useRef(mode);
  const colorRef = useRef(activeColor);
  const countRef = useRef(onStrokeCountChange);
  modeRef.current = mode;
  colorRef.current = activeColor;
  countRef.current = onStrokeCountChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    if (effectsRef) {
      effectsRef.current = { emitAt() {} };
    }

    const toNorm = (e) => {
      const r = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0]?.clientX : e.clientX;
      const cy = e.touches ? e.touches[0]?.clientY : e.clientY;
      if (cx == null) return null;
      return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
    };

    const onDown = (e) => {
      e.preventDefault();
      const p = toNorm(e);
      if (!p) return;
      cursor.current = p;

      if (modeRef.current === 'draw') {
        strokeManager.beginStroke();
        strokeManager.addPoint(p.x, p.y, 0, 1.0);
        drawing.current = true;
      } else if (modeRef.current === 'drag') {
        strokeManager.deselectAll();
        const hit = strokeManager.findStrokeAt(p.x, p.y, 0.045);
        if (hit) {
          hit.selected = true;
          dragging.current = { stroke: hit, sx: p.x, sy: p.y, ox: hit.offsetX, oy: hit.offsetY };
        }
      }
    };

    const onMove = (e) => {
      e.preventDefault();
      const p = toNorm(e);
      if (!p) return;
      cursor.current = p;

      if (modeRef.current === 'draw' && drawing.current) {
        strokeManager.addPoint(p.x, p.y, 0, 1.0);
      } else if (modeRef.current === 'drag') {
        if (dragging.current) {
          const d = dragging.current;
          d.stroke.offsetX = d.ox + (p.x - d.sx);
          d.stroke.offsetY = d.oy + (p.y - d.sy);
        } else {
          hovered.current = strokeManager.findStrokeAt(p.x, p.y, 0.045);
        }
      }
    };

    const onUp = (e) => {
      e.preventDefault();
      if (modeRef.current === 'draw' && drawing.current) {
        strokeManager.endStroke();
        drawing.current = false;
        countRef.current?.(strokeManager.strokeCount);
      } else if (modeRef.current === 'drag' && dragging.current) {
        dragging.current.stroke.applyOffset();
        dragging.current.stroke.selected = false;
        dragging.current = null;
        hovered.current = null;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onUp);

    const render = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const all = strokeManager.currentStroke
        ? [...strokeManager.strokes, strokeManager.currentStroke]
        : strokeManager.strokes;

      for (const stroke of all) {
        const pts = stroke.getTransformedPoints();
        if (pts.length < 2) continue;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0].x * w, pts[0].y * h);
        for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x * w, pts[j].y * h);
        ctx.stroke();
        ctx.restore();

        // Hover box
        if (modeRef.current === 'drag' && hovered.current === stroke && !stroke.selected) {
          ctx.save();
          const b = stroke.getBounds(); const pad = 0.02;
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = stroke.color + '80'; ctx.lineWidth = 1;
          ctx.strokeRect((b.minX - pad) * w, (b.minY - pad) * h,
            (b.maxX - b.minX + pad * 2) * w, (b.maxY - b.minY + pad * 2) * h);
          ctx.restore();
        }

        // Selection box
        if (stroke.selected) {
          ctx.save();
          const b = stroke.getBounds(); const pad = 0.025;
          ctx.setLineDash([8, 5]);
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
          ctx.strokeRect((b.minX - pad) * w, (b.minY - pad) * h,
            (b.maxX - b.minX + pad * 2) * w, (b.maxY - b.minY + pad * 2) * h);
          ctx.restore();
        }
      }

      // Cursor dot
      const cp = cursor.current;
      if (cp && modeRef.current === 'draw') {
        const cx = cp.x * w, cy = cp.y * h;
        canvas.style.cursor = 'none';
        ctx.save();
        ctx.fillStyle = colorRef.current;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (modeRef.current === 'drag') {
        canvas.style.cursor = dragging.current ? 'grabbing' : (hovered.current ? 'grab' : 'default');
      }

      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
      if (effectsRef) effectsRef.current = null;
    };
  }, [strokeManager]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 15, touchAction: 'none',
        cursor: mode === 'draw' ? 'none' : 'default',
      }}
    />
  );
}
