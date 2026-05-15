import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Plus, X, Save } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function SkillsManagement() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/skills`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setSkills(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const skillFields = [
        { key: 'id', label: 'Document ID', type: 'text', fullWidth: true },
        { key: 'name', label: 'name', type: 'text' },
        { key: 'type', label: 'type', type: 'text' },
        { key: 'element', label: 'element', type: 'text' },
        { key: 'description', label: 'description', type: 'text', fullWidth: true },
        { key: 'damage', label: 'damage', type: 'number' },
        { key: 'matk', label: 'matk', type: 'number' },
        { key: 'range', label: 'range', type: 'number' },
        { key: 'areaRadius', label: 'areaRadius', type: 'number' },
        { key: 'mpCost', label: 'mpCost', type: 'number' },
        { key: 'castTime', label: 'castTime', type: 'number' },
        { key: 'cooldown', label: 'cooldown (seconds)', type: 'number', seconds: true },
        { key: 'requiredLevel', label: 'requiredLevel', type: 'number' },
        { key: 'skillPoints', label: 'skillPoints', type: 'number' }
    ];

    const createSkillDefaults = () => skillFields.reduce((acc, field) => {
        acc[field.key] = field.key === 'id' ? '' : (field.type === 'number' ? 0 : '');
        return acc;
    }, {});

    const handleAddClick = () => {
        setAddFormData(createSkillDefaults());
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
            const payload = {
                ...addFormData,
                cooldown: Number(addFormData.cooldown || 0) * 1000
            };
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/skills`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create');

            setAddingItem(false);
            fetchSkills();
        } catch (err) {
            console.error(err);
            alert('Failed to create skill');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/skills/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            
            if (!response.ok) throw new Error('Failed to save');
            
            setEditingItem(null);
            fetchSkills();
        } catch (err) {
            console.error(err);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="omni-data-container" style={{overflowX: 'auto'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Sparkles size={24} color="#8b5cf6" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Grimoire of Skills</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.35)', background: 'rgba(139, 92, 246, 0.08)', color: '#ddd6fe', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Skills
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Param (DMG/MATK)</th>
                                <th>Range/Rad</th>
                                <th>Cost (MP/CD)</th>
                                <th>Req Lvl</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skills.length > 0 ? skills.map((skill, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold', color: '#8b5cf6'}}>{skill.name}</td>
                                    <td><span className="omni-pill">{skill.type || '-'} | {skill.element || 'neutral'}</span></td>
                                    <td>
                                        DMG: <span style={{color:'#ef4444'}}>{skill.damage || 0}</span> | 
                                        MATK: <span style={{color:'#8b5cf6'}}>{skill.matk || 0}</span>
                                    </td>
                                    <td>{skill.range || 0}m / {skill.areaRadius ? skill.areaRadius+'m AoE' : 'Single'}</td>
                                    <td>MP: {skill.mpCost || 0} | CD: {((skill.cooldown || 0) / 1000).toFixed(2)}s</td>
                                    <td><span className="omni-pill">{skill.requiredLevel || 1}</span> ({skill.skillPoints || 0} SP)</td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(skill)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="7" className="omni-table-empty">No skills found.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {addingItem && (
                <AnimatedModal onClose={() => setAddingItem(false)} maxWidth="700px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Add Skill</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                {skillFields.map((field) => (
                                    <div key={field.key} className="omni-form-row" style={{gridColumn: field.fullWidth ? 'span 2' : 'span 1'}}>
                                        <label>{field.label}</label>
                                        <input 
                                            type={field.key === 'cooldown' ? 'number' : field.type}
                                            className="omni-input"
                                            value={field.key === 'cooldown' ? ((addFormData[field.key] || 0) / 1000) : (addFormData[field.key] || '')}
                                            onChange={(e) => setAddFormData({
                                                ...addFormData,
                                                [field.key]: field.key === 'cooldown'
                                                    ? Number(e.target.value) * 1000
                                                    : (field.type === 'number' ? Number(e.target.value) : e.target.value)
                                            })}
                                            step={field.key === 'cooldown' ? '0.1' : undefined}
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
                <AnimatedModal onClose={() => setEditingItem(null)} maxWidth="700px">
                    {(requestClose) => (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>Edit Skill: {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                {['name', 'type', 'element', 'description'].map(field => (
                                    <div key={field} className="omni-form-row" style={{gridColumn: field === 'description' ? 'span 2' : 'span 1'}}>
                                        <label>{field}</label>
                                        <input 
                                            type="text" 
                                            className="omni-input"
                                            value={editFormData[field] || ''} 
                                            onChange={(e) => setEditFormData({...editFormData, [field]: e.target.value})}
                                        />
                                    </div>
                                ))}
                                {['damage', 'matk', 'range', 'areaRadius', 'mpCost', 'castTime', 'requiredLevel', 'skillPoints'].map(field => (
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
                                <div className="omni-form-row">
                                    <label>cooldown (seconds)</label>
                                    <input 
                                        type="number" 
                                        className="omni-input"
                                        value={(editFormData.cooldown || 0) / 1000} 
                                        onChange={(e) => setEditFormData({...editFormData, cooldown: Number(e.target.value) * 1000})}
                                        step="0.1"
                                    />
                                </div>
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
