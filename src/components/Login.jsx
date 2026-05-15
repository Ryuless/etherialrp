import { useState } from 'react';
import './Login.css';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login gagal');
                setLoading(false);
                return;
            }

            // Save token to localStorage
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));

            onLogin(data.admin);
        } catch (err) {
            setError('Koneksi ke server gagal');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>⚔️ Etherial Admin</h1>
                    <p>Fantasy RPG Management System</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username admin"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">⚠️ {error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '🔄 Loading...' : '🔓 Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>🛡️ Secured Admin Dashboard</p>
                </div>
            </div>
        </div>
    );
}
