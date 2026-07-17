'use client';

import { useState, useEffect } from 'react';
import { updatePlug, deletePlug } from '@/app/actions/plugs';
import { PILLARS, getCategoriesByPillar } from '@/utils/categories';

export default function EditPlugModal({ isOpen, onClose, plug }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state initialized with plug data
  const [pillar, setPillar] = useState(plug?.pillar || 'services');
  const [categories, setCategories] = useState([]);
  
  // Update categories when pillar changes
  useEffect(() => {
    setTimeout(() => setCategories(getCategoriesByPillar(pillar)), 0);
  }, [pillar]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoading(false);
      }, 0);
    } else {
      setPillar(plug?.pillar || 'services');
    }
  }, [isOpen, plug]);

  if (!isOpen || !plug) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);

    const result = await updatePlug(plug.id, formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      setSuccessMsg('Your Plug has been successfully updated!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this Plug? This cannot be undone.')) return;
    
    setIsLoading(true);
    setErrorMsg('');
    
    const result = await deletePlug(plug.id);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else {
      setSuccessMsg('Plug deleted successfully.');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }

  const selectStyle = {
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    cursor: 'pointer'
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>Edit Your Plug</h2>
          <p>Update your service details or location.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <>
              <div className="input-group">
                <label>Business / Service Name</label>
                <input type="text" name="title" required defaultValue={plug.title} />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  required 
                  defaultValue={plug.description}
                  rows="3"
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Pillar</label>
                  <select 
                    name="pillar" 
                    value={pillar} 
                    onChange={(e) => setPillar(e.target.value)}
                    style={selectStyle}
                  >
                    {Object.entries(PILLARS).map(([key, p]) => (
                      <option key={key} value={key}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Category</label>
                  <input 
                    list="edit-categories-list" 
                    name="category" 
                    required 
                    defaultValue={plug.category}
                    placeholder="Type or select..." 
                    style={selectStyle} 
                  />
                  <datalist id="edit-categories-list">
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.label} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="input-group">
                <label>Address / Area</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  defaultValue={plug.address}
                />
              </div>

              <div className="input-group">
                <label>Cover Image (Optional)</label>
                {plug.image_url && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <img src={plug.image_url} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
                <input 
                  type="file" 
                  name="image_file" 
                  accept="image/*"
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leave blank to keep your current image.</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleDelete} className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }} disabled={isLoading}>
                  Delete Plug
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
