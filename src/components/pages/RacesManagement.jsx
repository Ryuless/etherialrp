import { useState, useEffect } from 'react';
import { Dna, Loader2, Plus, Save, X } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function RacesManagement() {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRaces();
    }, []);

    const fetchRaces = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/races`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (response.ok) {
                setRaces(await response.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createRaceDefaults = () => statFields.reduce((acc, field) => {
        acc[field] = 0;
        return acc;
    }, { id: '' });

    const handleAddClick = () => {
        setAddFormData(createRaceDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData(item);
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/races`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addFormData)
            });
            if (!response.ok) throw new Error('Failed to create');
            setAddingItem(false);
            fetchRaces();
        } catch (err) {
            console.error(err);
            alert('Failed to create race');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/races/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            if (!response.ok) throw new Error('Failed to save');
            setEditingItem(null);
            fetchRaces();
        } catch (err) {
            console.error(err);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const statFields = ['baseHP', 'baseSP', 'STR', 'AGI', 'VIT', 'INT', 'DEX', 'LUK'];

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Dna size={24} color="#10b981" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Races Baseline</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'rgba(16, 185, 129, 0.08)', color: '#a7f3d0', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Races
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Race Name</th>
                                <th>Base HP | SP</th>
                                <th>Primary Attributes (STR/AGI/VIT/INT/DEX/LUK)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {races.length > 0 ? races.map((race, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold', color: '#10b981'}}>{race.id}</td>
                                    <td>
                                        <span style={{color: '#ef4444', fontWeight: 'bold'}}>{race.baseHP || 0}</span> HP |{' '}
                                        <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{race.baseSP || 0}</span> SP
                                    </td>
                                    <td style={{fontFamily: 'monospace'}}>
                                        {race.STR || 0} / {race.AGI || 0} / {race.VIT || 0} / {race.INT || 0} / {race.DEX || 0} / {race.LUK || 0}
                                    </td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(race)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="4" className="omni-table-empty">No races</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {addingItem && (
                <AnimatedModal onClose={() => setAddingItem(false)} maxWidth="600px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Add Race</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                    <label>id</label>
                                    <input 
                                        type="text" 
                                        className="omni-input"
                                        value={addFormData.id || ''} 
                                        onChange={(e) => setAddFormData({...addFormData, id: e.target.value})}
                                    />
                                </div>
                                {statFields.map(field => (
                                    <div key={field} className="omni-form-row">
                                        <label>{field}</label>
                                        <input 
                                            type="number" 
                                            className="omni-input"
                                            value={addFormData[field] || 0} 
                                            onChange={(e) => setAddFormData({...addFormData, [field]: Number(e.target.value)})}
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
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
                                <h3 style={{margin: 0}}>Edit Race: {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                {statFields.map(field => (
                                    <div key={field} className="omni-form-row">
                                        <label>{field}</label>
                                        <input 
                                            type="number" 
                                            className="omni-input"
                                            value={editFormData[field] || 0} 
                                            onChange={(e) => setEditFormData({...editFormData, [field]: Number(e.target.value)})}
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
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