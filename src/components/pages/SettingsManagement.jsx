import { useEffect, useRef, useState } from 'react';
import { Settings, BellRing, ShieldCheck, Monitor, Trash2, Palette, PanelsTopLeft, Download, RefreshCw, Database, KeyRound, User } from 'lucide-react';
import '../styles/Pages.css';

const defaultPrefs = {
    autoRefresh: false,
    compactSidebar: false
};

export default function SettingsManagement({ admin, onCompactSidebarChange, onAdminUpdate }) {
    const [prefs, setPrefs] = useState(defaultPrefs);
    const [sectionFeedback, setSectionFeedback] = useState({ admin: '', data: '', username: '', password: '' });
    const [credentialForms, setCredentialForms] = useState({
        currentPasswordUsername: '',
        newUsername: admin?.username || '',
        currentPasswordPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [credentialBusy, setCredentialBusy] = useState({ username: false, password: false });
    const feedbackTimers = useRef({ admin: null, data: null });

    useEffect(() => {
        const stored = localStorage.getItem('etherialAdminSettings');
        if (stored) {
            try {
                setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
            } catch {
                setPrefs(defaultPrefs);
            }
        }
    }, []);

    useEffect(() => {
        setCredentialForms(prev => ({
            ...prev,
            newUsername: admin?.username || prev.newUsername
        }));
    }, [admin?.username]);

    const updatePref = (key) => {
        setPrefs(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('etherialAdminSettings', JSON.stringify(next));
            if (key === 'compactSidebar') {
                localStorage.setItem('etherialAdminCompactSidebar', String(next.compactSidebar));
                if (onCompactSidebarChange) {
                    onCompactSidebarChange(next.compactSidebar);
                }
            }
            return next;
        });
    };

    const showFeedback = (section, msg) => {
        setSectionFeedback(prev => ({ ...prev, [section]: msg }));

        if (feedbackTimers.current[section]) {
            clearTimeout(feedbackTimers.current[section]);
        }

        feedbackTimers.current[section] = setTimeout(() => {
            setSectionFeedback(prev => ({ ...prev, [section]: '' }));
        }, 3000);
    };

    const refreshNow = () => {
        try {
            localStorage.setItem('etherialAdminForceRefresh', Date.now().toString());
            showFeedback('data', 'Refresh requested');
        } catch (e) {
            showFeedback('data', 'Unable to trigger refresh');
        }
    };

    const clearAdminCache = () => {
        try {
            ['etherialAdminSettings', 'etherialAdminTheme', 'etherialAdminCompactSidebar'].forEach(k => localStorage.removeItem(k));
            setPrefs(defaultPrefs);
            if (onCompactSidebarChange) {
                onCompactSidebarChange(false);
            }
            showFeedback('admin', 'Admin cache cleared');
        } catch (e) {
            showFeedback('admin', 'Unable to clear cache');
        }
    };

    const resetThemeAndSidebar = () => {
        try {
            localStorage.removeItem('etherialAdminTheme');
            localStorage.setItem('etherialAdminCompactSidebar', 'false');
            setPrefs(prev => ({ ...prev, compactSidebar: false }));
            if (onCompactSidebarChange) {
                onCompactSidebarChange(false);
            }
            showFeedback('admin', 'Theme and sidebar reset');
        } catch (e) {
            showFeedback('admin', 'Failed to reset theme');
        }
    };

    const persistSession = (result) => {
        if (result?.token) {
            localStorage.setItem('adminToken', result.token);
        }

        if (result?.admin) {
            localStorage.setItem('adminUser', JSON.stringify(result.admin));
            if (onAdminUpdate) {
                onAdminUpdate(result.admin);
            }
        }
    };

    const saveUsername = async () => {
        const nextUsername = credentialForms.newUsername.trim();

        if (!nextUsername) {
            showFeedback('username', 'Username is required');
            return;
        }

        if (!credentialForms.currentPasswordUsername) {
            showFeedback('username', 'Current password is required');
            return;
        }

        setCredentialBusy(prev => ({ ...prev, username: true }));
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/account/update-credentials`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: credentialForms.currentPasswordUsername,
                    newUsername: nextUsername
                })
            });

            let data;
            const text = await response.text();
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            if (!response.ok) {
                console.error('Update username response error', response.status, text);
                showFeedback('username', data.message || `Failed to update username (${response.status})`);
                return;
            }

            persistSession(data);
            setCredentialForms(prev => ({ ...prev, currentPasswordUsername: '' }));
            showFeedback('username', 'Username updated');
        } catch (error) {
            showFeedback('username', 'Unable to update username');
        } finally {
            setCredentialBusy(prev => ({ ...prev, username: false }));
        }
    };

    const savePassword = async () => {
        if (!credentialForms.currentPasswordPassword) {
            showFeedback('password', 'Current password is required');
            return;
        }

        if (!credentialForms.newPassword) {
            showFeedback('password', 'New password is required');
            return;
        }

        if (credentialForms.newPassword !== credentialForms.confirmPassword) {
            showFeedback('password', 'Passwords do not match');
            return;
        }

        setCredentialBusy(prev => ({ ...prev, password: true }));
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/account/update-credentials`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: credentialForms.currentPasswordPassword,
                    newPassword: credentialForms.newPassword
                })
            });

            let data;
            const text = await response.text();
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            if (!response.ok) {
                console.error('Update password response error', response.status, text);
                showFeedback('password', data.message || `Failed to update password (${response.status})`);
                return;
            }

            persistSession(data);
            setCredentialForms(prev => ({
                ...prev,
                currentPasswordPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            showFeedback('password', 'Password updated');
        } catch (error) {
            showFeedback('password', 'Unable to update password');
        } finally {
            setCredentialBusy(prev => ({ ...prev, password: false }));
        }
    };

    const btnBase = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 14,
        cursor: 'pointer',
        border: '1px solid var(--omni-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        textAlign: 'left'
    };

    const btnPrimary = {
        ...btnBase,
        background: 'linear-gradient(135deg,#60a5fa,#34d399)',
        color: 'white',
        border: 'none'
    };

    const btnAccent = {
        ...btnBase,
        background: 'linear-gradient(135deg,#fb7185,#f97316)',
        color: 'white',
        border: 'none'
    };

    const btnGhost = {
        ...btnBase,
        background: 'transparent',
        color: 'var(--omni-text)'
    };

    const ActionCard = ({ icon: Icon, title, description, onClick, variant = 'ghost' }) => {
        const style = variant === 'primary' ? btnPrimary : variant === 'accent' ? btnAccent : btnGhost;
        return (
            <button onClick={onClick} style={style}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0}}>
                    <div style={{width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', flexShrink: 0}}>
                        <Icon size={18} />
                    </div>
                    <div style={{minWidth: 0}}>
                        <div style={{fontWeight: 800, lineHeight: 1.1}}>{title}</div>
                        <div style={{fontSize: '0.82rem', opacity: 0.85, marginTop: 4}}>{description}</div>
                    </div>
                </div>
                <div style={{fontSize: '0.82rem', opacity: 0.85, flexShrink: 0}}>Execute</div>
            </button>
        );
    };

    const ToggleRow = ({ icon: Icon, title, description, enabled, onChange, accent = 'var(--omni-accent)' }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid var(--omni-border)',
            background: 'var(--omni-bg-elevated)'
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(56, 189, 248, 0.10)',
                    color: accent,
                    flexShrink: 0
                }}>
                    <Icon size={18} />
                </div>
                <div>
                    <div style={{fontWeight: 700, marginBottom: 3}}>{title}</div>
                    <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.88rem'}}>{description}</div>
                </div>
            </div>

            <button
                onClick={onChange}
                style={{
                    minWidth: 56,
                    height: 32,
                    borderRadius: 999,
                    border: '1px solid var(--omni-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    background: enabled ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : 'transparent',
                    boxShadow: enabled ? '0 0 18px rgba(56, 189, 248, 0.22)' : 'none',
                    transition: 'all 0.2s ease'
                }}
                aria-label={title}
            >
                <span style={{
                    position: 'absolute',
                    top: 3,
                    left: enabled ? 28 : 3,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s ease'
                }} />
            </button>
        </div>
    );

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Settings size={24} color="var(--omni-accent)" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Settings</h2>
                    </div>
                </div>

                <div className="omni-form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                    {/* Left column: Admin Utilities & Account */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <div style={{padding: 18, borderRadius: 14, border: '1px solid var(--omni-border)', background: 'var(--omni-bg-surface)'}}>
                            <div className="omni-section-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <Monitor size={16} />
                                Admin Utilities
                            </div>
                            <div style={{marginTop: 12, display: 'grid', gap: 10}}>
                                <ActionCard
                                    icon={Trash2}
                                    title="Invalidate Cache"
                                    description="Clear stored admin settings and cached layout state."
                                    variant="accent"
                                    onClick={() => clearAdminCache()}
                                />
                                <ActionCard
                                    icon={Palette}
                                    title="Reset Theme"
                                    description="Restore the theme to the default admin view."
                                    onClick={resetThemeAndSidebar}
                                />
                                <ActionCard
                                    icon={PanelsTopLeft}
                                    title="Toggle Compact Sidebar"
                                    description="Switch the sidebar density for more content space."
                                    onClick={() => {
                                        updatePref('compactSidebar');
                                        showFeedback('admin', 'Compact sidebar updated');
                                    }}
                                />
                                {sectionFeedback.admin ? <div style={{marginTop: 2, color: 'var(--omni-text-secondary)', fontSize: '0.88rem'}}>{sectionFeedback.admin}</div> : null}
                            </div>
                        </div>

                        <div style={{padding: 18, borderRadius: 14, border: '1px solid var(--omni-border)', background: 'var(--omni-bg-surface)'}}>
                            <div className="omni-section-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <ShieldCheck size={16} />
                                Account & Security
                            </div>
                            <div style={{marginTop: 12, display: 'grid', gap: 10}}>
                                <div style={{padding: 12, borderRadius: 12, background: 'var(--omni-bg-elevated)', border: '1px solid var(--omni-border)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
                                        <KeyRound size={16} />
                                        <div style={{fontWeight: 700}}>Edit Username</div>
                                    </div>
                                    <div style={{display: 'grid', gap: 10}}>
                                        <input
                                            type="text"
                                            value={credentialForms.newUsername}
                                            onChange={(e) => setCredentialForms(prev => ({ ...prev, newUsername: e.target.value }))}
                                            placeholder="New username"
                                            style={{padding: '10px 12px', borderRadius: 10, border: '1px solid var(--omni-border)', background: 'transparent', color: 'var(--omni-text-primary)'}}
                                        />
                                        <input
                                            type="password"
                                            value={credentialForms.currentPasswordUsername}
                                            onChange={(e) => setCredentialForms(prev => ({ ...prev, currentPasswordUsername: e.target.value }))}
                                            placeholder="Current password"
                                            style={{padding: '10px 12px', borderRadius: 10, border: '1px solid var(--omni-border)', background: 'transparent', color: 'var(--omni-text-primary)'}}
                                        />
                                        <button onClick={saveUsername} disabled={credentialBusy.username} style={btnGhost}>
                                            <span>{credentialBusy.username ? 'Saving...' : 'Save Username'}</span>
                                            <span>Execute</span>
                                        </button>
                                        {sectionFeedback.username ? <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.88rem'}}>{sectionFeedback.username}</div> : null}
                                    </div>
                                </div>

                                <div style={{padding: 12, borderRadius: 12, background: 'var(--omni-bg-elevated)', border: '1px solid var(--omni-border)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
                                        <KeyRound size={16} />
                                        <div style={{fontWeight: 700}}>Edit Password</div>
                                    </div>
                                    <div style={{display: 'grid', gap: 10}}>
                                        <input
                                            type="password"
                                            value={credentialForms.currentPasswordPassword}
                                            onChange={(e) => setCredentialForms(prev => ({ ...prev, currentPasswordPassword: e.target.value }))}
                                            placeholder="Current password"
                                            style={{padding: '10px 12px', borderRadius: 10, border: '1px solid var(--omni-border)', background: 'transparent', color: 'var(--omni-text-primary)'}}
                                        />
                                        <input
                                            type="password"
                                            value={credentialForms.newPassword}
                                            onChange={(e) => setCredentialForms(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="New password"
                                            style={{padding: '10px 12px', borderRadius: 10, border: '1px solid var(--omni-border)', background: 'transparent', color: 'var(--omni-text-primary)'}}
                                        />
                                        <input
                                            type="password"
                                            value={credentialForms.confirmPassword}
                                            onChange={(e) => setCredentialForms(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Confirm new password"
                                            style={{padding: '10px 12px', borderRadius: 10, border: '1px solid var(--omni-border)', background: 'transparent', color: 'var(--omni-text-primary)'}}
                                        />
                                        <button onClick={savePassword} disabled={credentialBusy.password} style={btnGhost}>
                                            <span>{credentialBusy.password ? 'Saving...' : 'Save Password'}</span>
                                            <span>Execute</span>
                                        </button>
                                        {sectionFeedback.password ? <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.88rem'}}>{sectionFeedback.password}</div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Data Tools + Admin Info (swapped) */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <div style={{padding: 18, borderRadius: 14, border: '1px solid var(--omni-border)', background: 'var(--omni-bg-surface)'}}>
                            <div className="omni-section-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <BellRing size={16} />
                                Data Tools
                            </div>
                            <div style={{marginTop: 12, display: 'grid', gap: 10}}>
                                <ActionCard
                                    icon={Download}
                                    title="Export Players CSV"
                                    description="Download the current character list as a CSV file."
                                    variant="primary"
                                    onClick={async () => {
                                        try {
                                            showFeedback('data', 'Exporting players...');
                                            const res = await fetch('/api/admin/players', { credentials: 'include' });
                                            if (!res.ok) {
                                                showFeedback('data', 'Export failed: ' + res.status);
                                                return;
                                            }
                                            const players = await res.json();
                                            if (!Array.isArray(players)) {
                                                showFeedback('data', 'No player data');
                                                return;
                                            }
                                            const keys = Array.from(new Set(players.flatMap(p => Object.keys(p))));
                                            const csv = [keys.join(',')].concat(players.map(p => keys.map(k => '"' + (p[k] ?? '') + '"').join(','))).join('\n');
                                            const blob = new Blob([csv], { type: 'text/csv' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'players.csv';
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();
                                            URL.revokeObjectURL(url);
                                            showFeedback('data', 'Players exported');
                                        } catch (e) {
                                            showFeedback('data', 'Export error');
                                        }
                                    }}
                                />

                                <ActionCard
                                    icon={Database}
                                    title="Recalculate Stats"
                                    description="Refresh computed admin counters and summary data."
                                    onClick={() => {
                                        try {
                                            localStorage.setItem('etherialAdminRecalc', Date.now().toString());
                                            showFeedback('data', 'Recalc requested');
                                        } catch (e) {
                                            showFeedback('data', 'Recalc failed');
                                        }
                                    }}
                                />

                                <ActionCard
                                    icon={RefreshCw}
                                    title="Force Refresh"
                                    description="Mark dashboard data to reload on next render."
                                    onClick={refreshNow}
                                />
                                {sectionFeedback.data ? <div style={{marginTop: 2, color: 'var(--omni-text-secondary)', fontSize: '0.88rem'}}>{sectionFeedback.data}</div> : null}
                            </div>
                        </div>

                        <div style={{padding: 18, borderRadius: 14, border: '1px solid var(--omni-border)', background: 'var(--omni-bg-surface)'}}>
                            <div className="omni-section-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <User size={16} />
                                Admin Info
                            </div>
                            <div style={{marginTop: 12, display: 'grid', gap: 8}}>
                                <div style={{padding: 12, borderRadius: 10, background: 'var(--omni-bg-elevated)'}}>
                                    <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.82rem'}}>Username</div>
                                    <div style={{fontWeight: 700}}>{admin?.username || '—'}</div>
                                </div>
                                <div style={{padding: 12, borderRadius: 10, background: 'var(--omni-bg-elevated)'}}>
                                    <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.82rem'}}>Role</div>
                                    <div style={{fontWeight: 700}}>{admin?.role || '—'}</div>
                                </div>
                                <div style={{padding: 12, borderRadius: 10, background: 'var(--omni-bg-elevated)'}}>
                                    <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.82rem'}}>Connection</div>
                                    <div style={{fontWeight: 700, color: admin ? '#22c55e' : '#f97316'}}>{admin ? 'Connected' : 'Disconnected'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}