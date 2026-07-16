'use client';

import Link from 'next/link';
import { useState } from 'react';

import { createRecommendation } from '@/app/actions/recommendations';

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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
          {profile?.phone_number && (
            <a 
              href={`tel:${profile.phone_number}`}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', textDecoration: 'none',
                fontWeight: '500', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease'
              }}
            >
              📞 Call
            </a>
          )}
          <Link 
            href={`/messages/${profileId}`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            💬 Message
          </Link>
          <button 
            onClick={handleShare}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            🤝 Recommend & Share
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
        <Link 
          href="/settings"
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          ⚙️ Settings
        </Link>
      </div>

    </>
  );
}
