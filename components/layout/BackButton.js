'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Back' }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      style={{ 
        color: 'var(--text-primary)', 
        fontWeight: '500', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        background: 'var(--bg-card)', 
        padding: '0.5rem 1rem', 
        borderRadius: '20px', 
        border: '1px solid var(--border)',
        cursor: 'pointer',
        fontSize: '1rem'
      }}
    >
      <span>←</span> {label}
    </button>
  );
}
