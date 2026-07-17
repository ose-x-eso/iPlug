'use client';

import { useState } from 'react';
import EditPlugModal from '@/components/feed/EditPlugModal';
import { Pencil } from 'lucide-react';

export default function PlugDetailActions({ plug }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsEditOpen(true)}
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-full)' }}
      >
        <Pencil size={16} className="inline-icon" /> Edit Plug
      </button>

      <EditPlugModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        plug={plug} 
      />
    </>
  );
}
