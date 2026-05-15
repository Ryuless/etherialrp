import { useState, useEffect } from 'react';
import { Users, Search, Loader2, X, Save } from 'lucide-react';
import '../styles/Pages.css';

export default function UsersManagement() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/players`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setPlayers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData(item);
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/characters/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            
            if (!response.ok) throw new Error('Failed to save');
            
            setEditingItem(null);
            fetchPlayers();
        } catch (err) {
            console.error(err);
            alert('Failed to save user changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Users size={24} color="var(--omni-accent)" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Player Database</h2>
                    </div>
                    <div style={{position: 'relative'}}>
                        <Search size={18} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--omni-text-secondary)'}} />
                        <input 
                            type="text" 
                            placeholder="Search players..." 
                            style={{
                                padding: '8px 12px 8px 36px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--omni-border)', 
                                background: 'transparent',
                                color: 'var(--omni-text-primary)'
                            }} 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="omni-loading"><Loader2 className="animate-spin" /></div>
                ) : error ? (
                    <div className="omni-table-empty">Error: {error}</div>
                ) : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Lv / Exp</th>
                                <th>Race / Job</th>
                                <th>HP / SP</th>
                                <th>Main Stats</th>
                                <th>Gold</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.length > 0 ? players.map(p => (
                                <tr key={p.id}>
                                    <td><span style={{fontFamily: 'monospace', color: 'var(--omni-text-secondary)'}}>{p.id.substring(0,8)}...</span></td>
                                    <td style={{fontWeight: 'bold'}}>{p.name || 'Unnamed Character'}</td>
                                    <td><span className="omni-pill">Lv {p.level || 1}</span> / {(p.experience ?? 0)} XP</td>
                                    <td>{p.race || '-'} / {p.job || '-'}</td>
                                    <td>{p.currentHP ?? 0}/{p.maxHP ?? 0} | {p.currentSP ?? 0}/{p.maxSP ?? 0}</td>
                                    <td style={{fontFamily: 'monospace'}}>STR {p.mainStats?.STR ?? 0} | AGI {p.mainStats?.AGI ?? 0} | VIT {p.mainStats?.VIT ?? 0} | INT {p.mainStats?.INT ?? 0} | DEX {p.mainStats?.DEX ?? 0} | LUK {p.mainStats?.LUK ?? 0}</td>
                                    <td><span style={{color: '#f59e0b', fontWeight: 'bold'}}>{p.gold || 0} G</span></td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(p)}>Edit</button></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="omni-table-empty">No players found in database</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="omni-modal-backdrop" onClick={() => setEditingItem(null)}>
                    <div className="omni-modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                            <h3 style={{margin: 0}}>Edit Player: {editingItem.name}</h3>
                            <button onClick={() => setEditingItem(null)} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div className="omni-section-title">General</div>
                            <div className="omni-form-grid">
                                <div className="omni-form-row">
                                    <label>Name</label>
                                    <input className="omni-input" value={editFormData.name || ''} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Level</label>
                                    <input type="number" className="omni-input" value={editFormData.level || 1} onChange={(e)=>setEditFormData({...editFormData, level: Number(e.target.value)})} />
                                </div>

                                <div className="omni-form-row">
                                    <label>Experience</label>
                                    <input type="number" className="omni-input" value={editFormData.experience || 0} onChange={(e)=>setEditFormData({...editFormData, experience: Number(e.target.value)})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Next Level Exp</label>
                                    <input type="number" className="omni-input" value={editFormData.nextLevelExp || 0} onChange={(e)=>setEditFormData({...editFormData, nextLevelExp: Number(e.target.value)})} />
                                </div>

                                <div className="omni-form-row">
                                    <label>Race</label>
                                    <input className="omni-input" value={editFormData.race || ''} onChange={(e)=>setEditFormData({...editFormData, race: e.target.value})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Job</label>
                                    <input className="omni-input" value={editFormData.job || ''} onChange={(e)=>setEditFormData({...editFormData, job: e.target.value})} />
                                </div>

                                <div className="omni-form-row">
                                    <label>Gold</label>
                                    <input type="number" className="omni-input" value={editFormData.gold || 0} onChange={(e)=>setEditFormData({...editFormData, gold: Number(e.target.value)})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Stat Points</label>
                                    <input type="number" className="omni-input" value={editFormData.statPoints || 0} onChange={(e)=>setEditFormData({...editFormData, statPoints: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div className="omni-section-title">Vitals</div>
                            <div className="omni-form-grid">
                                <div className="omni-form-row">
                                    <label>Current HP</label>
                                    <input type="number" className="omni-input" value={editFormData.currentHP || 0} onChange={(e)=>setEditFormData({...editFormData, currentHP: Number(e.target.value)})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Max HP</label>
                                    <input type="number" className="omni-input" value={editFormData.maxHP || 0} onChange={(e)=>setEditFormData({...editFormData, maxHP: Number(e.target.value)})} />
                                </div>

                                <div className="omni-form-row">
                                    <label>Current MP</label>
                                    <input type="number" className="omni-input" value={editFormData.currentMP || editFormData.currentSP || 0} onChange={(e)=>setEditFormData({...editFormData, currentMP: Number(e.target.value)})} />
                                </div>
                                <div className="omni-form-row">
                                    <label>Max MP</label>
                                    <input type="number" className="omni-input" value={editFormData.maxMP || editFormData.maxSP || 0} onChange={(e)=>setEditFormData({...editFormData, maxMP: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div className="omni-section-title">Main Stats</div>
                            <div className="omni-form-grid">
                                {['STR','AGI','VIT','INT','DEX','LUK'].map(key => (
                                    <div className="omni-form-row" key={key}>
                                        <label>{key}</label>
                                        <input type="number" className="omni-input" value={editFormData.mainStats?.[key] ?? 0} onChange={(e)=>setEditFormData({...editFormData, mainStats: {...(editFormData.mainStats||{}), [key]: Number(e.target.value)}})} />
                                    </div>
                                ))}
                            </div>

                            <div className="omni-section-title">Derived Stats</div>
                            <div className="omni-form-grid">
                                {['ATK','DEF','HIT','FLEE','CRITICAL','MATK','MDEF','ASPD'].map(key => (
                                    <div className="omni-form-row" key={key}>
                                        <label>{key}</label>
                                        <input type="number" className="omni-input" value={editFormData.subStats?.[key] ?? 0} onChange={(e)=>setEditFormData({...editFormData, subStats: {...(editFormData.subStats||{}), [key]: Number(e.target.value)}})} />
                                    </div>
                                ))}
                            </div>

                            <div style={{display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '6px', alignItems: 'center'}}>
                                <div style={{color: 'var(--omni-text-secondary)', fontSize: '0.85rem'}}>
                                    <div>Created: {editingItem.createdAt ? (editingItem.createdAt.seconds ? new Date(editingItem.createdAt.seconds*1000).toLocaleString() : new Date(editingItem.createdAt).toLocaleString()) : '-'}</div>
                                    <div>Last Active: {editingItem.lastActive ? (editingItem.lastActive.seconds ? new Date(editingItem.lastActive.seconds*1000).toLocaleString() : new Date(editingItem.lastActive).toLocaleString()) : '-'}</div>
                                </div>
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button className="omni-input" style={{background:'transparent', border:'1px solid var(--omni-border)', cursor:'pointer'}} onClick={()=>setEditingItem(null)}>Cancel</button>
                                    <button style={{background:'#3b82f6', border:'none', color:'white', padding:'8px 14px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', gap:8}} onClick={handleSaveEdit} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} /> } Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
