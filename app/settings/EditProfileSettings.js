'use client';

import { useState } from 'react';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Pencil } from 'lucide-react';

export default function EditProfileSettings({ profile }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsEditOpen(true)}
        className="btn btn-primary"
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          width: '100%',
          justifyContent: 'center',
          padding: '1rem',
          fontSize: '1.1rem'
        }}
      >
        <Pencil size={16} className="inline-icon" /> Edit Public Profile
      </button>

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        profile={profile} 
      />
    </>
  );
}
