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
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed', err));
    }
  }, []);

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
      setPushStatus('Generating subscription...');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setPushStatus('VAPID public key missing. Check .env.local');
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      setPushStatus('Saving subscription...');
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      
      if (res.ok) {
        toast.success('Push enabled successfully!');
        setPushStatus('Push enabled successfully!');
      } else {
        toast.error('Failed to save subscription');
        setPushStatus('Failed to save subscription');
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
    <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
      {errorMsg && <div className="auth-error">{errorMsg}</div>}

      <div className="input-group">
        <label>Full Name (Private)</label>
        <input 
          type="text" 
          name="full_name" 
          defaultValue={initialProfile?.full_name || ''} 
          required 
          placeholder="Ose Web Developer" 
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Only used for billing and account recovery.
        </p>
      </div>

      <div className="input-group">
        <label>Username (Public)</label>
        <input 
          type="text" 
          name="username" 
          defaultValue={initialProfile?.username || ''} 
          required 
          placeholder="ose_dev" 
          pattern="^[a-zA-Z0-9_]{3,15}$" 
          title="3-15 characters, letters, numbers, and underscores only"
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          This is how you will appear to others on the platform.
        </p>
      </div>

      <div className="input-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          name="phone_number" 
          defaultValue={initialProfile?.phone_number || ''} 
          placeholder="+234..." 
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Used for customers to contact you directly if you list a plug.
        </p>
      </div>

      <div className="input-group">
        <label>Email Address</label>
        <input 
          type="email" 
          defaultValue={initialProfile?.email || ''} 
          disabled 
          style={{ opacity: 0.7, cursor: 'not-allowed' }}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Email address cannot be changed currently.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button type="submit" className="btn btn-primary mt-lg" disabled={isLoading} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        
        {isPushSupported && (
          <button 
            type="button" 
            onClick={handleEnablePush}
            className="btn btn-outline mt-lg"
            style={{ width: 'auto', padding: '0.75rem 2rem', border: '1px solid var(--border)' }}
          >
            {pushStatus || 'Enable Push Notifications'}
          </button>
        )}
      </div>
    </form>
  );
}
