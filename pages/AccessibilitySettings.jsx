import { useState, useEffect } from 'react';

const T = {
  bg: '#0e1020',
  card: '#1a1e35',
  border: '#2a2f50',
  gold: '#ffc400',
  text: '#e8eaf6',
  muted: '#9ea3c0',
  green: '#10b981',
  red: '#ef4444',
};

const WCAG_FEATURES = [
  { id: 'text_size', label: 'Text Size', icon: '🔤', enabled: true },
  { id: 'high_contrast', label: 'High Contrast', icon: '⚫', enabled: false },
  { id: 'dyslexia_font', label: 'Dyslexia Font', icon: '📝', enabled: false },
  { id: 'screen_reader', label: 'Screen Reader', icon: '🔊', enabled: true },
  { id: 'reduce_motion', label: 'Reduce Motion', icon: '⏸️', enabled: false },
  { id: 'captions', label: 'Video Captions', icon: '📺', enabled: true },
];

export default function AccessibilitySettings() {
  const [textSize, setTextSize] = useState(100);
  const [features, setFeatures] = useState(WCAG_FEATURES);
  const [language, setLanguage] = useState('en');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  function loadSettings() {
    const saved = localStorage.getItem('lc_a11y_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setTextSize(settings.textSize || 100);
        setFeatures(settings.features || WCAG_FEATURES);
        setLanguage(settings.language || 'en');
        applySettings(settings);
      } catch (e) {
        console.error('Settings load error:', e);
      }
    }
  }

  function applySettings(settings: any) {
    const root = document.documentElement;

    // Text size
    root.style.fontSize = `${settings.textSize || 100}%`;

    // High contrast
    if (settings.features?.find((f: any) => f.id === 'high_contrast' && f.enabled)) {
      root.style.filter = 'contrast(1.5)';
    } else {
      root.style.filter = 'none';
    }

    // Dyslexia font
    if (settings.features?.find((f: any) => f.id === 'dyslexia_font' && f.enabled)) {
      root.style.fontFamily = '"OpenDyslexic", sans-serif';
    } else {
      root.style.fontFamily = 'system-ui, sans-serif';
    }

    // Reduce motion
    if (settings.features?.find((f: any) => f.id === 'reduce_motion' && f.enabled)) {
      root.style.setProperty('--motion-duration', '0s');
    } else {
      root.style.setProperty('--motion-duration', '0.3s');
    }
  }

  function toggleFeature(id: string) {
    const updated = features.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    setFeatures(updated);
  }

  function saveSettings() {
    const settings = {
      textSize,
      features,
      language,
      saved_at: new Date().toISOString(),
    };

    localStorage.setItem('lc_a11y_settings', JSON.stringify(settings));
    applySettings(settings);
    setSavedMessage('✅ Settings saved!');
    setTimeout(() => setSavedMessage(''), 3000);
  }

  function resetSettings() {
    localStorage.removeItem('lc_a11y_settings');
    setTextSize(100);
    setFeatures(WCAG_FEATURES);
    setLanguage('en');
    applySettings({ textSize: 100, features: WCAG_FEATURES, language: 'en' });
    setSavedMessage('🔄 Reset to defaults');
    setTimeout(() => setSavedMessage(''), 3000);
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: 14, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            ♿ Accessibility
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: T.gold, margin: '0 0 8px 0' }}>
            Customize Your Experience
          </h1>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
            WCAG 2.1 AA Compliant Settings
          </p>
        </div>

        {/* Text Size */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 12 }}>🔤 Text Size</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <input
              type="range"
              min="80"
              max="150"
              value={textSize}
              onChange={e => setTextSize(Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700, minWidth: '50px' }}>
              {textSize}%
            </div>
          </div>
          <div style={{ fontSize: textSize === 100 ? 13 : 13 * (textSize / 100), color: T.muted }}>
            Sample text at {textSize}% size
          </div>
        </div>

        {/* Feature Toggles */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 16 }}>✨ Features</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map(feature => (
              <label
                key={feature.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: T.bg,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `1px solid ${feature.enabled ? T.gold : T.border}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={feature.enabled}
                  onChange={() => toggleFeature(feature.id)}
                  style={{ marginRight: 12, width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 18, marginRight: 12 }}>{feature.icon}</span>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{feature.label}</span>
                {feature.enabled && (
                  <span style={{ marginLeft: 'auto', color: T.green, fontSize: 12 }}>Active</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Language */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 12 }}>🌐 Language</div>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              width: '100%',
              background: T.bg,
              border: `1px solid ${T.border}`,
              color: T.text,
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="vi">Tiếng Việt</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Feedback */}
        {savedMessage && (
          <div style={{ color: T.green, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {savedMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={saveSettings}
            style={{
              flex: 1,
              background: T.gold,
              color: T.bg,
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Save Settings
          </button>
          <button
            onClick={resetSettings}
            style={{
              flex: 1,
              background: T.card,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}