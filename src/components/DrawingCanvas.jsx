import { useRef, useEffect } from 'react';

export default function DrawingCanvas({ strokeManager }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let disposed = false;
    const draw = () => {
      if (disposed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const strokes = strokeManager.strokes;
      const current = strokeManager.currentStroke;
      const len = strokes.length + (current ? 1 : 0);

      for (let si = 0; si < len; si++) {
        const stroke = si < strokes.length ? strokes[si] : current;
        const pts = stroke.getTransformedPoints
          ? stroke.getTransformedPoints()
          : stroke.points;
        if (pts.length < 2) continue;

        const lineW = stroke.width * 1.8;

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
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strokeManager]);

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
