import { useState } from 'react';

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

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📈' },
    { id: 'users', label: '👥 Users', icon: '👤' },
    { id: 'content', label: '🛡️ Moderation', icon: '⚠️' },
    { id: 'analytics', label: '📉 Analytics', icon: '📊' },
    { id: 'settings', label: '⚙️ Settings', icon: '🔧' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: T.card,
          borderRight: `1px solid ${T.border}`,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: T.gold, marginBottom: 20 }}>
          🛡️ Admin
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            style={{
              background: selectedTab === tab.id ? T.gold : 'transparent',
              color: selectedTab === tab.id ? T.bg : T.text,
              border: `1px solid ${selectedTab === tab.id ? T.gold : T.border}`,
              borderRadius: 8,
              padding: '10px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: selectedTab === tab.id ? 700 : 500,
              fontSize: 13,
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '30px' }}>
          {selectedTab === 'overview' && (
            <OverviewTab />
          )}
          {selectedTab === 'users' && (
            <UsersTab />
          )}
          {selectedTab === 'content' && (
            <ModerationTab />
          )}
          {selectedTab === 'analytics' && (
            <AnalyticsTab />
          )}
          {selectedTab === 'settings' && (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.gold, marginBottom: 20 }}>Overview</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 30,
        }}
      >
        {[
          { label: 'Total Users', value: '12,345', icon: '👥' },
          { label: 'Active Today', value: '3,456', icon: '🟢' },
          { label: 'Content Flagged', value: '23', icon: '⚠️' },
          { label: 'System Health', value: '99.8%', icon: '💚' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <div style={{ fontSize: 24 }}>{stat.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.gold, margin: '8px 0' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.gold, marginBottom: 20 }}>User Management</div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: 13, color: T.muted }}>Search, filter, and manage users</div>
        <input
          type="text"
          placeholder="Search by name or email..."
          style={{
            width: '100%',
            marginTop: 12,
            background: T.bg,
            border: `1px solid ${T.border}`,
            color: T.text,
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
          }}
        />
      </div>
    </div>
  );
}

function ModerationTab() {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.gold, marginBottom: 20 }}>Content Moderation</div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: 13, color: T.muted }}>Review flagged content and take action</div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.gold, marginBottom: 20 }}>Analytics</div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: 13, color: T.muted }}>View platform metrics and reports</div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.gold, marginBottom: 20 }}>System Settings</div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Email Notifications', value: true },
            { label: 'Automatic Moderation', value: true },
            { label: 'Content Filters Active', value: true },
            { label: 'Backup Enabled', value: true },
          ].map(setting => (
            <label key={setting.label} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={setting.value} style={{ width: 18, height: 18 }} />
              <span style={{ color: T.text, fontSize: 13 }}>{setting.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}