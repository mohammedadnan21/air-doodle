const LANDMARK_COUNT = 21;

const FINGER_TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
const FINGER_PIPS = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 };

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadMediaPipe() {
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
}

export class HandTracker {
  constructor({ onResults, maxHands = 1, modelComplexity = 1, minDetectionConfidence = 0.6, minTrackingConfidence = 0.5 }) {
    this.onResults = onResults;
    this.camera = null;
    this.hands = null;
    this.config = { maxHands, modelComplexity, minDetectionConfidence, minTrackingConfidence };
    this.running = false;
  }

  async start(videoElement) {
    await loadMediaPipe();

    /* globals Hands, Camera */
    this.hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: this.config.maxHands,
      modelComplexity: this.config.modelComplexity,
      minDetectionConfidence: this.config.minDetectionConfidence,
      minTrackingConfidence: this.config.minTrackingConfidence,
    });
    this.hands.onResults(this._handleResults.bind(this));

    this.camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (this.running) await this.hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    this.running = true;
    await this.camera.start();
  }

  stop() {
    this.running = false;
    if (this.camera) this.camera.stop();
  }

  _handleResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.onResults({ detected: false, landmarks: null, handedness: null, gesture: null });
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness?.[0]?.label || 'Right';
    const fingers = this._getFingerStates(landmarks);
    const gesture = this._classifyGesture(fingers, landmarks);
    const indexTip = landmarks[FINGER_TIPS.index];

    this.onResults({
      detected: true,
      landmarks,
      handedness,
      gesture,
      fingers,
      indexTip: { x: indexTip.x, y: indexTip.y, z: indexTip.z },
      rawResults: results,
    });
  }

  _getFingerStates(landmarks) {
    const isExtended = (tip, pip) => landmarks[tip].y < landmarks[pip].y;
    const thumbDx = Math.abs(landmarks[FINGER_TIPS.thumb].x - landmarks[FINGER_PIPS.thumb].x);
    const thumbDy = landmarks[FINGER_PIPS.thumb].y - landmarks[FINGER_TIPS.thumb].y;
    const thumbExtended = thumbDx > 0.06 || thumbDy > 0.045;

    return {
      thumb: thumbExtended,
      index: isExtended(FINGER_TIPS.index, FINGER_PIPS.index),
      middle: isExtended(FINGER_TIPS.middle, FINGER_PIPS.middle),
      ring: isExtended(FINGER_TIPS.ring, FINGER_PIPS.ring),
      pinky: isExtended(FINGER_TIPS.pinky, FINGER_PIPS.pinky),
    };
  }

  _classifyGesture(fingers, landmarks) {
    const { thumb, index, middle, ring, pinky } = fingers;

    const thumbTip = landmarks[FINGER_TIPS.thumb];
    const indexTip = landmarks[FINGER_TIPS.index];
    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

    // Pinch: thumb + index tips close, others curled
    if (pinchDist < 0.05 && !middle && !ring && !pinky) {
      return 'pinch';
    }

    // Open/pause: all four main fingers extended (thumb doesn't matter)
    if (index && middle && ring && pinky) {
      return 'open';
    }

    // Three/color: index + middle + ring up, pinky down
    if (index && middle && ring && !pinky) {
      return 'three';
    }

    // Peace/erase: index + middle up, ring + pinky down
    if (index && middle && !ring && !pinky) {
      return 'peace';
    }

    // Point/draw: only index up
    if (index && !middle && !ring && !pinky) {
      return 'point';
    }

    // Thumbs up/undo: only thumb extended, all others curled
    if (thumb && !index && !middle && !ring && !pinky) {
      return 'thumbsup';
    }

    // Fist/idle: nothing extended
    if (!thumb && !index && !middle && !ring && !pinky) {
      return 'fist';
    }

    return 'unknown';
  }
}

export { FINGER_TIPS, FINGER_PIPS, LANDMARK_COUNT };
