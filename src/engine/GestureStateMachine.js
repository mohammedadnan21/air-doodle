const GESTURE_HOLD_MS = 120;
const GESTURE_COOLDOWN_MS = 800;

export class GestureStateMachine {
  constructor(onGestureChange) {
    this.onGestureChange = onGestureChange;
    this.currentGesture = 'none';
    this.pendingGesture = null;
    this.pendingSince = 0;
    this.lastActionTime = 0;
    this.gestureHistory = [];
  }

  update(gesture, timestamp = performance.now()) {
    if (gesture === this.pendingGesture) {
      if (gesture !== this.currentGesture && timestamp - this.pendingSince >= GESTURE_HOLD_MS) {
        const prev = this.currentGesture;
        this.currentGesture = gesture;
        this.gestureHistory.push({ gesture, timestamp });
        if (this.gestureHistory.length > 50) this.gestureHistory.shift();
        this.onGestureChange(gesture, prev, timestamp);
      }
    } else {
      this.pendingGesture = gesture;
      this.pendingSince = timestamp;
    }
  }

  canTriggerAction(timestamp = performance.now()) {
    if (timestamp - this.lastActionTime < GESTURE_COOLDOWN_MS) return false;
    this.lastActionTime = timestamp;
    return true;
  }

  get isDrawing() {
    return this.currentGesture === 'point' || this.currentGesture === 'pinch';
  }

  get isErasing() {
    return this.currentGesture === 'peace';
  }

  reset() {
    this.currentGesture = 'none';
    this.pendingGesture = null;
    this.gestureHistory = [];
  }
}
