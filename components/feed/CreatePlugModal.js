'use client';

import { useState, useEffect } from 'react';
import { createPlug } from '@/app/actions/plugs';
import { PILLARS, getCategoriesByPillar } from '@/utils/categories';
import { useToast } from '@/components/ui/ToastProvider';

export default function CreatePlugModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [pillar, setPillar] = useState('services');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([{ address: '', latitude: null, longitude: null }]);
  
  // Verification state
  const [isCivicVerified, setIsCivicVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        try {
          setIsCivicVerified(localStorage.getItem('iplug_civic_verified') === 'true');
        } catch (e) {}
      }, 0);
    }
  }, [isOpen]);
  
  // Update categories when pillar changes
  useEffect(() => {
    setTimeout(() => setCategories(getCategoriesByPillar(pillar)), 0);
  }, [pillar]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setErrorMsg('');
        setIsLoading(false);
        setPillar('services');
        setLocations([{ address: '', latitude: null, longitude: null }]);
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.target);
    
    // If a custom icon was provided, override the radio button icon
    const customIcon = formData.get('custom_icon');
    if (customIcon && customIcon.trim() !== '') {
      formData.set('icon', customIcon.trim());
    }

    // Pass the multi-location array
    formData.set('locations', JSON.stringify(locations));
    if (locations.length > 0) {
      formData.set('address', locations[0].address);
    }

    const result = await createPlug(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      toast.error(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      toast.success('Your Plug has been successfully listed!');
      // Wait a moment before closing so they see the success message
      setTimeout(() => {
        onClose();
      }, 2000);
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


  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>{pillar === 'civic' ? 'Post Civic Broadcast' : 'List Your Plug'}</h2>
          <p>{pillar === 'civic' ? 'Send official alerts or announcements to the community.' : 'Add your service, shop, or place to the marketplace.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

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
                    {Object.entries(PILLARS).map(([key, p]) => {
                      if (key === 'civic' && !isCivicVerified) return null;
                      return <option key={key} value={key}>{p.label}</option>;
                    })}
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
                        value={loc.address}
                        onChange={(e) => {
                          const newLocs = [...locations];
                          newLocs[index].address = e.target.value;
                          setLocations(newLocs);
                        }}
                        autoComplete="off"
                        className="input-field"
                        style={{ paddingRight: '80px' }}
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
                <label>Cover Image (Optional)</label>
                <input 
                  type="file" 
                  name="image_file" 
                  accept="image/*"
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                />
              </div>

                  <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}>
                    {isLoading ? 'Processing...' : pillar === 'civic' ? 'Post Broadcast' : 'List Plug'}
                  </button>
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
