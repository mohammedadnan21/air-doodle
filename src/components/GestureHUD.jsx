import { useState, useEffect } from 'react';

const GESTURE_INFO = {
  none: { icon: '✋', label: 'No hand detected', action: '' },
  point: { icon: '☝️', label: 'Drawing', action: 'Point to draw' },
  pinch: { icon: '🤏', label: 'Precision Draw', action: 'Pinch to draw fine' },
  peace: { icon: '✌️', label: 'Erasing', action: 'Two fingers to erase' },
  three: { icon: '🖖', label: 'Color Switch', action: 'Three fingers for color' },
  open: { icon: '🖐️', label: 'Paused', action: 'Open hand to pause' },
  thumbsup: { icon: '👍', label: 'Undo', action: 'Thumbs up to undo' },
  fist: { icon: '✊', label: 'Idle', action: 'Fist — idle' },
  unknown: { icon: '❓', label: 'Unknown', action: '' },
};

export default function GestureHUD({ gesture, color, fps, strokeCount }) {
  const [flash, setFlash] = useState(false);
  const info = GESTURE_INFO[gesture] || GESTURE_INFO.unknown;

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(t);
  }, [gesture]);

  return (
    <div style={styles.container}>
      <div style={styles.top}>
        <div style={styles.logo}>
          <span style={{ ...styles.logoText, textShadow: `0 0 20px ${color}` }}>AIR DOODLE</span>
          <span style={styles.tagline}>Mohammad Adnan · RVCE</span>
        </div>
        <div style={styles.stats}>
          <span style={styles.stat}>{fps} FPS</span>
          <span style={styles.stat}>{strokeCount} strokes</span>
        </div>
      </div>

      <div style={{
        ...styles.gestureIndicator,
        borderColor: flash ? color : 'rgba(255,255,255,0.1)',
        boxShadow: flash ? `0 0 30px ${color}40` : 'none',
      }}>
        <span style={styles.gestureIcon}>{info.icon}</span>
        <div>
          <div style={{ ...styles.gestureLabel, color }}>{info.label}</div>
          <div style={styles.gestureAction}>{info.action}</div>
        </div>
      </div>

      <div style={styles.colorDot}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}60`,
        }} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '20px 28px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    pointerEvents: 'none', zIndex: 20,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
  },
  top: { display: 'flex', flexDirection: 'column', gap: 8 },
  logo: { display: 'flex', flexDirection: 'column' },
  logoText: {
    fontSize: 18, fontWeight: 800, letterSpacing: 6,
    color: '#fff',
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', marginTop: 2,
  },
  stats: { display: 'flex', gap: 14, marginTop: 8 },
  stat: {
    fontSize: 11, color: 'rgba(255,255,255,0.35)',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 1,
  },
  gestureIndicator: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 18px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    transition: 'all 0.3s ease',
  },
  gestureIcon: { fontSize: 22 },
  gestureLabel: {
    fontSize: 13, fontWeight: 600, letterSpacing: 1,
    transition: 'color 0.3s ease',
  },
  gestureAction: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  colorDot: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
  },
};
