'use client';

import { Share2 } from 'lucide-react';

export default function PlugShareActions({ plugTitle, isOwner }) {
  const getShareText = () => {
    return isOwner 
      ? `Hey, check out my new plug on iPlug: ${plugTitle}`
      : `Check out this plug I found on iPlug: ${plugTitle}`;
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  const handleShare = async () => {
    const shareData = {
      title: `${plugTitle} on iPlug`,
      text: getShareText(),
      url: getShareUrl()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(getShareUrl());
      alert('Plug link copied to clipboard!');
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', marginTop: '1rem' }}>
      <button 
        onClick={handleShare}
        className="btn"
        style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          padding: '1rem', 
          fontWeight: 'bold', 
          fontSize: '1.05rem',
          background: 'linear-gradient(135deg, #111111, #2a2a2a)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          cursor: 'pointer',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease'
        }}
      >
        <Share2 size={20} /> {isOwner ? 'Share Hustle' : 'Share Profile'}
      </button>
    </div>
  );
}
