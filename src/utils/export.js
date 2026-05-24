export function exportCanvasAsImage(canvas, filename = 'air-doodle.png') {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Image export failed:', err);
  }
}

function getSupportedMimeType() {
  const types = [
    'video/webm; codecs=vp9',
    'video/webm; codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function exportCanvasAsVideo(canvas, durationMs = 5000) {
  return new Promise((resolve, reject) => {
    let stream;
    try {
      stream = canvas.captureStream(30);
    } catch (err) {
      reject(new Error(`Cannot capture canvas stream: ${err.message}`));
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      reject(new Error('No supported video codec found for recording'));
      return;
    }

    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (err) {
      reject(new Error(`MediaRecorder init failed: ${err.message}`));
      return;
    }

    const chunks = [];
    let timer = null;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onerror = (e) => {
      clearTimeout(timer);
      reject(e.error || new Error('Recording failed'));
    };

    recorder.onstop = () => {
      clearTimeout(timer);
      if (chunks.length === 0) {
        resolve();
        return;
      }
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const link = document.createElement('a');
      link.download = `air-doodle.${ext}`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    };

    recorder.start();
    timer = setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, durationMs);
  });
}
