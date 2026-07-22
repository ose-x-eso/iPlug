'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, MessageSquare, Handshake } from 'lucide-react';

export default function ProfileActions({ profile, isOwner, profileId, user }) {
  const handleShare = async () => {
    const url = new URL(window.location.href);
    if (user?.id) {
      url.searchParams.set('ref', user.id);
    }
    const shareData = {
      title: `${profile?.full_name || profile?.username} on iPlug`,
      text: `Check out ${profile?.full_name || profile?.username}'s profile on iPlug!`,
      url: url.toString()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url.toString());
      alert('Profile link copied to clipboard!');
    }
  };

  if (!isOwner) {
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
          onClick={handleShare}
          className="native-btn-outline"
          style={{ flex: '1 1 auto', minWidth: '150px', border: '1px solid #1C1C1E', color: 'white' }}
        >
          <Handshake size={16} className="inline-icon" /> Recommend & Share
        </button>
      </>
    );
  }

  return null;
}
