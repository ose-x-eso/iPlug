'use client';

import { useState, useEffect } from 'react';
import { updatePlug, deletePlug } from '@/app/actions/plugs';
import { PILLARS, getCategoriesByPillar } from '@/utils/categories';

export default function EditPlugModal({ isOpen, onClose, plug }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [locations, setLocations] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
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
        setLocations([]);
      }, 0);
    } else {
      setTimeout(() => {
        setPillar(plug?.pillar || 'services');
        if (plug?.locations && plug.locations.length > 0) {
          setLocations(plug.locations);
        } else {
          setLocations([{ address: plug?.address || '', latitude: plug?.latitude || null, longitude: plug?.longitude || null }]);
        }
      }, 0);
    }
  }, [isOpen, plug]);

  if (!isOpen || !plug) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);

    // Pass the multi-location array
    formData.set('locations', JSON.stringify(locations));
    if (locations.length > 0) {
      formData.set('address', locations[0].address);
    }

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

  function handleGetLocation(index) {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          let addr = '';
          if (data && data.address) {
            if (data.display_name) {
              const segments = data.display_name.split(',').map(s => s.trim());
              addr = segments.slice(0, 3).join(', ');
            } else {
              addr = data.address.city_district || "Unknown Area";
            }
          } else {
            addr = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          }
          
          const newLocs = [...locations];
          newLocs[index] = { address: addr, latitude, longitude };
          setLocations(newLocs);
        } catch (err) {
          console.error("Error fetching address:", err);
          const newLocs = [...locations];
          newLocs[index] = { ...newLocs[index], address: "Current Location" };
          setLocations(newLocs);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setErrorMsg('Unable to retrieve exact location. Check permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const handleAddLocation = () => {
    setLocations([...locations, { address: '', latitude: null, longitude: null }]);
  };

  const handleRemoveLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

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
                      <option key={cat.id} value={cat.label} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label>Addresses / Locations</label>
                  <button 
                    type="button" 
                    onClick={handleAddLocation}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: 'var(--fs-xs)', cursor: 'pointer' }}
                  >
                    + Add Another Location
                  </button>
                </div>
                
                {locations.map((loc, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. GRA Phase 2, Port Harcourt" 
                        value={loc.address || ''}
                        onChange={(e) => {
                          const newLocs = [...locations];
                          newLocs[index].address = e.target.value;
                          setLocations(newLocs);
                        }}
                        autoComplete="off"
                        className="input-field"
                        style={{ paddingRight: '80px', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleGetLocation(index)} 
                        disabled={isLocating}
                        style={{ 
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: 'var(--fs-xs)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                        GPS
                      </button>
                    </div>
                    {locations.length > 1 && (
                      <button type="button" onClick={() => handleRemoveLocation(index)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
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
