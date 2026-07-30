'use client';

import { useState } from 'react';
import { toggleSkillRequest } from '@/app/actions/profile';
import { Target, X, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BroadcastModal({ isOpen, onClose, initialDesc = '', onSuccess }) {
  const [desc, setDesc] = useState(initialDesc);
  const [customLocation, setCustomLocation] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!desc.trim()) return;
    setBroadcastStatus('Finding location...');
    
    let lat = null;
    let lng = null;
    
    if (customLocation.trim() !== '') {
      // Use Nominatim OpenStreetMap for Geocoding
      try {
        const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customLocation.trim())}`);
        const data = await geocodeRes.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        } else {
          alert("We couldn't find that exact location. Please try being more specific (e.g., 'Yaba, Lagos').");
          setBroadcastStatus('');
          return;
        }
      } catch (err) {
        alert("There was an error searching for that location. Please try again or use your current location.");
        setBroadcastStatus('');
        return;
      }
    } else {
      // Use device GPS
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (err) {
          console.warn("Could not get location for beacon:", err);
        }
      }
      
      if (!lat || !lng) {
        alert("We need your location to place your beacon on the map. Please enable location services or type a specific location.");
        setBroadcastStatus('');
        return;
      }
    }

    setBroadcastStatus('Activating beacon...');
    const res = await toggleSkillRequest({ isActive: true, description: desc, lat, lng });
    setBroadcastStatus('');
    
    if (res?.error) {
      alert(res.error);
      return;
    }
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
    }
    
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="anim-scale" style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>
          <Target size={24} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-heading)' }}>Activate Beacon</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Describe exactly what you need. This will be visible to everyone who sees your profile or pin.</p>
        
        <textarea
          placeholder="e.g., I need an experienced Plumber around Yaba immediately..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            minHeight: '100px',
            resize: 'none',
            marginBottom: '1rem'
          }}
        />

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Location (leave blank for current GPS)"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={!!broadcastStatus || !desc.trim()}
          className="btn-broadcast"
          style={{ margin: 0, width: '100%', maxWidth: '100%' }}
        >
          {broadcastStatus || 'Broadcast Need'}
        </button>
      </div>
    </div>
  );
}
