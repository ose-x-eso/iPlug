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

  const handleWhatsAppShare = () => {
    const text = `${getShareText()} ${getShareUrl()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
      <button 
        onClick={handleWhatsAppShare}
        className="btn"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem', fontWeight: 'bold', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: 'var(--radius-md)' }}
      >
        <Share2 size={18} /> WhatsApp
      </button>
      <button 
        onClick={handleShare}
        className="btn btn-secondary"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem', fontWeight: 'bold', borderRadius: 'var(--radius-md)' }}
      >
        <Share2 size={18} /> Share Options
      </button>
    </div>
  );
}
