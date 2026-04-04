import { useRef, useCallback, useEffect } from 'react';

export default function InteractionLayer({
  mode, // 'draw' | 'drag'
  strokeManager,
  activeColor,
  onStrokeCountChange,
  onEmitParticles,
}) {
  const layerRef = useRef(null);
  const drawingRef = useRef(false);
  const draggingRef = useRef(null); // { stroke, startX, startY, origOffsetX, origOffsetY }
  const lastPosRef = useRef(null);

  const toNorm = useCallback((e) => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      const pos = toNorm(e);
      if (!pos) return;

      if (mode === 'draw') {
        strokeManager.beginStroke();
        strokeManager.addPoint(pos.x, pos.y, 0, 1.0);
        drawingRef.current = true;
        lastPosRef.current = pos;
        onEmitParticles?.(pos.x, pos.y, activeColor, 'trail');
      } else if (mode === 'drag') {
        strokeManager.deselectAll();
        const hit = strokeManager.findStrokeAt(pos.x, pos.y, 0.03);
        if (hit) {
          hit.selected = true;
          draggingRef.current = {
            stroke: hit,
            startX: pos.x,
            startY: pos.y,
            origOffsetX: hit.offsetX,
            origOffsetY: hit.offsetY,
          };
        }
        onStrokeCountChange?.(strokeManager.strokeCount);
      }
    },
    [mode, strokeManager, activeColor, toNorm, onStrokeCountChange, onEmitParticles],
  );

  const handlePointerMove = useCallback(
    (e) => {
      e.preventDefault();
      const pos = toNorm(e);
      if (!pos) return;

      if (mode === 'draw' && drawingRef.current) {
        strokeManager.addPoint(pos.x, pos.y, 0, 1.0);
        lastPosRef.current = pos;
        onEmitParticles?.(pos.x, pos.y, activeColor, 'trail');
      } else if (mode === 'drag' && draggingRef.current) {
        const d = draggingRef.current;
        d.stroke.offsetX = d.origOffsetX + (pos.x - d.startX);
        d.stroke.offsetY = d.origOffsetY + (pos.y - d.startY);
        strokeManager._notify();
      }
    },
    [mode, strokeManager, activeColor, toNorm, onEmitParticles],
  );

  const handlePointerUp = useCallback(
    (e) => {
      e.preventDefault();

      if (mode === 'draw' && drawingRef.current) {
        const stroke = strokeManager.endStroke();
        drawingRef.current = false;
        if (stroke) {
          onStrokeCountChange?.(strokeManager.strokeCount);
          const last = lastPosRef.current;
          if (last) onEmitParticles?.(last.x, last.y, activeColor, 'burst');
        }
      } else if (mode === 'drag' && draggingRef.current) {
        draggingRef.current.stroke.applyOffset();
        draggingRef.current.stroke.selected = false;
        draggingRef.current = null;
        strokeManager._notify();
      }
    },
    [mode, strokeManager, activeColor, onStrokeCountChange, onEmitParticles],
  );

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointerleave', handlePointerUp);
    el.addEventListener('touchstart', handlePointerDown, { passive: false });
    el.addEventListener('touchmove', handlePointerMove, { passive: false });
    el.addEventListener('touchend', handlePointerUp);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointerleave', handlePointerUp);
      el.removeEventListener('touchstart', handlePointerDown);
      el.removeEventListener('touchmove', handlePointerMove);
      el.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={layerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        cursor: mode === 'draw' ? 'crosshair' : 'grab',
        touchAction: 'none',
      }}
    />
  );
}
