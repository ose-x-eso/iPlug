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

  if (isOwner) {
    return (
      <div style={{ display: 'flex', width: '100%', marginTop: '0.5rem' }}>
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
          <Handshake size={20} /> Share Hustle
        </button>
      </div>
    );
  }

  return (
    <>
      {profile?.phone_number && profile?.phone_visible !== false && (
        <a 
          href={`tel:${profile.phone_number}`}
          className="btn"
          style={{ 
            flex: '1 1 auto', 
            minWidth: '100px', 
            textDecoration: 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            padding: '1rem', 
            fontWeight: 'bold', 
            fontSize: '1.05rem',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Phone size={18} className="inline-icon" style={{ color: 'var(--accent)' }} /> Call
        </a>
      )}
      <Link 
        href={`/messages/${profileId}`}
        className="btn"
        style={{ 
          flex: '1 1 auto', 
          minWidth: '100px', 
          textDecoration: 'none',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          padding: '1rem', 
          fontWeight: 'bold', 
          fontSize: '1.05rem',
          background: 'linear-gradient(135deg, var(--accent-flat), #6e27ff)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 20px rgba(var(--accent-rgb), 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        <MessageSquare size={18} className="inline-icon" /> Message
      </Link>
      <button 
        onClick={handleShare}
        className="btn"
        style={{ 
          flex: '1 1 100%',
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
          marginTop: '0.5rem',
          transition: 'all 0.2s ease'
        }}
      >
        <Handshake size={20} /> Share Profile
      </button>
    </>
  );
}
