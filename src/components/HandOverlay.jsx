import { useRef, useEffect } from 'react';
import { FINGER_TIPS } from '../engine/HandTracker';

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

export default function HandOverlay({ landmarks, width, height, gesture }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (!landmarks) return;

    const tipColor = gesture === 'point' ? '#00f0ff' : gesture === 'peace' ? '#ff00e5' : '#ffffff44';

    // Mirror X to match the CSS-mirrored webcam video
    const lx = (lm) => (1 - lm.x) * width;
    const ly = (lm) => lm.y * height;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.5;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(lx(landmarks[a]), ly(landmarks[a]));
      ctx.lineTo(lx(landmarks[b]), ly(landmarks[b]));
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const isTip = Object.values(FINGER_TIPS).includes(i);
      ctx.beginPath();
      ctx.arc(lx(lm), ly(lm), isTip ? 5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? tipColor : 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    const idx = landmarks[FINGER_TIPS.index];
    const ix = lx(idx), iy = ly(idx);
    const grd = ctx.createRadialGradient(ix, iy, 0, ix, iy, 30);
    grd.addColorStop(0, tipColor);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(ix, iy, 30, 0, Math.PI * 2);
    ctx.fill();
  }, [landmarks, width, height, gesture]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
