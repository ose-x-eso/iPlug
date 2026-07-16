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
    
    const customIcon = form.custom_icon?.value;
    const finalIcon = (customIcon && customIcon.trim() !== '') ? customIcon.trim() : form.icon?.value;

    const updateData = {
      title: form.title.value,
      description: form.description.value,
      pillar: form.pillar.value,
      category: form.category.value,
      address: form.address.value,
      ...(finalIcon && { image_url: finalIcon })
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

  // Common Emojis for the icon picker
  const COMMON_EMOJIS = ["⚡", "🔧", "✂️", "🍔", "👗", "💻", "📸", "🧹", "🛍️", "🏢"];

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

              <div className="input-group">
                <label>Choose an Icon (Emoji)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {COMMON_EMOJIS.map(emoji => (
                    <label key={emoji} className="emoji-picker-label">
                      <input type="radio" name="icon" value={emoji} defaultChecked={plug.image_url === emoji || (!COMMON_EMOJIS.includes(plug.image_url) && emoji === "⚡")} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                    </label>
                  ))}
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Or type your own:</span>
                    <input 
                      type="text" 
                      name="custom_icon" 
                      defaultValue={plug.image_url && !COMMON_EMOJIS.includes(plug.image_url) ? plug.image_url : ''}
                      placeholder="e.g. 🐶" 
                      maxLength={5}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--border)', 
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        width: '80px',
                        textAlign: 'center',
                        fontSize: '1.2rem'
                      }} 
                    />
                  </div>
                </div>
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
