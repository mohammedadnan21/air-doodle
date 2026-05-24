export default function StartScreen({ onStart, status }) {
  const isLoading = status === 'loading';
  const isMobile = window.innerWidth < 768;

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div style={styles.glow} />

        <h1 style={styles.title}>
          <span style={{
            ...styles.titleAir,
            fontSize: isMobile ? 48 : 72,
            letterSpacing: isMobile ? 12 : 24,
          }}>AIR</span>
          <span style={{
            ...styles.titleDoodle,
            fontSize: isMobile ? 22 : 36,
            letterSpacing: isMobile ? 8 : 18,
          }}>DOODLE</span>
        </h1>

        <p style={{
          ...styles.subtitle,
          fontSize: isMobile ? 13 : 16,
        }}>Draw in the air. Watch it come alive.</p>

        <div style={{
          ...styles.features,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          marginTop: isMobile ? 28 : 48,
          gap: isMobile ? '8px 0' : '12px 28px',
        }}>
          <Feature icon="✏️" text="Draw with mouse or touch" />
          <Feature icon="✨" text="Neon particle trails" />
          <Feature icon="✋" text="Drag & move your strokes" />
          <Feature icon="🖐️" text="Optional hand tracking" />
        </div>

        <div style={{
          ...styles.buttons,
          marginTop: isMobile ? 28 : 48,
        }}>
          <button
            onClick={() => onStart(false)}
            disabled={isLoading}
            style={{
              ...styles.button,
              padding: isMobile ? '14px 36px' : '16px 52px',
              fontSize: isMobile ? 13 : 15,
            }}
          >
            Start Drawing →
          </button>

          <button
            onClick={() => onStart(true)}
            disabled={isLoading}
            style={{
              ...styles.buttonSecondary,
              padding: isMobile ? '10px 24px' : '12px 36px',
              fontSize: isMobile ? 12 : 13,
            }}
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
          {isMobile ? 'Touch to draw · Webcam for hand tracking' : 'Mouse/touch works everywhere · Hand tracking needs webcam & Chrome'}
        </p>
      </div>

      <div style={styles.footer}>
        <div style={{
          ...styles.authorCard,
          padding: isMobile ? '10px 20px' : '12px 28px',
        }}>
          <span style={styles.authorName}>Mohammad Adnan</span>
          <span style={styles.authorCollege}>RVCE — RV College of Engineering</span>
          <div style={styles.authorContact}>
            <span style={styles.authorDetail}>muhammedadnan50007@gmail.com</span>
            {!isMobile && (
              <>
                <span style={styles.authorDot}>·</span>
                <span style={styles.authorDetail}>+91 9844942547</span>
              </>
            )}
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
    padding: '20px',
    overflowY: 'auto',
  },
  content: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative',
    width: '100%',
    maxWidth: 520,
  },
  glow: {
    position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  title: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    margin: 0, lineHeight: 1,
  },
  titleAir: {
    fontWeight: 900,
    color: '#fff',
    textShadow: '0 0 40px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.15)',
  },
  titleDoodle: {
    fontWeight: 300,
    color: 'rgba(255,255,255,0.6)',
    marginTop: -4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2, marginTop: 20,
    fontWeight: 300,
    textAlign: 'center',
  },
  features: {
    display: 'grid',
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
  },
  button: {
    fontWeight: 700, letterSpacing: 2,
    color: '#fff',
    background: 'linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(191,95,255,0.25) 100%)',
    border: '1px solid rgba(0,240,255,0.4)',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    outline: 'none',
    minHeight: 48,
  },
  buttonSecondary: {
    fontWeight: 500, letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    minHeight: 44,
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
    textAlign: 'center',
  },
  footer: {
    position: 'absolute', bottom: 20,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    width: '100%', maxWidth: 400,
    padding: '0 16px',
  },
  authorCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
    width: '100%',
  },
  authorName: {
    fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  authorCollege: {
    fontSize: 11, color: 'rgba(0,240,255,0.5)',
    letterSpacing: 1.5, fontWeight: 500,
    textAlign: 'center',
  },
  authorContact: {
    display: 'flex', alignItems: 'center', gap: 8, marginTop: 2,
    flexWrap: 'wrap', justifyContent: 'center',
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
    letterSpacing: 2, textAlign: 'center',
  },
};
