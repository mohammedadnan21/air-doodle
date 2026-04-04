# ✨ Air Doodle — Draw in the Air

A futuristic, real-time computer vision experience that lets you draw in the air using hand gestures. Your webcam becomes a creative instrument — point to draw, pinch for precision, and watch neon particle trails come alive on screen.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome/Edge (webcam required).

## Gesture Controls

| Gesture | Action |
|---------|--------|
| ☝️ Point (index finger) | Draw |
| 🤏 Pinch (thumb + index) | Precision draw |
| ✌️ Peace (two fingers) | Erase nearby strokes |
| 🖖 Three fingers | Switch color |
| ✊ Fist | Undo last stroke |
| 🖐️ Open palm | Pause |

## Tech Stack

- **React + Vite** — Fast dev, instant HMR
- **MediaPipe Hands** — Real-time hand landmark detection (21 landmarks, 30+ FPS)
- **Three.js + WebGL** — GPU-accelerated particle rendering with additive blending
- **Tone.js** — Spatial audio feedback for gesture events
- **One-Euro Filter** — Low-latency jitter reduction on hand landmarks

## Architecture

```
src/
├── engine/
│   ├── HandTracker.js       — MediaPipe integration, finger state detection
│   ├── GestureStateMachine.js — Debounced gesture classification with cooldowns
│   ├── StrokeManager.js     — Stroke lifecycle, undo/redo stack, erase logic
│   ├── ParticleSystem.js    — GPU particle pool (15K particles, shader-based)
│   ├── StrokeRenderer.js    — Triangle-strip stroke meshes with glow
│   ├── SoundEngine.js       — Tone.js synth bank for gesture audio
│   └── Smoothing.js         — One-Euro filter for landmark stabilization
├── components/
│   ├── AirCanvas.jsx        — Three.js scene, render loop, particle binding
│   ├── HandOverlay.jsx      — 2D canvas hand skeleton visualization
│   ├── GestureHUD.jsx       — Real-time gesture indicator + FPS counter
│   ├── Toolbar.jsx          — Color palette, actions, export controls
│   ├── GestureGuide.jsx     — Collapsible gesture reference panel
│   └── StartScreen.jsx      — Launch screen with branding
├── hooks/
│   └── useHandTracking.js   — React hook wrapping tracker + gesture FSM
├── utils/
│   ├── colors.js            — Neon palette + color utilities
│   └── export.js            — PNG screenshot + WebM video recording
└── App.jsx                  — Main orchestrator
```

## Export

- **Screenshot** — Saves current canvas as PNG
- **Video** — Records 5-second WebM clip of the canvas

## Performance

- Targets 60 FPS with 15,000 particle pool
- One-Euro filter eliminates hand jitter without adding latency
- Gesture state machine with debouncing prevents false triggers
- WebGL additive blending for glow effects (zero overdraw cost)

## Browser Support

Chrome 90+, Edge 90+, Firefox 90+ (WebRTC + WebGL2 required)
