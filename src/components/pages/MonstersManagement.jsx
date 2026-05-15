import { useState, useEffect } from 'react';
import { Swords, Loader2, Plus, X, Save } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function MonstersManagement() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const monsterFields = [
        { key: 'id', label: 'Document ID', type: 'text', fullWidth: true },
        { key: 'name', label: 'Name', type: 'text', fullWidth: true },
        { key: 'level', label: 'Level', type: 'number' },
        { key: 'rarity', label: 'Rarity', type: 'text' },
        { key: 'element', label: 'Element', type: 'text' },
        { key: 'hp', label: 'HP', type: 'number' },
        { key: 'maxHP', label: 'Max HP', type: 'number' },
        { key: 'mp', label: 'MP', type: 'number' },
        { key: 'maxMP', label: 'Max MP', type: 'number' },
        { key: 'atk', label: 'ATK', type: 'number' },
        { key: 'matk', label: 'MATK', type: 'number' },
        { key: 'def', label: 'DEF', type: 'number' },
        { key: 'mdef', label: 'MDEF', type: 'number' },
        { key: 'hit', label: 'HIT', type: 'number' },
        { key: 'flee', label: 'FLEE', type: 'number' },
        { key: 'exp', label: 'EXP', type: 'number' },
        { key: 'gold', label: 'Gold', type: 'number' }
    ];

    const monsterEditFields = monsterFields.filter((field) => field.key !== 'id');

    useEffect(() => {
        fetchMonsters();
    }, []);

    const fetchMonsters = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monsters`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setMonsters(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createMonsterDefaults = () => {
        return monsterFields.reduce((acc, field) => {
            acc[field.key] = field.type === 'number' ? 0 : '';
            return acc;
        }, {});
    };

    const handleAddClick = () => {
        setAddFormData(createMonsterDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        const formData = { ...item };

        monsterEditFields.forEach(({ key, type }) => {
            if (!(key in formData) || formData[key] === undefined || formData[key] === null) {
                formData[key] = type === 'number' ? 0 : '';
            }
        });

        setEditFormData(formData);
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monsters`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addFormData)
            });

            if (!response.ok) throw new Error('Failed to create');

            setAddingItem(false);
            fetchMonsters();
        } catch (err) {
            console.error(err);
            alert('Failed to create monster');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monsters/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            
            if (!response.ok) throw new Error('Failed to save');
            
            setEditingItem(null);
            fetchMonsters();
        } catch (err) {
            console.error(err);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Swords size={24} color="#ef4444" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Bestiary Register</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.08)', color: '#fecaca', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Monster
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Level / Rarity</th>
                                <th>HP / MP</th>
                                <th>ATK / MATK</th>
                                <th>DEF / MDEF</th>
                                <th>HIT / FLEE</th>
                                <th>EXP / Gold</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monsters.length > 0 ? monsters.map((m, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold', color: '#ef4444'}}>{m.name}</td>
                                    <td><span className="omni-pill">Lv {m.level ?? 1}</span> / {m.rarity || 'common'}</td>
                                    <td>{m.hp ?? m.maxHP ?? 0} / {m.mp ?? m.maxMP ?? 0}</td>
                                    <td>{m.atk ?? 0} / {m.matk ?? 0}</td>
                                    <td>{m.def ?? 0} / {m.mdef ?? 0}</td>
                                    <td>{m.hit ?? 0} / {m.flee ?? 0}</td>
                                    <td>{m.exp ?? m.expReward ?? 0} XP / {m.gold ?? 0} G</td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(m)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="8" className="omni-table-empty">No monsters in database</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {addingItem && (
                <AnimatedModal onClose={() => setAddingItem(false)} maxWidth="650px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Add Monster</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>

                            <div className="omni-form-grid">
                                {monsterFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="omni-form-row"
                                        style={{ gridColumn: field.fullWidth ? 'span 2' : 'span 1' }}
                                    >
                                        <label>{field.label}</label>
                                        <input
                                            type={field.type}
                                            className="omni-input"
                                            value={addFormData[field.key] ?? ''}
                                            onChange={(e) => setAddFormData({
                                                ...addFormData,
                                                [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={requestClose}>Cancel</button>
                                <button style={{padding: '8px 16px', background: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveAdd} disabled={saving}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
                                </button>
                            </div>
                        </>
                    )}
                </AnimatedModal>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <AnimatedModal onClose={() => setEditingItem(null)} maxWidth="600px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Edit {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                {monsterEditFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="omni-form-row"
                                        style={{ gridColumn: field.fullWidth ? 'span 2' : 'span 1' }}
                                    >
                                        <label>{field.label}</label>
                                        <input
                                            type={field.type}
                                            className="omni-input"
                                            value={editFormData[field.key] ?? ''}
                                            onChange={(e) => setEditFormData({
                                                ...editFormData,
                                                [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={requestClose}>Cancel</button>
                                <button style={{padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveEdit} disabled={saving}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                                </button>
                            </div>
                        </>
                    )}
                </AnimatedModal>
            )}
        </div>
    );
}
