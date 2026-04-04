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

    internals.current = { scene, camera, renderer, particles, lastTime: performance.now() };

    const animate = () => {
      if (!internals.current) return;
      requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - internals.current.lastTime) / 1000, 0.1);
      internals.current.lastTime = now;

      internals.current.particles.update(dt);
      internals.current.renderer.render(internals.current.scene, internals.current.camera);
    };
    animate();

    const handleResize = () => {
      if (!internals.current) return;
      internals.current.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    internals.current._cleanup = () => window.removeEventListener('resize', handleResize);
  }, [externalCanvasRef]);

  useEffect(() => {
    init();
    return () => {
      if (internals.current) {
        internals.current._cleanup?.();
        internals.current.particles.dispose();
        internals.current.renderer.dispose();
        if (mountRef.current && internals.current.renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(internals.current.renderer.domElement);
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
