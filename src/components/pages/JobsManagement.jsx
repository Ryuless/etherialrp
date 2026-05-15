import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Plus, Save, X } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import '../styles/Pages.css';

export default function JobsManagement() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addingItem, setAddingItem] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/jobs`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (response.ok) {
                setJobs(await response.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createJobDefaults = () => ({ id: '', description: '' });

    const handleAddClick = () => {
        setAddFormData(createJobDefaults());
        setAddingItem(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData({ description: item.description || '' });
    };

    const handleSaveAdd = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/jobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addFormData)
            });
            if (!response.ok) throw new Error('Failed to create');
            setAddingItem(false);
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Failed to create job');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/jobs/${editingItem.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });
            if (!response.ok) throw new Error('Failed to save');
            setEditingItem(null);
            fetchJobs();
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
                        <BookOpen size={24} color="#ec4899" />
                        <h2 style={{margin: 0, fontSize: '1.25rem'}}>Classes / Jobs</h2>
                    </div>
                    <button type="button" onClick={handleAddClick} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(236, 72, 153, 0.35)', background: 'rgba(236, 72, 153, 0.08)', color: '#f9a8d4', cursor: 'pointer', fontWeight: 600}}>
                        <Plus size={16} /> Add Jobs
                    </button>
                </div>
                {loading ? <div className="omni-loading"><Loader2 className="animate-spin" /></div> : (
                    <table className="omni-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Description / Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length > 0 ? jobs.map((job, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight: 'bold', color: '#ec4899'}}>{job.id}</td>
                                    <td>{job.description || '(No description)'}</td>
                                    <td><button className="omni-pill" style={{cursor:'pointer', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)'}} onClick={() => handleEditClick(job)}>Edit</button></td>
                                </tr>
                            )) : <tr><td colSpan="3" className="omni-table-empty">No jobs found</td></tr>}
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
                                <h3 style={{margin: 0}}>Add Job</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-grid">
                                <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                    <label>ID</label>
                                    <input className="omni-input" value={addFormData.id || ''} onChange={(e) => setAddFormData({...addFormData, id: e.target.value})} />
                                </div>
                                <div className="omni-form-row" style={{gridColumn: 'span 2'}}>
                                    <label>Description</label>
                                    <textarea 
                                        rows="3"
                                        className="omni-input"
                                        value={addFormData.description || ''} 
                                        onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                                        style={{resize: 'vertical'}}
                                    />
                                </div>
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
                                <h3 style={{margin: 0}}>Edit Job/Class: {editingItem.id}</h3>
                                <button onClick={requestClose} style={{background: 'transparent', border: 'none', color: 'var(--omni-text-secondary)', cursor: 'pointer'}}><X size={20}/></button>
                            </div>
                            
                            <div className="omni-form-row">
                                <label>Role Description</label>
                                <textarea 
                                    rows="3"
                                    className="omni-input"
                                    value={editFormData.description} 
                                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
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