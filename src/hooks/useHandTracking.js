import { useEffect, useRef, useCallback, useState } from 'react';
import { HandTracker } from '../engine/HandTracker';
import { GestureStateMachine } from '../engine/GestureStateMachine';
import { PointSmoother } from '../engine/Smoothing';

export function useHandTracking(onFrame, onGestureChange) {
  const videoRef = useRef(null);
  const trackerRef = useRef(null);
  const smootherRef = useRef(new PointSmoother());
  const [status, setStatus] = useState('idle');
  const startingRef = useRef(false);

  const onFrameRef = useRef(onFrame);
  const onGestureChangeRef = useRef(onGestureChange);
  useEffect(() => { onFrameRef.current = onFrame; }, [onFrame]);
  useEffect(() => { onGestureChangeRef.current = onGestureChange; }, [onGestureChange]);

  const gestureRef = useRef(null);
  useEffect(() => {
    gestureRef.current = new GestureStateMachine((gesture, prev) => {
      onGestureChangeRef.current?.(gesture, prev);
    });
  }, []);

  const handleResults = useCallback((data) => {
    if (!data.detected) {
      gestureRef.current?.update('none');
      onFrameRef.current?.({ detected: false });
      return;
    }

    const now = performance.now();
    const smoothed = smootherRef.current.smooth(
      data.indexTip.x, data.indexTip.y, data.indexTip.z, now,
    );
    gestureRef.current?.update(data.gesture, now);

    onFrameRef.current?.({
      detected: true,
      gesture: gestureRef.current?.currentGesture,
      indexTip: smoothed,
      landmarks: data.landmarks,
      handedness: data.handedness,
      canTrigger: () => gestureRef.current?.canTriggerAction(performance.now()),
    });
  }, []);

  const start = useCallback(async () => {
    if (status === 'active' || startingRef.current) return;
    startingRef.current = true;
    setStatus('loading');

    try {
      const video = videoRef.current;
      if (!video) throw new Error('Video element not mounted');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });

      video.srcObject = stream;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 30000);
        let resolved = false;
        const done = () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          video.play().then(resolve).catch(reject);
        };
        video.onloadedmetadata = done;
        if (video.readyState >= 1) done();
      });

      trackerRef.current = new HandTracker({ onResults: handleResults });
      await trackerRef.current.start(video);
      smootherRef.current.reset();
      setStatus('active');
    } catch (err) {
      console.error('Hand tracking init failed:', err);
      setStatus('error');
    } finally {
      startingRef.current = false;
    }
  }, [status, handleResults]);

  const stop = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    startingRef.current = false;
    setStatus('idle');
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, start, stop, status };
}
