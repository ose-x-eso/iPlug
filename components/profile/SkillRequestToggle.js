'use client';

import { useState } from 'react';
import { toggleSkillRequest } from '@/app/actions/profile';
import { Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BroadcastModal from './BroadcastModal';

export default function SkillRequestToggle({ isRequesting, currentDesc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleToggle = async (active) => {
    if (active) {
      setIsOpen(true);
    } else {
      setIsSubmitting(true);
      const res = await toggleSkillRequest({ isActive: false });
      setIsSubmitting(false);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: isRequesting ? 'var(--danger-subtle)' : 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: isRequesting ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
        <Target size={18} color={isRequesting ? 'var(--danger)' : 'var(--text-muted)'} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: isRequesting ? 'var(--danger)' : 'var(--text-heading)' }}>Skill Request (Distress Beacon)</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isRequesting ? 'Your beacon is actively pulsing on the map.' : 'Turn this on if you urgently need a service.'}</p>
        </div>
        <button 
          onClick={() => handleToggle(!isRequesting)}
          style={{ 
            padding: '0.5rem 1rem', 
            background: isRequesting ? 'var(--bg-surface)' : 'var(--accent-flat)', 
            color: isRequesting ? 'var(--danger)' : 'white', 
            border: isRequesting ? '1px solid var(--danger)' : 'none', 
            borderRadius: 'var(--radius-full)', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          {isRequesting ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      <BroadcastModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialDesc={currentDesc || ''}
      />
    </>
  );
}
