'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, MessageSquare, Handshake } from 'lucide-react';

export default function ProfileActions({ profile, isOwner, profileId, user }) {
  const getShareText = () => {
    return isOwner 
      ? `Guys, I just set up my official shop on iPlug! Book me for your needs here:`
      : `Omo, check out ${profile?.full_name || profile?.username} on iPlug!`;
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.full_name || profile?.username} on iPlug`,
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
      alert('Profile link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `${getShareText()} ${getShareUrl()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isOwner) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
        <button 
          onClick={handleWhatsAppShare}
          className="native-btn-primary"
          style={{ flex: '1', backgroundColor: '#25D366', color: 'white', border: 'none' }}
        >
          <Handshake size={16} className="inline-icon" /> Share Hustle to WhatsApp
        </button>
        <button 
          onClick={handleShare}
          className="native-btn-outline"
          style={{ flex: '1', border: '1px solid var(--border)' }}
        >
          More Sharing Options
        </button>
      </div>
    );
  }

  return (
    <>
      {profile?.phone_number && (
        <a 
          href={`tel:${profile.phone_number}`}
          className="native-btn-outline"
          style={{ flex: '1 1 auto', minWidth: '100px', textDecoration: 'none' }}
        >
          <Phone size={16} className="inline-icon" /> Call
        </a>
      )}
      <Link 
        href={`/messages/${profileId}`}
        className="native-btn-primary"
        style={{ flex: '1 1 auto', minWidth: '100px', textDecoration: 'none' }}
      >
        <MessageSquare size={16} className="inline-icon" /> Message
      </Link>
      <button 
        onClick={handleWhatsAppShare}
        className="native-btn-outline"
        style={{ flex: '1 1 auto', minWidth: '150px', border: '1px solid #25D366', color: '#25D366', backgroundColor: 'transparent' }}
      >
        <Handshake size={16} className="inline-icon" /> Share to WhatsApp
      </button>
    </>
  );
}
