import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './components/Login'
import DashboardLayout from './components/Dashboard'

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (adminData) => {
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #2d0052 100%)',
        color: '#a82be2'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return admin ? (
    <DashboardLayout admin={admin} onLogout={handleLogout} onAdminUpdate={handleLogin} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
