import { useState } from 'react';

const GESTURES = [
  { icon: '☝️', name: 'Point', desc: 'Index finger up to draw' },
  { icon: '🤏', name: 'Pinch', desc: 'Thumb + index to precision draw' },
  { icon: '✌️', name: 'Peace', desc: 'Two fingers to erase nearby' },
  { icon: '🖖', name: 'Three', desc: 'Three fingers to switch color' },
  { icon: '👍', name: 'Thumbs Up', desc: 'Thumb up to undo last stroke' },
  { icon: '🖐️', name: 'Open', desc: 'Open palm to pause drawing' },
];

export default function GestureGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={styles.toggle}
        title="Gesture Guide"
      >
        ?
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.title}>Gesture Guide</span>
            <button onClick={() => setOpen(false)} style={styles.close}>×</button>
          </div>
          <div style={styles.list}>
            {GESTURES.map((g) => (
              <div key={g.name} style={styles.item}>
                <span style={styles.icon}>{g.icon}</span>
                <div>
                  <div style={styles.name}>{g.name}</div>
                  <div style={styles.desc}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  toggle: {
    position: 'absolute', top: 20, right: 20,
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', zIndex: 25,
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s',
  },
  panel: {
    position: 'absolute', top: 64, right: 20,
    width: 260,
    background: 'rgba(10, 10, 20, 0.85)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    zIndex: 25,
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 13, fontWeight: 700, color: '#fff',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  close: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
    fontSize: 20, cursor: 'pointer',
  },
  list: { padding: '8px 12px 14px' },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 6px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  icon: { fontSize: 22, width: 32, textAlign: 'center' },
  name: { fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: 0.5 },
  desc: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
};
