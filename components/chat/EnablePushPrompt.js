'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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

export default function EnablePushPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkPushStatus() {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        setIsPushSupported(true);
        
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          const subscription = await registration.pushManager.getSubscription();
          
          const dismissedAt = localStorage.getItem('iplug_push_prompt_dismissed');
          const isDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt)) < (1000 * 60 * 60 * 24 * 7); // 7 day cooldown
          
          if (!subscription && !isDismissed && Notification.permission !== 'denied') {
            setShowPrompt(true);
          }
        } catch (err) {
          console.error('Error checking push status:', err);
        }
      }
    }
    
    checkPushStatus();
  }, []);

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setShowPrompt(false);
        setIsSubscribing(false);
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        toast.error('Push notifications are not configured properly.');
        setIsSubscribing(false);
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      
      if (res.ok) {
        toast.success('Push enabled! You will now be notified of new messages.');
        setShowPrompt(false);
      } else {
        toast.error('Failed to save push settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error enabling push notifications');
    }
    setIsSubscribing(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('iplug_push_prompt_dismissed', Date.now().toString());
  };

  if (!isPushSupported || !showPrompt) return null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      margin: '0 1.5rem 1rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#3b82f6' }} />
      
      <button 
        onClick={handleDismiss}
        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        <X size={16} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '50%', color: '#3b82f6' }}>
          <Bell size={18} />
        </div>
        <div style={{ paddingRight: '20px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Never miss a message
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Enable push notifications to know instantly when a plug replies to your message.
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleEnablePush}
        disabled={isSubscribing}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          padding: '8px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: isSubscribing ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => !isSubscribing && (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
        onMouseOut={(e) => !isSubscribing && (e.currentTarget.style.background = 'var(--bg-input)')}
      >
        {isSubscribing ? 'Enabling...' : 'Turn on notifications'}
      </button>
    </div>
  );
}
