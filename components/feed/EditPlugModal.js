'use client';

import { useState, useEffect } from 'react';
import { updatePlug } from '@/app/actions/plugs';
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
    setCategories(getCategoriesByPillar(pillar));
  }, [pillar]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
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

    const form = e.target;
    
    const updateData = {
      title: form.title.value,
      description: form.description.value,
      pillar: form.pillar.value,
      category: form.category.value,
      address: form.address.value,
    };

    const result = await updatePlug(plug.id, updateData);

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
    <div className="modal-overlay" onClick={onClose}>
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
                      <option key={key} value={key}>{p.icon} {p.label}</option>
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

              <button type="submit" className="btn btn-primary btn-full mt-lg" disabled={isLoading}>
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
