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
        className="native-row"
        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div className="native-row-content">
          <div className="native-icon-box" style={{ backgroundColor: '#3b82f6' }}>
            <Pencil size={16} color="white" />
          </div>
          <span className="native-row-title">Edit Public Profile</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        profile={profile} 
      />
    </>
  );
}
