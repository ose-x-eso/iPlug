'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return; // Already installed, do nothing
    }

    // 2. Check cooldown (7 days)
    const dismissedAt = localStorage.getItem('iplug_install_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Still in cooldown
      }
    }

    // 3. Detect iOS Safari (Apple doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      // Wait a few seconds before showing to not overwhelm on first load
      setTimeout(() => setShowPrompt(true), 3000);
      return;
    }

    // 4. Android / Chrome - wait for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent default mini-infobar
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again until it's fired again
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('iplug_install_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', // Above mobile bottom nav
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      
      <button 
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'var(--bg-input)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          cursor: 'pointer'
        }}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/iplug_logo.png" 
          alt="iPlug" 
          style={{ width: '48px', height: '48px', borderRadius: '12px' }} 
        />
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Install iPlug App</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Find plugs faster. Access offline.
          </p>
        </div>
      </div>

      {isIOS ? (
        <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
          To install: Tap the <strong>Share</strong> icon at the bottom of Safari, then scroll down and tap <strong>Add to Home Screen</strong>.
        </div>
      ) : (
        <button 
          onClick={handleInstallClick}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          <Download size={18} />
          Install App Now
        </button>
      )}
    </div>
  );
}
