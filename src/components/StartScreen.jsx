export default function StartScreen({ onStart, status }) {
  const isLoading = status === 'loading';

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div style={styles.glow} />

        <h1 style={styles.title}>
          <span style={styles.titleAir}>AIR</span>
          <span style={styles.titleDoodle}>DOODLE</span>
        </h1>

        <p style={styles.subtitle}>Draw in the air. Watch it come alive.</p>

        <div style={styles.features}>
          <Feature icon="✏️" text="Draw with mouse or touch" />
          <Feature icon="✨" text="Neon particle trails" />
          <Feature icon="✋" text="Drag & move your strokes" />
          <Feature icon="🖐️" text="Optional hand tracking" />
        </div>

        <div style={styles.buttons}>
          <button
            onClick={() => onStart(false)}
            disabled={isLoading}
            style={styles.button}
          >
            Start Drawing →
          </button>

          <button
            onClick={() => onStart(true)}
            disabled={isLoading}
            style={styles.buttonSecondary}
          >
            {isLoading ? (
              <span style={styles.loading}>
                <span style={styles.spinner} />
                Loading Camera & AI...
              </span>
            ) : (
              '🖐️ Start with Hand Tracking'
            )}
          </button>
        </div>

        <p style={styles.hint}>
          Mouse/touch works everywhere · Hand tracking needs webcam & Chrome
        </p>
      </div>

      <div style={styles.footer}>
        <div style={styles.authorCard}>
          <span style={styles.authorName}>Mohammad Adnan</span>
          <span style={styles.authorCollege}>RVCE — RV College of Engineering</span>
          <div style={styles.authorContact}>
            <span style={styles.authorDetail}>muhammedadnan50007@gmail.com</span>
            <span style={styles.authorDot}>·</span>
            <span style={styles.authorDetail}>+91 9844942547</span>
          </div>
        </div>
        <span style={styles.footerText}>Built with Three.js + MediaPipe + Tone.js</span>
      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div style={styles.feature}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={styles.featureText}>{text}</span>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 70%)',
    zIndex: 100,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
  },
  content: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  title: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    margin: 0, lineHeight: 1,
  },
  titleAir: {
    fontSize: 72, fontWeight: 900, letterSpacing: 24,
    color: '#fff',
    textShadow: '0 0 40px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.15)',
  },
  titleDoodle: {
    fontSize: 36, fontWeight: 300, letterSpacing: 18,
    color: 'rgba(255,255,255,0.6)',
    marginTop: -4,
  },
  subtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2, marginTop: 20,
    fontWeight: 300,
  },
  features: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '12px 28px', marginTop: 48,
  },
  feature: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  featureText: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  buttons: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    marginTop: 48,
  },
  button: {
    padding: '16px 52px',
    fontSize: 15, fontWeight: 700, letterSpacing: 2,
    color: '#fff',
    background: 'linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(191,95,255,0.25) 100%)',
    border: '1px solid rgba(0,240,255,0.4)',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    outline: 'none',
  },
  buttonSecondary: {
    padding: '12px 36px',
    fontSize: 13, fontWeight: 500, letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  loading: { display: 'flex', alignItems: 'center', gap: 10 },
  spinner: {
    display: 'inline-block', width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: '#00f0ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  hint: {
    fontSize: 11, color: 'rgba(255,255,255,0.2)',
    marginTop: 20, letterSpacing: 1,
  },
  footer: {
    position: 'absolute', bottom: 24,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  authorCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '12px 28px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  authorName: {
    fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  authorCollege: {
    fontSize: 11, color: 'rgba(0,240,255,0.5)',
    letterSpacing: 1.5, fontWeight: 500,
  },
  authorContact: {
    display: 'flex', alignItems: 'center', gap: 8, marginTop: 2,
  },
  authorDetail: {
    fontSize: 10, color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  authorDot: {
    fontSize: 10, color: 'rgba(255,255,255,0.15)',
  },
  footerText: {
    fontSize: 10, color: 'rgba(255,255,255,0.15)',
    letterSpacing: 2,
  },
};
