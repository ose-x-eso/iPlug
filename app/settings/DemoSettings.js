'use client';

import { useState, useEffect } from 'react';
import { Ghost, ShieldCheck } from 'lucide-react';

export default function DemoSettings() {
  const [ghostMode, setGhostMode] = useState(false);
  const [civicVerified, setCivicVerified] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedGhost = localStorage.getItem('iplug_ghost_mode') === 'true';
      const storedCivic = localStorage.getItem('iplug_civic_verified') === 'true';
      setTimeout(() => {
        setGhostMode(storedGhost);
        setCivicVerified(storedCivic);
        setIsLoaded(true);
      }, 0);
    } catch (e) {}
  }, []);

  const handleGhostChange = (e) => {
    const val = e.target.checked;
    setGhostMode(val);
    localStorage.setItem('iplug_ghost_mode', val);
  };

  const handleCivicChange = (e) => {
    const val = e.target.checked;
    if (val) {
      alert("Civic Verification requires submission of official documentation. Verification portal coming soon! Enabling demo mode.");
    }
    setCivicVerified(val);
    localStorage.setItem('iplug_civic_verified', val);
  };

  if (!isLoaded) return null;

  return (
    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Privacy & Demo Settings
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Toggle these MVP features to demonstrate functionality.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Ghost Mode */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Ghost size={24} color="var(--text-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Ghost Mode 
              <label className="switch">
                <input type="checkbox" checked={ghostMode} onChange={handleGhostChange} />
                <span className="slider round"></span>
              </label>
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              When enabled, your exact location will be hidden from the map and real-time chat distance indicators will be masked.
            </p>
          </div>
        </div>

        {/* Civic Verified */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(33, 179, 166, 0.15)', padding: '0.75rem', borderRadius: '50%' }}>
            <ShieldCheck size={24} color="#21B3A6" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Civic Verification (Demo)
              <label className="switch">
                <input type="checkbox" checked={civicVerified} onChange={handleCivicChange} />
                <span className="slider round"></span>
              </label>
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Enable this to simulate being an approved government official or community leader. Unlocks the "Civic Broadcast" pillar when creating a plug.
            </p>
          </div>
        </div>

      </div>

      {/* Switch CSS */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border-strong);
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--success);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px var(--success);
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
