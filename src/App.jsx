import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import { StrokeManager } from './engine/StrokeManager';
import { SoundEngine } from './engine/SoundEngine';
import { nextColor } from './utils/colors';
import { exportCanvasAsImage, exportCanvasAsVideo } from './utils/export';
import AirCanvas from './components/AirCanvas';
import DoodleCanvas from './components/DoodleCanvas';
import HandOverlay from './components/HandOverlay';
import GestureHUD from './components/GestureHUD';
import Toolbar from './components/Toolbar';
import GestureGuide from './components/GestureGuide';
import StartScreen from './components/StartScreen';

export default function App() {
  const [started, setStarted] = useState(false);
  const [gesture, setGesture] = useState('none');
  const [activeColor, setActiveColor] = useState('#00f0ff');
  const [landmarks, setLandmarks] = useState(null);
  const [fps, setFps] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState('draw');
  const [cameraActive, setCameraActive] = useState(false);
  const [wantCamera, setWantCamera] = useState(false);
  const [dimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const strokeManager = useMemo(() => new StrokeManager(), []);
  const soundEngine = useRef(new SoundEngine());
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const fpsFrames = useRef([]);
  const activeColorRef = useRef(activeColor);
  const effectsRef = useRef(null);
  useEffect(() => { activeColorRef.current = activeColor; }, [activeColor]);

  // --- Hand-tracking frame handler ---
  const onFrame = useCallback(
    (data) => {
      const now = performance.now();
      fpsFrames.current.push(now);
      fpsFrames.current = fpsFrames.current.filter((t) => now - t < 1000);
      if (fpsFrames.current.length % 10 === 0) setFps(fpsFrames.current.length);

      if (!data.detected) {
        if (drawingRef.current) {
          strokeManager.endStroke();
          drawingRef.current = false;
          soundEngine.current.play('draw_end');
          setStrokeCount(strokeManager.strokeCount);
        }
        setLandmarks(null);
        return;
      }

      setLandmarks(data.landmarks);
      const { gesture: g, indexTip } = data;
      const mx = 1 - indexTip.x;
      const my = indexTip.y;
      const color = activeColorRef.current;

      if (g === 'point' || g === 'pinch') {
        if (!drawingRef.current) {
          strokeManager.beginStroke();
          drawingRef.current = true;
          soundEngine.current.play('draw_start');
        }
        strokeManager.addPoint(mx, my, indexTip.z);
        setStrokeCount(strokeManager.strokeCount);
      } else {
        if (drawingRef.current) {
          strokeManager.endStroke();
          drawingRef.current = false;
          soundEngine.current.play('draw_end');
          setStrokeCount(strokeManager.strokeCount);
        }
      }

      if (g === 'peace') {
        const erased = strokeManager.eraseNear(mx, my, 0.05);
        if (erased) {
          setStrokeCount(strokeManager.strokeCount);
          soundEngine.current.play('erase');
        }
      }

      if (g === 'three' && data.canTrigger?.()) {
        const next = nextColor(color);
        setActiveColor(next.hex);
        strokeManager.setColor(next.hex);
        soundEngine.current.play('color_switch');
      }

      if (g === 'thumbsup' && data.canTrigger?.()) {
        if (strokeManager.undo()) {
          setStrokeCount(strokeManager.strokeCount);
          soundEngine.current.play('undo');
        }
      }
    },
    [strokeManager],
  );

  const onGestureChange = useCallback((g, prev) => {
    setGesture(g);
    if (g !== prev) soundEngine.current.play('gesture_change');
  }, []);

  const { videoRef, start: startCamera, status: cameraStatus } = useHandTracking(onFrame, onGestureChange);

  const handleStart = useCallback(async (withCamera = false) => {
    await soundEngine.current.init();
    setStarted(true);
    if (withCamera) setWantCamera(true);
  }, []);

  useEffect(() => {
    if (!started || !wantCamera || cameraActive) return;
    if (!videoRef.current) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        await startCamera();
        if (!cancelled) setCameraActive(true);
      } catch (err) {
        console.error('Camera start failed:', err);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [started, wantCamera, cameraActive, startCamera, videoRef]);

  const handleEmitParticles = useCallback((x, y, color, type) => {
    const particles = window._airDoodleParticles;
    if (!particles) return;
    if (type === 'trail') particles.emitTrail(x, y, 0, color, 3);
    else if (type === 'burst') particles.emitBurst(x, y, 0, color, 25);
  }, []);

  const handleStrokeCountChange = useCallback((count) => setStrokeCount(count), []);

  const handleClear = useCallback(() => {
    strokeManager.clear();
    setStrokeCount(0);
    soundEngine.current.play('clear');
  }, [strokeManager]);

  const handleUndo = useCallback(() => {
    if (strokeManager.undo()) {
      setStrokeCount(strokeManager.strokeCount);
      soundEngine.current.play('undo');
    }
  }, [strokeManager]);

  const handleRedo = useCallback(() => {
    if (strokeManager.redo()) setStrokeCount(strokeManager.strokeCount);
  }, [strokeManager]);

  const handleColorChange = useCallback((hex) => {
    setActiveColor(hex);
    strokeManager.setColor(hex);
    soundEngine.current.play('color_switch');
  }, [strokeManager]);

  const handleExportImage = useCallback(() => {
    if (canvasRef.current) exportCanvasAsImage(canvasRef.current);
  }, []);

  const handleExportVideo = useCallback(async () => {
    if (!canvasRef.current || isRecording) return;
    setIsRecording(true);
    await exportCanvasAsVideo(canvasRef.current, 5000);
    setIsRecording(false);
  }, [isRecording]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(soundEngine.current.toggle());
  }, []);

  useEffect(() => { strokeManager.setColor(activeColor); }, [activeColor, strokeManager]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if (e.key === 'd') setMode('draw');
      if (e.key === 'v') setMode('drag');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleUndo, handleRedo]);

  if (!started) {
    return <StartScreen onStart={handleStart} status={cameraStatus} />;
  }

  return (
    <div style={styles.root}>
      <video
        ref={videoRef}
        style={{ ...styles.video, opacity: cameraActive ? 0.35 : 0 }}
        autoPlay playsInline muted
      />

      <div style={styles.bg} />
      <div style={styles.vignette} />

      {/* Particles (Three.js, behind the drawing) */}
      <AirCanvas canvasRef={canvasRef} />

      {/* Single canvas: draws strokes AND captures mouse/touch */}
      <DoodleCanvas
        mode={mode}
        strokeManager={strokeManager}
        activeColor={activeColor}
        onStrokeCountChange={handleStrokeCountChange}
        onEmitParticles={handleEmitParticles}
        effectsRef={effectsRef}
      />

      {cameraActive && (
        <HandOverlay
          landmarks={landmarks}
          width={dimensions.width}
          height={dimensions.height}
          gesture={gesture}
        />
      )}

      <GestureHUD
        gesture={cameraActive ? gesture : mode === 'draw' ? 'point' : 'open'}
        color={activeColor}
        fps={fps}
        strokeCount={strokeCount}
      />

      <Toolbar
        activeColor={activeColor}
        onColorChange={handleColorChange}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportImage={handleExportImage}
        onExportVideo={handleExportVideo}
        onToggleSound={handleToggleSound}
        soundEnabled={soundEnabled}
        isRecording={isRecording}
        mode={mode}
        onModeChange={setMode}
      />

      <GestureGuide />

      {wantCamera && !cameraActive && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Loading hand tracking model...</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    position: 'fixed', inset: 0,
    background: '#000',
    overflow: 'hidden',
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
  },
  video: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
    zIndex: 1,
    transition: 'opacity 0.5s ease',
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, #0d0d2b 0%, #050510 60%, #000 100%)',
    zIndex: 0,
  },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  loadingOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50, pointerEvents: 'none',
  },
  loadingBox: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px 28px',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    border: '1px solid rgba(0,240,255,0.2)',
    backdropFilter: 'blur(12px)',
  },
  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.15)',
    borderTopColor: '#00f0ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13, color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
};
