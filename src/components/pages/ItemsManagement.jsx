import { useState, useEffect } from 'react';
import { Crown, Loader2, Plus, X, Save } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function ItemsManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const orderedArmoryFields = [
        'name', 'type', 'rarity', 'description', 'price', 'weight', 'maxStack', 'slot',
        'atk', 'matk', 'hit', 'crit', 'aspd',
        'def', 'mdef', 'flee',
        'hpHeal', 'spHeal'
    ];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createItemDefaults = () => {
        return orderedArmoryFields.reduce((acc, field) => {
            acc[field] = field === 'description' ? '' : 0;
            if (['name', 'type', 'rarity', 'slot', 'description'].includes(field)) {
                acc[field] = '';
            }
            return acc;
        }, { id: '' });
    };

    const handleAddClick = () => {
        setAddFormData(createItemDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        const formData = { ...item };
        orderedArmoryFields.forEach(field => {
            if (!(field in formData)) {
                formData[field] = typeof item[field] === 'number' ? 0 : '';
            }
        });
        setEditFormData(formData);
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addFormData)
            });

            if (!response.ok) throw new Error('Failed to create');

            setAddingItem(false);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to create item');
        } finally {
            setSaving(false);
        }
    };

    const extraFields = Object.keys(editFormData || {})
        .filter((key) => key !== 'id' && !orderedArmoryFields.includes(key));

    const allEditableFields = [...orderedArmoryFields, ...extraFields]
        .filter((key, index, arr) => arr.indexOf(key) === index);

    const handleDynamicFieldChange = (field, value) => {
        const current = editFormData?.[field];

        if (typeof current === 'number' || typeof value === 'number') {
            setEditFormData({ ...editFormData, [field]: value === '' ? 0 : Number(value) });
            return;
        }

        if (Array.isArray(current) || (current && typeof current === 'object')) {
            try {
                const parsed = value ? JSON.parse(value) : Array.isArray(current) ? [] : {};
                setEditFormData({ ...editFormData, [field]: parsed });
            } catch {
                setEditFormData({ ...editFormData, [field]: value });
            }
            return;
        }

        setEditFormData({ ...editFormData, [field]: value });
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/items/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            
            if (!response.ok) throw new Error('Failed to save');
            
            // Refresh
            setEditingItem(null);
            fetchItems();
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
                        <Crown size={24} color="#f59e0b" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Treasury & Armory items</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'rgba(245, 158, 11, 0.08)', color: '#fcd34d', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Items
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Rarity</th>
                                <th>Offensive</th>
                                <th>Defensive</th>
                                <th>Recovery</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((itm, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold', color: '#f59e0b'}}>{itm.name}</td>
                                    <td>{itm.type || 'unknown'}</td>
                                    <td><span className="omni-pill">{itm.rarity || 'common'}</span></td>
                                    <td>ATK {itm.atk ?? 0} | MATK {itm.matk ?? 0} | HIT {itm.hit ?? 0}</td>
                                    <td>DEF {itm.def ?? 0} | MDEF {itm.mdef ?? 0} | FLEE {itm.flee ?? 0}</td>
                                    <td>HP +{itm.hpHeal ?? 0} | SP +{itm.spHeal ?? 0}</td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(itm)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="7" className="omni-table-empty">No items found</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {addingItem && (
                <AnimatedModal onClose={() => setAddingItem(false)} maxWidth="780px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Add Item</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>

                            <div className="omni-form-grid">
                                <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                    <label style={{textTransform: 'capitalize'}}>id</label>
                                    <input
                                        type="text"
                                        className="omni-input"
                                        value={addFormData.id || ''}
                                        onChange={(e) => setAddFormData({...addFormData, id: e.target.value})}
                                    />
                                </div>
                                {orderedArmoryFields.map((field) => {
                                    const value = addFormData?.[field];
                                    const isComplex = Array.isArray(value) || (value && typeof value === 'object');
                                    return (
                                        <div key={field} className="omni-form-row" style={{ gridColumn: field === 'description' ? 'span 2' : 'span 1' }}>
                                            <label style={{textTransform: 'capitalize'}}>{field}</label>
                                            {isComplex ? (
                                                <textarea
                                                    rows={3}
                                                    className="omni-input"
                                                    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                                                    onChange={(e) => setAddFormData({...addFormData, [field]: e.target.value})}
                                                />
                                            ) : (
                                                <input
                                                    type={typeof value === 'number' ? 'number' : 'text'}
                                                    className="omni-input"
                                                    value={value === null || value === undefined ? '' : value}
                                                    onChange={(e) => setAddFormData({...addFormData, [field]: typeof value === 'number' ? Number(e.target.value) : e.target.value})}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={requestClose}>Cancel</button>
                                <button style={{padding: '8px 16px', background: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveAdd} disabled={saving}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Add
                                </button>
                            </div>
                        </>
                    )}
                </AnimatedModal>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <AnimatedModal onClose={() => setEditingItem(null)} maxWidth="780px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Edit {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>

                            <div className="omni-form-grid">
                                {allEditableFields.map((field) => {
                                    const value = editFormData?.[field];
                                    const isComplex = Array.isArray(value) || (value && typeof value === 'object');
                                    return (
                                        <div key={field} className="omni-form-row" style={{ gridColumn: field === 'description' ? 'span 2' : 'span 1' }}>
                                            <label style={{textTransform: 'capitalize'}}>{field}</label>
                                            {isComplex ? (
                                                <textarea
                                                    rows={3}
                                                    className="omni-input"
                                                    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                                                    onChange={(e) => handleDynamicFieldChange(field, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    type={typeof value === 'number' ? 'number' : 'text'}
                                                    className="omni-input"
                                                    value={value === null || value === undefined ? '' : value}
                                                    onChange={(e) => handleDynamicFieldChange(field, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={requestClose}>Cancel</button>
                                <button style={{padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveEdit} disabled={saving}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>
                        </>
                    )}
                </AnimatedModal>
            )}
        </div>
    );
}
