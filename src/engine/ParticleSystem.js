import * as THREE from 'three';

const MAX_PARTICLES = 15000;
const TRAIL_PARTICLES_PER_FRAME = 3;
const PARTICLE_LIFETIME = 2.5;
const SPARK_SPEED = 0.15;

const vertexShader = `
  attribute float aLife;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;

  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vLife = aLife;
    vColor = aColor;
    vAlpha = aAlpha;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    float coreFalloff = smoothstep(0.5, 0.0, dist);
    float glowFalloff = exp(-dist * 6.0);
    float intensity = mix(glowFalloff, coreFalloff, 0.5);

    vec3 col = vColor * intensity * 1.8;
    col += vColor * glowFalloff * 0.5; // outer glow

    float alpha = vAlpha * intensity * smoothstep(0.0, 0.15, vLife);
    gl_FragColor = vec4(col, alpha);
  }
`;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.poolIndex = 0;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const lifetimes = new Float32Array(MAX_PARTICLES);
    const sizes = new Float32Array(MAX_PARTICLES);
    const alphas = new Float32Array(MAX_PARTICLES);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);

    this._pool = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this._pool.push({
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0, maxLife: PARTICLE_LIFETIME,
        size: 4, color: [0, 0.94, 1],
        alpha: 1.0, active: false,
      });
    }
  }

  _getNextSlot() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const idx = (this.poolIndex + i) % MAX_PARTICLES;
      if (!this._pool[idx].active) {
        this.poolIndex = (idx + 1) % MAX_PARTICLES;
        return idx;
      }
    }
    this.poolIndex = (this.poolIndex + 1) % MAX_PARTICLES;
    return this.poolIndex;
  }

  emitTrail(x, y, z, color, count = TRAIL_PARTICLES_PER_FRAME) {
    const c = this._parseColor(color);
    for (let i = 0; i < count; i++) {
      const idx = this._getNextSlot();
      const p = this._pool[idx];
      p.x = x + (Math.random() - 0.5) * 0.01;
      p.y = y + (Math.random() - 0.5) * 0.01;
      p.z = z;
      p.vx = (Math.random() - 0.5) * 0.002;
      p.vy = (Math.random() - 0.5) * 0.002;
      p.vz = 0;
      p.life = PARTICLE_LIFETIME;
      p.maxLife = PARTICLE_LIFETIME;
      p.size = 3 + Math.random() * 5;
      p.color = c;
      p.alpha = 0.8 + Math.random() * 0.2;
      p.active = true;
    }
  }

  emitBurst(x, y, z, color, count = 20) {
    const c = this._parseColor(color);
    for (let i = 0; i < count; i++) {
      const idx = this._getNextSlot();
      const p = this._pool[idx];
      const angle = Math.random() * Math.PI * 2;
      const speed = SPARK_SPEED * (0.3 + Math.random() * 0.7);
      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = Math.cos(angle) * speed * 0.02;
      p.vy = Math.sin(angle) * speed * 0.02;
      p.vz = (Math.random() - 0.5) * 0.01;
      p.life = 0.5 + Math.random() * 0.8;
      p.maxLife = p.life;
      p.size = 2 + Math.random() * 4;
      p.color = c;
      p.alpha = 1.0;
      p.active = true;
    }
  }

  update(dt) {
    const posAttr = this.mesh.geometry.getAttribute('position');
    const colAttr = this.mesh.geometry.getAttribute('aColor');
    const lifeAttr = this.mesh.geometry.getAttribute('aLife');
    const sizeAttr = this.mesh.geometry.getAttribute('aSize');
    const alphaAttr = this.mesh.geometry.getAttribute('aAlpha');

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this._pool[i];
      if (!p.active) {
        posAttr.array[i * 3 + 2] = -999;
        alphaAttr.array[i] = 0;
        continue;
      }

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        alphaAttr.array[i] = 0;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;

      const lifeRatio = p.life / p.maxLife;

      posAttr.array[i * 3] = p.x;
      posAttr.array[i * 3 + 1] = p.y;
      posAttr.array[i * 3 + 2] = p.z;
      colAttr.array[i * 3] = p.color[0];
      colAttr.array[i * 3 + 1] = p.color[1];
      colAttr.array[i * 3 + 2] = p.color[2];
      lifeAttr.array[i] = lifeRatio;
      sizeAttr.array[i] = p.size * lifeRatio;
      alphaAttr.array[i] = p.alpha * lifeRatio;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  }

  _parseColor(color) {
    if (Array.isArray(color)) return color;
    const c = new THREE.Color(color);
    return [c.r, c.g, c.b];
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.scene.remove(this.mesh);
  }
}
