export class Stroke {
  constructor(color, width = 5) {
    this.points = [];
    this.color = color;
    this.width = width;
    this.id = crypto.randomUUID();
    this.offsetX = 0;
    this.offsetY = 0;
    this.selected = false;
  }

  addPoint(x, y, z = 0, pressure = 1.0) {
    const last = this.points[this.points.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 0.001) return;
    this.points.push({ x, y, z, pressure, time: performance.now() });
  }

  getTransformedPoints() {
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
  }

  getBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this.points) {
      const px = p.x + this.offsetX;
      const py = p.y + this.offsetY;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    return { minX, minY, maxX, maxY };
  }

  hitTest(x, y, threshold = 0.045) {
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
    this.undoStack = [];
    this._notify();
    return stroke;
  }

  undo() {
    if (!this.strokes.length) return false;
    this.undoStack.push(this.strokes.pop());
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
    this.undoStack = [...this.strokes];
    this.strokes = [];
    this.currentStroke = null;
    this._notify();
  }

  eraseNear(x, y, radius = 0.04) {
    const before = this.strokes.length;
    this.strokes = this.strokes.filter(
      (s) => !s.getTransformedPoints().some((p) => Math.hypot(p.x - x, p.y - y) < radius),
    );
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
