'use client';

import { useState } from 'react';
import { Smartphone, Monitor, CheckCircle2, ChevronRight, Apple } from 'lucide-react';
import Logo from '../layout/Logo';

export default function DownloadAppModal({ isOpen, onClose, onContinueWeb }) {
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const handleStoreClick = (storeName) => {
    setToast(`Coming soon to the ${storeName}!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size={48} showText={false} />
          </div>
          <h2>Get iPlug</h2>
          <p>Choose how you want to access the marketplace.</p>
        </div>

        {toast && (
          <div style={{ 
            background: 'var(--accent-subtle)', 
            color: 'var(--accent-text)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {toast}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn" 
            style={{ 
              background: '#000', 
              color: '#fff', 
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              fontSize: '1.05rem'
            }}
            onClick={() => handleStoreClick('App Store')}
          >
            <Apple size={24} /> Download on App Store
          </button>

          <button 
            className="btn" 
            style={{ 
              background: '#000', 
              color: '#fff', 
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              fontSize: '1.05rem'
            }}
            onClick={() => handleStoreClick('Google Play')}
          >
            <Smartphone size={24} /> Get it on Google Play
          </button>

          <div style={{ margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Or
          </div>

          <button 
            className="btn btn-primary" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              fontSize: '1.05rem'
            }}
            onClick={() => {
              onClose();
              onContinueWeb();
            }}
          >
            <Monitor size={20} /> Continue on Web
          </button>
        </div>
      </div>
    </div>
  );
}
