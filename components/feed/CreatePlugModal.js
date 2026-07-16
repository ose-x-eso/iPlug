'use client';

import { useState, useEffect } from 'react';
import { createPlug } from '@/app/actions/plugs';
import { PILLARS, getCategoriesByPillar } from '@/utils/categories';

export default function CreatePlugModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [pillar, setPillar] = useState('services');
  const [categories, setCategories] = useState([]);
  const [address, setAddress] = useState('');
  
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
      setPillar('services');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    
    // If a custom icon was provided, override the radio button icon
    const customIcon = formData.get('custom_icon');
    if (customIcon && customIcon.trim() !== '') {
      formData.set('icon', customIcon.trim());
    }

    const result = await createPlug(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      setSuccessMsg('Your Plug has been successfully listed!');
      // Wait a moment before closing so they see the success message
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap's free reverse geocoding API with zoom=18 for street-level detail
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            // If OSM has the road, it will be the very first part of display_name
            // We take the first 3 parts to give the most granular details available
            // e.g. "14 Peter Odili Road, Trans Amadi, Port Harcourt"
            // or "Rumuomasi, Obio/Akpor, Rivers State" if the road isn't mapped
            if (data.display_name) {
              const segments = data.display_name.split(',').map(s => s.trim());
              // Take the 3 most specific segments
              setAddress(segments.slice(0, 3).join(', '));
            } else {
              setAddress(data.address.city_district || "Port Harcourt");
            }
          } else {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Error fetching address:", err);
          setAddress("Current Location");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setErrorMsg('Unable to retrieve exact location. Check permissions.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Common Emojis for the icon picker
  const COMMON_EMOJIS = ["⚡", "🔧", "✂️", "🍔", "👗", "💻", "📸", "🧹", "🛍️", "🏢"];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>List Your Plug</h2>
          <p>Add your service, shop, or place to the marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
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
                <input type="text" name="title" required placeholder="e.g. Ose Web Developer" autoComplete="off" className="input-field" />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  required 
                  placeholder="What do you offer? Keep it brief but descriptive."
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

              <div className="modal-grid-2" style={{ gap: '1rem' }}>
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
                    list="categories-list" 
                    name="category" 
                    required 
                    placeholder="Type or select..." 
                    style={selectStyle} 
                  />
                  <datalist id="categories-list">
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.label} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Address / Area</label>
                  <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--brand-primary)', 
                      fontSize: 'var(--fs-xs)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                    </svg>
                    {isLocating ? 'Locating...' : 'Use my GPS'}
                  </button>
                </div>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  placeholder="e.g. GRA Phase 2, Port Harcourt" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="off"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Portfolio / Website Link (Optional)</label>
                <input 
                  type="url" 
                  name="portfolio_url" 
                  placeholder="https://your-portfolio.com" 
                  autoComplete="off"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Choose an Icon (Emoji)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {COMMON_EMOJIS.map(emoji => (
                    <label key={emoji} className="emoji-picker-label">
                      <input type="radio" name="icon" value={emoji} defaultChecked={emoji === "⚡"} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                    </label>
                  ))}
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Or type your own:</span>
                    <input 
                      type="text" 
                      name="custom_icon" 
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
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select an icon that best represents your plug, or paste your own emoji.</p>
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-lg" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Plug'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
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
