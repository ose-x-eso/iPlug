'use client';

import { useState } from 'react';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Pencil, ShieldAlert } from 'lucide-react';
import { applyForCivicAuthority } from '@/app/actions/civic';
import { useToast } from '@/components/ui/ToastProvider';

export default function EditProfileSettings({ profile }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApplyCivic = async () => {
    setIsApplying(true);
    const result = await applyForCivicAuthority();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Civic Authority Application Approved!');
    }
    setIsApplying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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

      {/* Civic Authority Application Button */}
      {!profile?.is_civic_authority ? (
        <button 
          onClick={handleApplyCivic}
          disabled={isApplying}
          className="native-row"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: isApplying ? 0.7 : 1 }}
        >
          <div className="native-row-content">
            <div className="native-icon-box" style={{ backgroundColor: '#ef4444' }}>
              <ShieldAlert size={16} color="white" />
            </div>
            <span className="native-row-title">{isApplying ? 'Applying...' : 'Apply for Civic Authority'}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      ) : (
        <div className="native-row" style={{ width: '100%', background: 'transparent', border: 'none' }}>
          <div className="native-row-content">
            <div className="native-icon-box" style={{ backgroundColor: '#10b981' }}>
              <ShieldAlert size={16} color="white" />
            </div>
            <span className="native-row-title" style={{ color: '#10b981', fontWeight: '500' }}>Verified Civic Authority</span>
          </div>
        </div>
      )}

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        profile={profile} 
      />
    </div>
  );
}
