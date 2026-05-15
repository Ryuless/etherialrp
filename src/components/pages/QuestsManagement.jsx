import { useEffect, useState } from 'react';
import { Map, Loader2, Plus, Save, X } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function QuestsManagement() {
    const [maps, setMaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMaps();
    }, []);

    const fetchMaps = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maps`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to fetch maps (${response.status}): ${text || response.statusText}`);
            }
            const data = await response.json();
            setMaps(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch maps');
        } finally {
            setLoading(false);
        }
    };

    const createMapDefaults = () => ({ id: '', region: '', locationsText: '' });

    const handleAddClick = () => {
        setAddFormData(createMapDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData({
            ...item,
            locationsText: Array.isArray(item.locations) ? item.locations.join(', ') : ''
        });
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const payload = {
                id: addFormData.id || '',
                region: addFormData.region || '',
                locations: (addFormData.locationsText || '')
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean)
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maps`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create');

            setAddingItem(false);
            fetchMaps();
        } catch (err) {
            console.error(err);
            alert('Failed to create map');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const payload = {
                region: editFormData.region || '',
                locations: (editFormData.locationsText || '')
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean)
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maps/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save');

            setEditingItem(null);
            fetchMaps();
        } catch (err) {
            console.error(err);
            alert('Failed to save map changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Map size={24} color="#22c55e" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>World Maps & Regions</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.08)', color: '#bbf7d0', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Maps
                    </button>
                </div>

                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : error ? (
                    <div className="omni-table-empty">{error}</div>
                ) : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Map ID</th>
                                <th>Region Name</th>
                                <th>Locations</th>
                                <th>Total Nodes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maps.length > 0 ? maps.map((m, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold'}}>{m.id}</td>
                                    <td>{m.region || '-'}</td>
                                    <td style={{maxWidth: '380px', whiteSpace: 'normal'}}>{Array.isArray(m.locations) ? m.locations.join(', ') : '-'}</td>
                                    <td><span className="omni-pill">{Array.isArray(m.locations) ? m.locations.length : 0}</span></td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(m)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="5" className="omni-table-empty">No maps found</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {addingItem && (
                <AnimatedModal onClose={() => setAddingItem(false)} maxWidth="700px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Add Map</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>

                            <div className="omni-form-row" style={{gridColumn: 'span 2', marginBottom: '12px'}}>
                                <label>ID</label>
                                <input
                                    type="text"
                                    className="omni-input"
                                    value={addFormData.id || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, id: e.target.value })}
                                />
                            </div>
                            <div className="omni-form-row" style={{gridColumn: 'span 2', marginBottom: '12px'}}>
                                <label>Region</label>
                                <input
                                    type="text"
                                    className="omni-input"
                                    value={addFormData.region || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, region: e.target.value })}
                                />
                            </div>
                            <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                <label>Locations (comma-separated)</label>
                                <textarea
                                    rows="4"
                                    className="omni-input"
                                    value={addFormData.locationsText || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, locationsText: e.target.value })}
                                    style={{resize: 'vertical'}}
                                />
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

            {editingItem && (
                <AnimatedModal onClose={() => setEditingItem(null)} maxWidth="700px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Edit Map: {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>

                            <div className="omni-form-row" style={{gridColumn: 'span 2', marginBottom: '12px'}}>
                                <label>Region</label>
                                <input
                                    type="text"
                                    className="omni-input"
                                    value={editFormData.region || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                                />
                            </div>
                            <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                <label>Locations (comma-separated)</label>
                                <textarea
                                    rows="4"
                                    className="omni-input"
                                    value={editFormData.locationsText || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, locationsText: e.target.value })}
                                    style={{resize: 'vertical'}}
                                />
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
