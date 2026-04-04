export function exportCanvasAsImage(canvas, filename = 'air-doodle.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportCanvasAsVideo(canvas, durationMs = 5000) {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'air-doodle.webm';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    };

    recorder.start();
    setTimeout(() => recorder.stop(), durationMs);
  });
}
