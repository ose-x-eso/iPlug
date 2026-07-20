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

  const handleToggleGhostMode = () => {
    const newVal = !ghostMode;
    setGhostMode(newVal);
    localStorage.setItem('iplug_ghost_mode', newVal);
  };

  const handleToggleCivic = () => {
    const newVal = !civicVerified;
    if (newVal) {
      alert("Civic Verification requires submission of official documentation. Verification portal coming soon! Enabling demo mode.");
    }
    setCivicVerified(newVal);
    localStorage.setItem('iplug_civic_verified', newVal);
  };

  if (!isLoaded) return null;

  return (
    <>
      <h2 className="native-section-title">Privacy & Demo</h2>
      <div className="native-card">
        
        <div className="native-row" onClick={handleToggleGhostMode} style={{ cursor: 'pointer' }}>
          <div className="native-row-content" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="native-row-text">
              <span className="native-row-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ghost size={18} /> Ghost Mode
              </span>
              <span className="native-input-label" style={{ marginTop: '0.25rem' }}>Hide your location from the map.</span>
            </div>
            
            <button 
              type="button"
              style={{
                width: '50px',
                height: '30px',
                borderRadius: '999px',
                backgroundColor: ghostMode ? '#34C759' : '#39393D',
                position: 'relative',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: ghostMode ? '22px' : '2px',
                width: '26px',
                height: '26px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>

        <div className="native-row" onClick={handleToggleCivic} style={{ cursor: 'pointer' }}>
          <div className="native-row-content" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="native-row-text">
              <span className="native-row-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#21B3A6" /> Civic Verification
              </span>
              <span className="native-input-label" style={{ marginTop: '0.25rem' }}>Show you are verified.</span>
            </div>
            
            <button 
              type="button"
              style={{
                width: '50px',
                height: '30px',
                borderRadius: '999px',
                backgroundColor: civicVerified ? '#34C759' : '#39393D',
                position: 'relative',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: civicVerified ? '22px' : '2px',
                width: '26px',
                height: '26px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2 className="native-section-title">Developer Demo</h2>
        <div className="native-card" style={{ padding: '1rem', display: 'block' }}>
          <p className="native-input-label" style={{ marginBottom: '1rem' }}>
            Simulate a demo match or interaction (Dev only).
          </p>
          <div className="native-buttons-stack">
            <button 
              onClick={() => alert('Demo Match simulated')} 
              className="native-btn-outline"
            >
              Simulate Match
            </button>
            <button 
              onClick={() => alert('Demo Message simulated')} 
              className="native-btn-outline"
            >
              Simulate Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
