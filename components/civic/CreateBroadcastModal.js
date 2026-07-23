'use client';

import { useState, useEffect } from 'react';
import { createCivicBroadcast } from '@/app/actions/civic';
import { useToast } from '@/components/ui/ToastProvider';
import { ShieldAlert } from 'lucide-react';

export default function CreateBroadcastModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [location, setLocation] = useState({ address: '', latitude: null, longitude: null });
  const [type, setType] = useState('alert');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setErrorMsg('');
        setIsLoading(false);
        setType('alert');
        setLocation({ address: '', latitude: null, longitude: null });
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!location.latitude || !location.longitude) {
      setErrorMsg('Please tap GPS to set the exact broadcast location.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    formData.set('latitude', location.latitude);
    formData.set('longitude', location.longitude);

    const result = await createCivicBroadcast(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      toast.error(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      toast.success('Civic Broadcast sent successfully!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
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
          
          setLocation({ address: addr, latitude, longitude });
        } catch (err) {
          console.error("Error fetching address:", err);
          setLocation({ address: "Current Location", latitude: position.coords.latitude, longitude: position.coords.longitude });
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
      <div className="modal-content" style={{ maxWidth: '600px', border: '1px solid #ef4444' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
            <ShieldAlert size={24} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#ef4444' }}>Civic Broadcast</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Send a high-priority alert to the community.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <div className="modal-grid-2" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>Broadcast Type</label>
              <select 
                name="type" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={selectStyle}
              >
                <option value="alert">🚨 Safety Alert</option>
                <option value="closure">🚧 Road Closure / Infrastructure</option>
                <option value="news">📰 Community News</option>
              </select>
            </div>

            <div className="input-group">
              <label>Target Radius (km)</label>
              <select 
                name="radius_km" 
                defaultValue="5"
                style={selectStyle}
              >
                <option value="1">1 km (Immediate Neighborhood)</option>
                <option value="3">3 km (Local District)</option>
                <option value="5">5 km (City Zone)</option>
                <option value="10">10 km (Wide Metro Area)</option>
                <option value="25">25 km (Entire City)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Title</label>
            <input type="text" name="title" required placeholder="e.g. Aba Road Closure due to Flooding" autoComplete="off" className="input-field" />
          </div>

          <div className="input-group">
            <label>Detailed Message</label>
            <textarea 
              name="description" 
              required 
              placeholder="Provide exact details so residents know what to do..."
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

          <div className="input-group">
            <label>Location (Required)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                required 
                placeholder="Tap GPS to set coordinate anchor" 
                value={location.address}
                readOnly
                className="input-field"
                style={{ paddingRight: '80px', background: 'var(--bg-card)' }}
              />
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating}
                style={{ 
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#ef4444', fontSize: 'var(--fs-xs)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                {isLocating ? '...' : 'GPS'}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Duration (Expires automatically)</label>
            <select 
              name="expiration_hours" 
              defaultValue="24"
              style={selectStyle}
            >
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="168">1 Week</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', background: '#ef4444', color: 'white', marginTop: '1rem', border: 'none' }}>
            {isLoading ? 'Broadcasting...' : 'Broadcast to Radios'}
          </button>
        </form>
      </div>
    </div>
  );
}
