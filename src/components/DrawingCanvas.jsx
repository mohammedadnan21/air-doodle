import { useRef, useEffect, useCallback } from 'react';

export default function DrawingCanvas({ strokeManager }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const allStrokes = strokeManager.currentStroke
      ? [...strokeManager.strokes, strokeManager.currentStroke]
      : [...strokeManager.strokes];

    for (const stroke of allStrokes) {
      const pts = stroke.getTransformedPoints
        ? stroke.getTransformedPoints()
        : stroke.points;
      if (pts.length < 2) continue;

      const lineW = stroke.width * 1.8;

      // Outer glow layer
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineW + 12;
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = 0.15;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, pts[0].y * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * w, pts[i].y * h);
      }
      ctx.stroke();
      ctx.restore();

      // Mid glow layer
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineW + 5;
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = 0.4;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, pts[0].y * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * w, pts[i].y * h);
      }
      ctx.stroke();
      ctx.restore();

      // Core bright line
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineW;
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, pts[0].y * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * w, pts[i].y * h);
      }
      ctx.stroke();
      ctx.restore();

      // Bright center
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(1.5, lineW * 0.4);
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, pts[0].y * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * w, pts[i].y * h);
      }
      ctx.stroke();
      ctx.restore();

      // Selection indicator
      if (stroke.selected) {
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineW + 18;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x * w, pts[0].y * h);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * w, pts[i].y * h);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [strokeManager]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 6,
        pointerEvents: 'none',
      }}
    />
  );
}
