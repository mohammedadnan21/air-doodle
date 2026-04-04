import { NEON_PALETTE } from '../utils/colors';

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
    <div style={styles.container}>
      {/* Mode toggle */}
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

      {/* Colors */}
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
                transform: activeColor === c.hex ? 'scale(1.3)' : 'scale(1)',
                border: activeColor === c.hex ? '2px solid #fff' : '2px solid transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.divider} />

      {/* Actions */}
      <div style={styles.section}>
        <label style={styles.label}>Actions</label>
        <div style={styles.actions}>
          <ToolBtn icon="↩" label="Undo" onClick={onUndo} />
          <ToolBtn icon="↪" label="Redo" onClick={onRedo} />
          <ToolBtn icon="🗑" label="Clear" onClick={onClear} danger />
        </div>
      </div>

      <div style={styles.divider} />

      {/* Export */}
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
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={styles.btnLabel}>{label}</span>
    </button>
  );
}

const styles = {
  container: {
    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '12px 24px',
    background: 'rgba(10, 10, 18, 0.75)',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    zIndex: 30,
    pointerEvents: 'all',
  },
  section: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  label: {
    fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase', fontWeight: 600,
  },
  palette: { display: 'flex', gap: 6 },
  swatch: {
    width: 20, height: 20, borderRadius: '50%', cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  divider: {
    width: 1, height: 36,
    background: 'rgba(255,255,255,0.08)',
  },
  actions: { display: 'flex', gap: 4 },
  btn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  btnLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },
  btnDanger: { borderColor: 'rgba(255,60,60,0.2)' },
  btnActive: { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(0,240,255,0.3)' },
};
