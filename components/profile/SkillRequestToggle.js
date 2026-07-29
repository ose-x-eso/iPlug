'use client';

import { useState } from 'react';
import { toggleSkillRequest } from '@/app/actions/profile';
import { AlertCircle, Target, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SkillRequestToggle({ isRequesting, currentDesc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState(currentDesc || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleToggle = async (active) => {
    if (active) {
      setIsOpen(true);
    } else {
      setIsSubmitting(true);
      const res = await toggleSkillRequest({ isActive: false });
      setIsSubmitting(false);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setDesc('');
      router.refresh();
    }
  };

  const handleSave = async () => {
    if (!desc.trim()) return;
    setIsSubmitting(true);
    
    // Get location
    let lat = null;
    let lng = null;
    
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
    
    const res = await toggleSkillRequest({ isActive: true, description: desc, lat, lng });
    setIsSubmitting(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: isRequesting ? 'var(--danger-subtle)' : 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: isRequesting ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
        <Target size={18} color={isRequesting ? 'var(--danger)' : 'var(--text-muted)'} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: isRequesting ? 'var(--danger)' : 'var(--text-heading)' }}>Skill Request (Distress Beacon)</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isRequesting ? 'Your beacon is actively pulsing on the map.' : 'Turn this on if you urgently need a service.'}</p>
        </div>
        <button 
          onClick={() => handleToggle(!isRequesting)}
          style={{ 
            padding: '0.5rem 1rem', 
            background: isRequesting ? 'var(--bg-surface)' : 'var(--accent-flat)', 
            color: isRequesting ? 'var(--danger)' : 'white', 
            border: isRequesting ? '1px solid var(--danger)' : 'none', 
            borderRadius: 'var(--radius-full)', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          {isRequesting ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      {isOpen && (
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
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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
                marginBottom: '1.5rem'
              }}
            />

            <button 
              onClick={handleSave}
              disabled={isSubmitting || !desc.trim()}
              className="btn-primary btn-full"
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger)' }}
            >
              {isSubmitting ? 'Activating...' : 'Broadcast Need'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
