import { NEON_PALETTE } from '../utils/colors';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

export default function Toolbar({
  activeColor,
  onColorChange,
  onClear,
  onUndo,
  onRedo,
  onExportImage,
  onExportVideo,
  onToggleSound,
  soundEnabled,
  isRecording,
  mode,
  onModeChange,
}) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.section}>
          <label style={styles.label}>Mode</label>
          <div style={styles.actions}>
            <ToolBtn
              icon="✏️"
              label="Draw"
              onClick={() => onModeChange('draw')}
              active={mode === 'draw'}
            />
            <ToolBtn
              icon="✋"
              label="Drag"
              onClick={() => onModeChange('drag')}
              active={mode === 'drag'}
            />
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <label style={styles.label}>Colors</label>
          <div style={styles.palette}>
            {NEON_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => onColorChange(c.hex)}
                title={c.name}
                style={{
                  ...styles.swatch,
                  background: c.hex,
                  boxShadow: activeColor === c.hex
                    ? `0 0 12px ${c.hex}, 0 0 24px ${c.hex}60, inset 0 0 6px rgba(255,255,255,0.3)`
                    : `0 0 4px ${c.hex}40`,
                  transform: activeColor === c.hex ? 'scale(1.25)' : 'scale(1)',
                  border: activeColor === c.hex ? '2px solid #fff' : '2px solid transparent',
                }}
              />
            ))}
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <label style={styles.label}>Actions</label>
          <div style={styles.actions}>
            <ToolBtn icon="↩" label="Undo" onClick={onUndo} />
            <ToolBtn icon="↪" label="Redo" onClick={onRedo} />
            <ToolBtn icon="🗑" label="Clear" onClick={onClear} danger />
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <label style={styles.label}>Export</label>
          <div style={styles.actions}>
            <ToolBtn icon="📷" label="Image" onClick={onExportImage} />
            <ToolBtn
              icon={isRecording ? '⏹' : '🎬'}
              label={isRecording ? 'Stop' : 'Video'}
              onClick={onExportVideo}
              active={isRecording}
            />
          </div>
        </div>

        <div style={styles.divider} />

        <ToolBtn
          icon={soundEnabled ? '🔊' : '🔇'}
          label="Sound"
          onClick={onToggleSound}
          active={soundEnabled}
        />
      </div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick, danger, active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        ...styles.btn,
        ...(danger ? styles.btnDanger : {}),
        ...(active ? styles.btnActive : {}),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? 'rgba(255,50,50,0.3)' : 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
      }}
    >
      <span style={styles.btnIcon}>{icon}</span>
      <span style={styles.btnLabel}>{label}</span>
    </button>
  );
}

const styles = {
  wrapper: {
    position: 'absolute',
    bottom: isMobile ? 12 : 24,
    left: 0, right: 0,
    display: 'flex', justifyContent: 'center',
    zIndex: 30,
    pointerEvents: 'none',
    padding: isMobile ? '0 8px' : 0,
  },
  container: {
    display: 'flex', alignItems: 'center',
    gap: isMobile ? 8 : 16,
    padding: isMobile ? '8px 12px' : '12px 24px',
    background: 'rgba(10, 10, 18, 0.85)',
    borderRadius: isMobile ? 16 : 20,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    pointerEvents: 'all',
    overflowX: 'auto',
    overflowY: 'hidden',
    maxWidth: '100%',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    touchAction: 'pan-x',
  },
  section: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: isMobile ? 4 : 6,
    flexShrink: 0,
  },
  label: {
    fontSize: isMobile ? 8 : 9, letterSpacing: 2,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase', fontWeight: 600,
  },
  palette: { display: 'flex', gap: isMobile ? 4 : 6 },
  swatch: {
    width: isMobile ? 24 : 20,
    height: isMobile ? 24 : 20,
    borderRadius: '50%', cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    flexShrink: 0,
    minWidth: isMobile ? 24 : 20,
  },
  divider: {
    width: 1, height: isMobile ? 28 : 36,
    background: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  actions: { display: 'flex', gap: isMobile ? 2 : 4 },
  btn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: isMobile ? '6px 8px' : '6px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    flexShrink: 0,
    minHeight: 40,
    minWidth: 40,
  },
  btnIcon: { fontSize: isMobile ? 14 : 16 },
  btnLabel: {
    fontSize: isMobile ? 8 : 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  btnDanger: { borderColor: 'rgba(255,60,60,0.2)' },
  btnActive: { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(0,240,255,0.3)' },
};
