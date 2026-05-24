const MAX_STROKES = 500;
const MAX_POINTS_PER_STROKE = 5000;
const MAX_UNDO = 100;

export class Stroke {
  constructor(color, width = 5) {
    this.points = [];
    this.color = color;
    this.width = width;
    this.id = crypto.randomUUID();
    this.offsetX = 0;
    this.offsetY = 0;
    this.selected = false;
    this._boundsCache = null;
    this._boundsDirty = true;
  }

  addPoint(x, y, z = 0, pressure = 1.0) {
    if (this.points.length >= MAX_POINTS_PER_STROKE) return;
    const last = this.points[this.points.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 0.001) return;
    this.points.push({ x, y, z, pressure, time: performance.now() });
    this._boundsDirty = true;
  }

  getTransformedPoints() {
    if (this.offsetX === 0 && this.offsetY === 0) return this.points;
    return this.points.map((p) => ({
      ...p,
      x: p.x + this.offsetX,
      y: p.y + this.offsetY,
    }));
  }

  applyOffset() {
    for (const p of this.points) {
      p.x += this.offsetX;
      p.y += this.offsetY;
    }
    this.offsetX = 0;
    this.offsetY = 0;
    this._boundsDirty = true;
  }

  getBounds() {
    if (!this._boundsDirty && this._boundsCache) return this._boundsCache;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this.points) {
      const px = p.x + this.offsetX;
      const py = p.y + this.offsetY;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    this._boundsCache = { minX, minY, maxX, maxY };
    this._boundsDirty = false;
    return this._boundsCache;
  }

  hitTest(x, y, threshold = 0.045) {
    const b = this.getBounds();
    if (x < b.minX - threshold || x > b.maxX + threshold ||
        y < b.minY - threshold || y > b.maxY + threshold) {
      return false;
    }
    for (const p of this.points) {
      if (Math.hypot(p.x + this.offsetX - x, p.y + this.offsetY - y) < threshold) return true;
    }
    return false;
  }

  get isEmpty() { return this.points.length < 2; }
}

export class StrokeManager {
  constructor() {
    this.strokes = [];
    this.undoStack = [];
    this.currentStroke = null;
    this.activeColor = '#00f0ff';
    this.strokeWidth = 3;
    this._onChange = null;
  }

  onChange(cb) { this._onChange = cb; }
  _notify() { this._onChange?.(); }

  beginStroke() {
    this.currentStroke = new Stroke(this.activeColor, this.strokeWidth);
    return this.currentStroke;
  }

  addPoint(x, y, z = 0, pressure = 1.0) {
    if (!this.currentStroke) return;
    this.currentStroke.addPoint(x, y, z, pressure);
    this._notify();
  }

  endStroke() {
    if (!this.currentStroke) return null;
    const stroke = this.currentStroke;
    this.currentStroke = null;
    if (stroke.isEmpty) return null;
    this.strokes.push(stroke);
    if (this.strokes.length > MAX_STROKES) {
      this.strokes.splice(0, this.strokes.length - MAX_STROKES);
    }
    this.undoStack = [];
    this._notify();
    return stroke;
  }

  undo() {
    if (!this.strokes.length) return false;
    this.undoStack.push(this.strokes.pop());
    if (this.undoStack.length > MAX_UNDO) {
      this.undoStack.shift();
    }
    this._notify();
    return true;
  }

  redo() {
    if (!this.undoStack.length) return false;
    this.strokes.push(this.undoStack.pop());
    this._notify();
    return true;
  }

  clear() {
    const toKeep = this.strokes.slice(-MAX_UNDO);
    this.undoStack = toKeep;
    this.strokes = [];
    this.currentStroke = null;
    this._notify();
  }

  eraseNear(x, y, radius = 0.04) {
    const before = this.strokes.length;
    const r2 = radius * radius;
    this.strokes = this.strokes.filter((s) => {
      const b = s.getBounds();
      if (x < b.minX - radius || x > b.maxX + radius ||
          y < b.minY - radius || y > b.maxY + radius) {
        return true;
      }
      for (const p of s.points) {
        const dx = (p.x + s.offsetX) - x;
        const dy = (p.y + s.offsetY) - y;
        if (dx * dx + dy * dy < r2) return false;
      }
      return true;
    });
    if (this.strokes.length < before) this._notify();
    return this.strokes.length < before;
  }

  findStrokeAt(x, y, threshold = 0.045) {
    for (let i = this.strokes.length - 1; i >= 0; i--) {
      if (this.strokes[i].hitTest(x, y, threshold)) return this.strokes[i];
    }
    return null;
  }

  deselectAll() { for (const s of this.strokes) s.selected = false; }
  setColor(c) { this.activeColor = c; }
  get strokeCount() { return this.strokes.length; }
}
