'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Back' }) {
  const router = useRouter();

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0.75rem 1rem',
      background: 'rgba(18, 18, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    }}>
      <button 
        onClick={() => router.back()} 
        style={{ 
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)', 
          fontWeight: '600', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          fontSize: '1.1rem',
          padding: 0
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        {label}
      </button>
    </div>
  );
}
