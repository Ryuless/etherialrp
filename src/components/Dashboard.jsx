import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Swords, Crown, Sparkles, 
    Dna, Scroll, History, LogOut, Moon, Sun, Bell, Settings,
    Menu, X, BookOpen
} from 'lucide-react';
import './Dashboard.css';

import Dashboard from './pages/Dashboard';
import UsersManagement from './pages/UsersManagement';
import MonstersManagement from './pages/MonstersManagement';
import ItemsManagement from './pages/ItemsManagement';
import SkillsManagement from './pages/SkillsManagement';
import RacesManagement from './pages/RacesManagement';
import JobsManagement from './pages/JobsManagement';
import QuestsManagement from './pages/QuestsManagement';
import BattleHistory from './pages/BattleHistory';
import SettingsManagement from './pages/SettingsManagement';

export default function DashboardLayout({ admin, onLogout, onAdminUpdate }) {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('etherialAdminTheme');
        return saved || 'dark';
    });
    const [compactSidebar, setCompactSidebar] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('etherialAdminSettings') || '{}');
            return Boolean(stored.compactSidebar || localStorage.getItem('etherialAdminCompactSidebar') === 'true');
        } catch {
            return localStorage.getItem('etherialAdminCompactSidebar') === 'true';
        }
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        localStorage.setItem('etherialAdminTheme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('etherialAdminCompactSidebar', String(compactSidebar));
    }, [compactSidebar]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Players', icon: Users },
        { id: 'monsters', label: 'Bestiary', icon: Swords },
        { id: 'items', label: 'Armory', icon: Crown },
        { id: 'skills', label: 'Magic & Skills', icon: Sparkles },
        { id: 'races', label: 'Lineage/Races', icon: Dna },
        { id: 'jobs', label: 'Classes/Jobs', icon: BookOpen },
        { id: 'quests', label: 'World Maps', icon: Scroll },
        { id: 'battles', label: 'Starter Kits', icon: History }
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard admin={admin} onNavigate={setCurrentPage} />;
            case 'users': return <UsersManagement />;
            case 'monsters': return <MonstersManagement />;
            case 'items': return <ItemsManagement />;
            case 'skills': return <SkillsManagement />;
            case 'races': return <RacesManagement />;
            case 'jobs': return <JobsManagement />;
            case 'quests': return <QuestsManagement />;
            case 'battles': return <BattleHistory />;
            case 'settings': return <SettingsManagement admin={admin} onCompactSidebarChange={setCompactSidebar} onAdminUpdate={onAdminUpdate} />;
            default: return <Dashboard admin={admin} onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className={`omni-layout omni-${theme} ${compactSidebar ? 'omni-compact-sidebar' : ''}`}>
            {/* Top Navigation Bar */}
            <header className="omni-topbar">
                <div className="omni-topbar-left">
                    <button className="omni-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="omni-brand">
                        <div className="omni-logo-cube">
                            <Crown size={20} strokeWidth={2.5}/>
                        </div>
                        <span className="omni-brand-name">Etherial Fantasy</span>
                    </div>
                </div>

                <div className="omni-topbar-right">
                    <span className="omni-time">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="omni-icon-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button className="omni-icon-btn">
                        <Bell size={18} />
                        <span className="omni-badge"></span>
                    </button>
                    <div className="omni-user-drop">
                        <div className="omni-avatar">
                            {admin.username.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            <div className="omni-body">
                {/* Side Navigation for remaining items or mobile */}
                <aside className={`omni-sidenav ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="omni-sidenav-inner">
                        <div className="omni-nav-group">
                            <span className="omni-nav-label">Core Modules</span>
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button 
                                        key={item.id}
                                        className={`omni-side-item ${currentPage === item.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setCurrentPage(item.id);
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <Icon size={18} className="omni-side-icon"/>
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="omni-nav-group bottom-group">
                            <span className="omni-nav-label">System</span>
                            <button
                                className={`omni-side-item ${currentPage === 'settings' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentPage('settings');
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Settings size={18} className="omni-side-icon"/>
                                <span>Settings</span>
                            </button>
                            <button className="omni-side-item text-danger" onClick={onLogout}>
                                <LogOut size={18} className="omni-side-icon"/>
                                <span>Disconnect</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main View Area */}
                <main className="omni-main">
                    <div className="omni-view-container">
                        <div className="omni-page-header">
                            <h1>{currentPage === 'settings' ? 'Settings' : (menuItems.find(item => item.id === currentPage)?.label || 'Dashboard')}</h1>
                            <p className="omni-page-subtitle">Manage and monitor realm activities</p>
                        </div>
                        <div className="omni-page-content">
                            {renderPage()}
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Grid Background Effect */}
            <div className="omni-grid-bg"></div>
        </div>
    );
}
