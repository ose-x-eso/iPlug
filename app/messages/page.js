'use client';

import Link from 'next/link';
import { Send } from 'lucide-react';

export default function MessagesIndex() {
  return (
    <div className="messages-empty-state">
      <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
        <div style={{ 
          width: '96px', 
          height: '96px', 
          border: '2px solid var(--text-primary)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1rem auto' 
        }}>
          <svg aria-label="Direct" fill="currentColor" height="48" role="img" viewBox="0 0 24 24" width="48">
            <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
            <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Your messages</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>Send a message to start a chat.</p>
        <Link href="/search" className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={16} /> Find someone to message
        </Link>
      </div>
    </div>
  );
}
