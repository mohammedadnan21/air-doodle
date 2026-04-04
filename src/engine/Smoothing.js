/**
 * One-euro filter for low-latency, jitter-free landmark smoothing.
 * Adapts cutoff frequency based on speed — slow movement gets heavy
 * smoothing, fast movement stays responsive.
 */
export class OneEuroFilter {
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  _alpha(cutoff, dt) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(x, timestamp) {
    if (this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = timestamp;
      return x;
    }

    const dt = Math.max((timestamp - this.tPrev) / 1000, 0.001);
    this.tPrev = timestamp;

    const dx = (x - this.xPrev) / dt;
    const adx = this._alpha(this.dCutoff, dt);
    const dxHat = adx * dx + (1 - adx) * this.dxPrev;
    this.dxPrev = dxHat;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const ax = this._alpha(cutoff, dt);
    const xHat = ax * x + (1 - ax) * this.xPrev;
    this.xPrev = xHat;

    return xHat;
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

export class PointSmoother {
  constructor() {
    this.filterX = new OneEuroFilter(1.5, 0.01, 1.0);
    this.filterY = new OneEuroFilter(1.5, 0.01, 1.0);
    this.filterZ = new OneEuroFilter(1.5, 0.01, 1.0);
  }

  smooth(x, y, z = 0, timestamp = performance.now()) {
    return {
      x: this.filterX.filter(x, timestamp),
      y: this.filterY.filter(y, timestamp),
      z: this.filterZ.filter(z, timestamp),
    };
  }

  reset() {
    this.filterX.reset();
    this.filterY.reset();
    this.filterZ.reset();
  }
}
