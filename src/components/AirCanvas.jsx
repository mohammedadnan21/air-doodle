import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ParticleSystem } from '../engine/ParticleSystem';

export default function AirCanvas({ canvasRef: externalCanvasRef }) {
  const mountRef = useRef(null);
  const internals = useRef(null);

  const init = useCallback(() => {
    if (internals.current || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    if (externalCanvasRef) externalCanvasRef.current = renderer.domElement;

    const particles = new ParticleSystem(scene);

    const state = {
      scene, camera, renderer, particles,
      lastTime: performance.now(),
      rafId: null,
      disposed: false,
    };
    internals.current = state;

    const animate = () => {
      if (state.disposed) return;
      state.rafId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - state.lastTime) / 1000, 0.1);
      state.lastTime = now;

      state.particles.update(dt);
      state.renderer.render(state.scene, state.camera);
    };
    state.rafId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (state.disposed) return;
      state.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    state._cleanup = () => window.removeEventListener('resize', handleResize);
  }, [externalCanvasRef]);

  useEffect(() => {
    init();
    const mount = mountRef.current;
    return () => {
      const state = internals.current;
      if (state) {
        state.disposed = true;
        if (state.rafId != null) cancelAnimationFrame(state.rafId);
        state._cleanup?.();
        state.particles.dispose();
        state.renderer.dispose();
        if (mount && state.renderer.domElement.parentNode === mount) {
          mount.removeChild(state.renderer.domElement);
        }
        internals.current = null;
      }
    };
  }, [init]);

  useEffect(() => {
    if (!internals.current) return;
    window._airDoodleParticles = internals.current.particles;
    return () => { window._airDoodleParticles = null; };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    />
  );
}
