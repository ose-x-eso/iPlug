'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { useToast } from '@/components/ui/ToastProvider';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function SettingsForm({ initialProfile }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service Worker registered');
          // If they already granted permission and it's enabled in DB
          if (Notification.permission === 'granted' && initialProfile?.push_notifications_enabled) {
            setPushStatus('Push Enabled ✓');
          }
        })
        .catch(err => console.error('SW registration failed', err));
    }
  }, [initialProfile?.push_notifications_enabled]);

  async function handleEnablePush() {
    if (!isPushSupported) return;
    try {
      setPushStatus('Requesting permission...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus('Permission denied');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      setPushStatus('Generating connection...');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setPushStatus('VAPID public key missing. Check .env.local');
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      setPushStatus('Saving connection...');
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      
      if (res.ok) {
        toast.success('Push enabled successfully!');
        setPushStatus('Push enabled successfully!');
      } else {
        toast.error('Failed to save connection');
        setPushStatus('Failed to save connection');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error enabling push');
      setPushStatus('Error enabling push');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.target);
    const result = await updateProfile(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      toast.error(result.error);
    } else if (result?.success) {
      toast.success('Profile updated successfully!');
    }
    
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }} autoComplete="off">
      {errorMsg && <div className="native-error-text">{errorMsg}</div>}

      <div className="native-input-group">
        <label className="native-input-label">Full Name (Private)</label>
        <input 
          type="text" 
          name="full_name" 
          defaultValue={initialProfile?.full_name || ''} 
          required 
          placeholder="Ose Web Developer" 
          className="native-input"
        />
      </div>

      <div className="native-input-group">
        <label className="native-input-label">Username (Public)</label>
        <input 
          type="text" 
          name="username" 
          defaultValue={initialProfile?.username || ''} 
          required 
          placeholder="ose_dev" 
          pattern="^[a-zA-Z0-9_]{3,15}$" 
          title="3-15 characters, letters, numbers, and underscores only"
          className="native-input"
        />
      </div>

      <div className="native-input-group">
        <label className="native-input-label">Phone Number</label>
        <input 
          type="tel" 
          name="phone_number" 
          defaultValue={initialProfile?.phone_number || ''} 
          placeholder="+234..." 
          className="native-input"
        />
      <style>{`
        #phone_visible:checked + .toggle-slider {
          background-color: var(--accent) !important;
        }
        #phone_visible:checked + .toggle-slider > span {
          transform: translateX(20px) !important;
        }
      `}</style>
      <div 
        className="native-input-group" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '1.25rem',
          marginTop: '-0.5rem', 
          marginBottom: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>Allow direct calls</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Let customers call your line directly from your profile.</span>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input 
            type="checkbox" 
            name="phone_visible" 
            id="phone_visible"
            defaultChecked={initialProfile?.phone_visible ?? false}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span 
            className="toggle-slider"
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: initialProfile?.phone_visible ? 'var(--accent)' : 'var(--bg-input)',
              border: '1px solid var(--border)',
              transition: '.4s',
              borderRadius: '24px'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: '2px',
                bottom: '2px',
                backgroundColor: 'white',
                transition: '.4s',
                borderRadius: '50%',
                transform: initialProfile?.phone_visible ? 'translateX(20px)' : 'translateX(0)'
              }}
            />
          </span>
        </label>
      </div>

      <div className="native-input-group">
        <label className="native-input-label">Email Address</label>
        <input 
          type="email" 
          defaultValue={initialProfile?.email || ''} 
          disabled 
          className="native-input"
        />
      </div>

      <div className="native-buttons-stack">
        <button type="submit" className="native-btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        
        {isPushSupported && (
          <button 
            type="button" 
            onClick={handleEnablePush}
            disabled={pushStatus.includes('✓') || pushStatus.includes('Requesting') || pushStatus.includes('Generating')}
            className="native-btn-outline"
            style={{ opacity: pushStatus.includes('✓') ? 0.6 : 1 }}
          >
            {pushStatus || 'Enable Push Notifications'}
          </button>
        )}
      </div>
    </form>
  );
}
