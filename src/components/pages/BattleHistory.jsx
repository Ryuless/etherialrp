import { useEffect, useState } from 'react';
import { Package, Loader2, Plus, Save, X } from 'lucide-react';
import '../styles/Pages.css';

export default function BattleHistory() {
    const [kits, setKits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStarterKits();
    }, []);

    const fetchStarterKits = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/starter-kits`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch starter kits');
            const data = await response.json();
            setKits(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createStarterKitDefaults = () => ({ id: '', startingGold: 0, itemsText: '' });

    const handleAddClick = () => {
        setAddFormData(createStarterKitDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData({
            ...item,
            itemsText: Array.isArray(item.items)
                ? item.items.map((it) => `${it.itemId}:${it.quantity}`).join(', ')
                : ''
        });
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const parsedItems = (addFormData.itemsText || '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean)
                .map((entry) => {
                    const [itemId, qtyRaw] = entry.split(':');
                    const quantity = Number(qtyRaw || '1');
                    return {
                        itemId: (itemId || '').trim(),
                        quantity: Number.isFinite(quantity) ? quantity : 1
                    };
                })
                .filter((x) => x.itemId);

            const payload = {
                id: addFormData.id || '',
                job: addFormData.id || '',
                startingGold: Number(addFormData.startingGold || 0),
                items: parsedItems
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/starterKits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create');
            setAddingItem(false);
            fetchStarterKits();
        } catch (err) {
            console.error(err);
            alert('Failed to create starter kit');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const parsedItems = (editFormData.itemsText || '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean)
                .map((entry) => {
                    const [itemId, qtyRaw] = entry.split(':');
                    const quantity = Number(qtyRaw || '1');
                    return {
                        itemId: (itemId || '').trim(),
                        quantity: Number.isFinite(quantity) ? quantity : 1
                    };
                })
                .filter((x) => x.itemId);

            const payload = {
                job: editingItem.id,
                startingGold: Number(editFormData.startingGold || 0),
                items: parsedItems
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/starterKits/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save');
            setEditingItem(null);
            fetchStarterKits();
        } catch (err) {
            console.error(err);
            alert('Failed to save starter kit changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="omni-data-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Package size={24} color="#f97316" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Starter Kits by Job</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(249, 115, 22, 0.35)', background: 'rgba(249, 115, 22, 0.08)', color: '#fed7aa', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Starter Kit
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Starting Gold</th>
                                <th>Starter Items</th>
                                <th>Total Items</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kits.length > 0 ? kits.map((k, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold'}}>{k.id}</td>
                                    <td>{k.startingGold ?? 0} G</td>
                                    <td style={{maxWidth: '300px', whiteSpace: 'normal'}}>{Array.isArray(k.items) ? k.items.map((it) => `${it.itemId} x${it.quantity}`).join(', ') : '-'}</td>
                                    <td><span className="omni-pill">{Array.isArray(k.items) ? k.items.length : 0}</span></td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(k)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="5" className="omni-table-empty">No starter kits found</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {addingItem && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{background: 'var(--omni-bg-elevated)', border: '1px solid var(--omni-border)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0}}>Add Starter Kit</h3>
                            <button onClick={() => setAddingItem(false)} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.875rem', color: 'var(--omni-text-secondary)'}}>Job ID</label>
                                <input
                                    type="text"
                                    value={addFormData.id || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, id: e.target.value, job: e.target.value })}
                                    style={{width: '100%', padding: '10px', background: 'var(--omni-bg-base)', border: '1px solid var(--omni-border)', borderRadius: '6px', color: 'white'}}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.875rem', color: 'var(--omni-text-secondary)'}}>Starting Gold</label>
                                <input
                                    type="number"
                                    value={addFormData.startingGold ?? 0}
                                    onChange={(e) => setAddFormData({ ...addFormData, startingGold: Number(e.target.value) })}
                                    style={{width: '100%', padding: '10px', background: 'var(--omni-bg-base)', border: '1px solid var(--omni-border)', borderRadius: '6px', color: 'white'}}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.875rem', color: 'var(--omni-text-secondary)'}}>Items (format: itemId:qty, itemId:qty)</label>
                                <textarea
                                    rows="4"
                                    value={addFormData.itemsText || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, itemsText: e.target.value })}
                                    style={{width: '100%', padding: '10px', background: 'var(--omni-bg-base)', border: '1px solid var(--omni-border)', borderRadius: '6px', color: 'white', resize: 'vertical'}}
                                />
                            </div>
                        </div>

                        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={() => setAddingItem(false)}>Cancel</button>
                            <button style={{padding: '8px 16px', background: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveAdd} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingItem && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{background: 'var(--omni-bg-elevated)', border: '1px solid var(--omni-border)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0}}>Edit Starter Kit: {editingItem.id}</h3>
                            <button onClick={() => setEditingItem(null)} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.875rem', color: 'var(--omni-text-secondary)'}}>Starting Gold</label>
                                <input
                                    type="number"
                                    value={editFormData.startingGold ?? 0}
                                    onChange={(e) => setEditFormData({ ...editFormData, startingGold: Number(e.target.value) })}
                                    style={{width: '100%', padding: '10px', background: 'var(--omni-bg-base)', border: '1px solid var(--omni-border)', borderRadius: '6px', color: 'white'}}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.875rem', color: 'var(--omni-text-secondary)'}}>Items (format: itemId:qty, itemId:qty)</label>
                                <textarea
                                    rows="4"
                                    value={editFormData.itemsText || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, itemsText: e.target.value })}
                                    style={{width: '100%', padding: '10px', background: 'var(--omni-bg-base)', border: '1px solid var(--omni-border)', borderRadius: '6px', color: 'white', resize: 'vertical'}}
                                />
                            </div>
                        </div>

                        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--omni-border)', color: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={() => setEditingItem(null)}>Cancel</button>
                            <button style={{padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={handleSaveEdit} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
