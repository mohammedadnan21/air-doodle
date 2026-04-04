import * as THREE from 'three';

const STROKE_VERTEX = `
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aSelected;
  varying float vAlpha;
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vSelected = aSelected;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STROKE_FRAGMENT = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    vec3 col = vColor * 1.6;
    // Pulsing highlight when selected
    float sel = vSelected * (0.5 + 0.5 * sin(col.r * 20.0));
    col += vec3(sel * 0.3);
    gl_FragColor = vec4(col, vAlpha);
  }
`;

export class StrokeRenderer {
  constructor(scene) {
    this.scene = scene;
    this.strokeMeshes = new Map();
  }

  renderStrokes(strokes) {
    const currentIds = new Set(strokes.map((s) => s.id));

    for (const [id, mesh] of this.strokeMeshes) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.strokeMeshes.delete(id);
      }
    }

    for (const stroke of strokes) {
      const pts = stroke.getTransformedPoints ? stroke.getTransformedPoints() : stroke.points;
      if (pts.length < 2) continue;

      if (this.strokeMeshes.has(stroke.id)) {
        this._updateStrokeMesh(stroke, pts);
      } else {
        this._createStrokeMesh(stroke, pts);
      }
    }
  }

  _createStrokeMesh(stroke, pts) {
    const { positions, alphas, colors, selected, indices } = this._buildStrokeGeometry(stroke, pts);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('aSelected', new THREE.Float32BufferAttribute(selected, 1));
    geometry.setIndex(indices);

    const material = new THREE.ShaderMaterial({
      vertexShader: STROKE_VERTEX,
      fragmentShader: STROKE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.strokeMeshes.set(stroke.id, mesh);
  }

  _updateStrokeMesh(stroke, pts) {
    const mesh = this.strokeMeshes.get(stroke.id);
    if (!mesh) return;

    const { positions, alphas, colors, selected, indices } = this._buildStrokeGeometry(stroke, pts);

    mesh.geometry.dispose();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('aSelected', new THREE.Float32BufferAttribute(selected, 1));
    geometry.setIndex(indices);
    mesh.geometry = geometry;
  }

  _buildStrokeGeometry(stroke, pts) {
    const points = pts;
    const width = stroke.width * 0.006;
    const positions = [];
    const alphas = [];
    const colors = [];
    const selected = [];
    const indices = [];
    const color = new THREE.Color(stroke.color);
    const sel = stroke.selected ? 1.0 : 0.0;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let nx = 0, ny = 0;

      if (i < points.length - 1) {
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const len = Math.hypot(dx, dy) || 0.001;
        nx = -dy / len;
        ny = dx / len;
      } else if (i > 0) {
        const prev = points[i - 1];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const len = Math.hypot(dx, dy) || 0.001;
        nx = -dy / len;
        ny = dx / len;
      }

      const hw = width * (p.pressure || 1.0);
      positions.push(p.x + nx * hw, p.y + ny * hw, 0.01);
      positions.push(p.x - nx * hw, p.y - ny * hw, 0.01);

      const alpha = Math.min(1, (p.pressure || 1.0) * 0.95);
      alphas.push(alpha, alpha);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      selected.push(sel, sel);

      if (i < points.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    return { positions, alphas, colors, selected, indices };
  }

  clear() {
    for (const [, mesh] of this.strokeMeshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.strokeMeshes.clear();
  }

  dispose() {
    this.clear();
  }
}
