import { useState, useEffect } from 'react';
import { Users, Swords, Crown, Activity, TrendingUp, Zap } from 'lucide-react';
import { 
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/Pages.css';

const COLORS = {
    // Chart colors - Blue palette
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    
    // Race colors
    raceColors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#84cc16', '#f97316', '#a855f7', '#14b8a6', '#6366f1', '#d946ef', '#059669', '#e11d48'],
    
    // Job colors  
    jobColors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316', '#a855f7']
};

const RADIAN = Math.PI / 180;

export default function DashboardHome({ admin }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMonsters: 0,
        totalItems: 0,
        totalSkills: 0,
        totalRaces: 0,
        totalJobs: 0,
        recentBattles: 0,
        totalGold: 0,
        viewType: 'user',
        timePeriod: 'weekly',
        timePeriods: { hourly: [], daily: [], weekly: [], monthly: [] },
        distributions: { races: [], jobs: [] },
        timestamp: new Date().toISOString()
    });
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        fetchStats();
        // Real-time update every second
        const interval = setInterval(fetchStats, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                console.error('Stats fetch failed', response.status, response.statusText);
                if (response.status === 401 || response.status === 403) {
                    console.warn('Authorization failed — clearing stored admin token and user. Please login again.');
                    try { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); } catch (e) {}
                }
                return;
            }
            const data = await response.json();
            // merge with existing state to preserve viewType and any local UI flags
            setStats(s => ({ ...s, ...data }));
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Format numbers without commas
    const formatNumber = (num) => {
        return Math.floor(num).toString();
    };

    const renderRaceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        if (!percent || percent < 0.03) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#e5e7eb"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const cards = [
        { title: 'Total Players', value: formatNumber(stats.totalUsers), icon: Users, color: 'eth-blue' },
        { title: 'Bestiary Entities', value: formatNumber(stats.totalMonsters), icon: Swords, color: 'eth-red' },
        { title: 'Treasury Items', value: formatNumber(stats.totalItems), icon: Crown, color: 'eth-amber' },
        { title: 'Magic & Skills', value: formatNumber(stats.totalSkills), icon: Activity, color: 'eth-emerald' }
    ];

    const additionalCards = [
        { title: 'Races', value: formatNumber(stats.totalRaces), icon: Zap, color: 'eth-purple' },
        { title: 'Classes/Jobs', value: formatNumber(stats.totalJobs), icon: TrendingUp, color: 'eth-cyan' }
    ];


    return (
        <div className="eth-dashboard-overview">
            <div className="eth-welcome-banner">
                <div className="eth-welcome-content">
                    <h1>Realm Overview</h1>
                    <p>Welcome back, Commander <span className="eth-highlight">{admin.username}</span>!</p>
                    <p style={{fontSize: '0.85rem', marginTop: '5px', color: 'var(--omni-text-secondary)', display: 'flex', alignItems: 'center', gap: '500px'}}>
                        🔄 Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
                <div className="eth-welcome-graphics">
                    <div className="eth-pulse-ring"></div>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="eth-stats-grid">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div className={`eth-stat-card ${card.color}`} key={index}>
                            <div className="eth-stat-header">
                                <span className="eth-stat-title">{card.title}</span>
                                <div className="eth-stat-icon-wrapper">
                                    <Icon size={20} className="eth-stat-icon" />
                                </div>
                            </div>
                            <div className="eth-stat-body">
                                <h2>{card.value}</h2>
                            </div>
                        </div>
                    );
                })}
                {additionalCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div className={`eth-stat-card ${card.color}`} key={index}>
                            <div className="eth-stat-header">
                                <span className="eth-stat-title">{card.title}</span>
                                <div className="eth-stat-icon-wrapper">
                                    <Icon size={20} className="eth-stat-icon" />
                                </div>
                            </div>
                            <div className="eth-stat-body">
                                <h2>{card.value}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Unified Chart Container - with Time Period and View Type Selection */}
            <div className="eth-system-status">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                    <h3>📊 Unified Metrics</h3>
                    <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
                        <div>
                            <label style={{marginRight: '6px', fontSize: '0.85rem', color: 'var(--omni-text-secondary)'}}>Statistics Type:</label>
                            <select value={stats.viewType} onChange={(e) => setStats(s => ({...s, viewType: e.target.value}))} style={{padding: '6px 8px', borderRadius: '6px', background: 'var(--omni-bg-base)', color: 'white', border: '1px solid var(--omni-border)', fontSize: '0.85rem'}}>
                                <option value="user">User Activity</option>
                                <option value="battle">Battle Activity</option>
                                <option value="quest">Quest Activity</option>
                                <option value="races">Races</option>
                                <option value="jobs">Classes/Jobs</option>
                            </select>
                        </div>
                        <div>
                            <label style={{marginRight: '6px', fontSize: '0.85rem', color: 'var(--omni-text-secondary)'}}>Time Period:</label>
                            <select value={stats.timePeriod} onChange={(e) => setStats(s => ({...s, timePeriod: e.target.value}))} style={{padding: '6px 8px', borderRadius: '6px', background: 'var(--omni-bg-base)', color: 'white', border: '1px solid var(--omni-border)', fontSize: '0.85rem'}}>
                                <option value="hourly">Per Jam (24h)</option>
                                <option value="daily">Per Hari (30d)</option>
                                <option value="weekly">Per Minggu (12w)</option>
                                <option value="monthly">Per Bulan (12m)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'block', width: '100%', height: 420, marginTop: '20px' }}>
                    {/* User Activity Chart */}
                    {stats.viewType === 'user' && stats.timePeriods && stats.timePeriods[stats.timePeriod] && stats.timePeriods[stats.timePeriod].length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.timePeriods[stats.timePeriod]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="var(--omni-text-secondary)" />
                                <YAxis stroke="var(--omni-text-secondary)" />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--omni-border)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--omni-bg-elevated)', borderColor: 'var(--omni-border)' }} />
                                <Legend wrapperStyle={{ color: 'var(--omni-text-secondary)' }} />
                                <Line type="monotone" dataKey="users" name="Active Users" stroke={COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{r:4}} />
                                <Line type="monotone" dataKey="newUsers" name="New Users" stroke={COLORS.success} strokeWidth={2.5} dot={false} activeDot={{r:4}} />
                                <Line type="monotone" dataKey="totalUsers" name="Total Users" stroke={COLORS.warning} strokeWidth={2.5} dot={false} activeDot={{r:4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* Battle Activity Chart */}
                    {stats.viewType === 'battle' && stats.timePeriods && stats.timePeriods[stats.timePeriod] && stats.timePeriods[stats.timePeriod].length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.timePeriods[stats.timePeriod]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="var(--omni-text-secondary)" />
                                <YAxis stroke="var(--omni-text-secondary)" />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--omni-border)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--omni-bg-elevated)', borderColor: 'var(--omni-border)' }} />
                                <Legend wrapperStyle={{ color: 'var(--omni-text-secondary)' }} />
                                <Bar dataKey="battles" fill={COLORS.danger} name="Battles" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* Quest Activity Chart */}
                    {stats.viewType === 'quest' && stats.timePeriods && stats.timePeriods[stats.timePeriod] && stats.timePeriods[stats.timePeriod].length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.timePeriods[stats.timePeriod]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorQuests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="var(--omni-text-secondary)" />
                                <YAxis stroke="var(--omni-text-secondary)" />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--omni-border)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--omni-bg-elevated)', borderColor: 'var(--omni-border)' }} />
                                <Legend wrapperStyle={{ color: 'var(--omni-text-secondary)' }} />
                                <Area type="monotone" dataKey="quests" stroke={COLORS.warning} fillOpacity={1} fill="url(#colorQuests)" name="Quests" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}

                    {/* Race Distribution */}
                    {stats.viewType === 'races' && stats.distributions && stats.distributions.races && stats.distributions.races.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.distributions.races}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={140}
                                    labelLine={false}
                                    label={renderRaceLabel}
                                >
                                    {stats.distributions.races.map((_, idx) => <Cell key={idx} fill={COLORS.raceColors[idx % COLORS.raceColors.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--omni-bg-elevated)', borderColor: 'var(--omni-border)' }} formatter={(value) => formatNumber(value)} />
                                <Legend formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {/* Job Distribution - Pie diagram only */}
                    {stats.viewType === 'jobs' && stats.distributions && stats.distributions.jobs && stats.distributions.jobs.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.distributions.jobs}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={160}
                                    labelLine={false}
                                    label={({ name, percent }) => (percent >= 0.03 ? `${name} ${(percent*100).toFixed(0)}%` : '')}
                                >
                                    {stats.distributions.jobs.map((_, idx) => (
                                        <Cell key={`cell-job-pie-${idx}`} fill={COLORS.jobColors[idx % COLORS.jobColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--omni-bg-elevated)', borderColor: 'var(--omni-border)' }} formatter={(value) => formatNumber(value)} />
                                <Legend formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {/* Loading/Empty fallback */}
                    {((!stats.timePeriods || !stats.timePeriods[stats.timePeriod] || stats.timePeriods[stats.timePeriod].length === 0) && (stats.viewType === 'user' || stats.viewType === 'battle' || stats.viewType === 'quest')) || 
                     ((!stats.distributions || !stats.distributions[stats.viewType === 'races' ? 'races' : 'jobs'] || stats.distributions[stats.viewType === 'races' ? 'races' : 'jobs'].length === 0) && (stats.viewType === 'races' || stats.viewType === 'jobs')) && (
                        <p style={{color: 'var(--omni-text-secondary)', textAlign: 'center', paddingTop: '120px'}}>Loading chart data...</p>
                    )}
                </div>
                <h3 style={{ marginTop: '16px', marginBottom: '5px' }}>System Status</h3>
                <div className="eth-status-box">
                    <div className="eth-status-item">
                        <Activity size={18} />
                        <span>Core Engine</span>
                        <div className="eth-status-badge ok">Online</div>
                    </div>
                    <div className="eth-status-item">
                        <Users size={18} />
                        <span>Authentication</span>
                        <div className="eth-status-badge ok">Online</div>
                    </div>
                    <div className="eth-status-item">
                        <TrendingUp size={18} />
                        <span>Real-time Updates</span>
                        <div className="eth-status-badge ok">Active (1s)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
