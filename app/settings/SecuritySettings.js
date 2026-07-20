'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateUserPassword, deleteUserAccount } from '@/app/actions/auth';

export default function SecuritySettings() {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    const formData = new FormData(e.target);
    
    // Call server action that verifies current password then updates
    const result = await updateUserPassword(formData);

    if (result?.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess('Password successfully updated!');
      e.target.reset();
      setTimeout(() => setPasswordSuccess(''), 3000);
    }
    
    setPasswordLoading(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    const result = await deleteUserAccount();
    if (result?.error) {
      setDeleteError(result.error);
      setDeleteLoading(false);
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Password Change Section */}
      <div className="native-card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'block' }}>
        <h3 className="native-row-title" style={{ marginBottom: '1rem', fontWeight: 600 }}>Change Password</h3>
        
        <form onSubmit={handlePasswordSubmit}>
          {passwordError && (
            <div className="native-error-text">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="native-success-text">{passwordSuccess}</div>
          )}
          
          <div className="native-input-group">
            <label className="native-input-label">Current Password</label>
            <input 
              type="password" 
              name="currentPassword" 
              required 
              placeholder="••••••••" 
              className="native-input" 
            />
          </div>

          <div className="native-input-group">
            <label className="native-input-label">New Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••" 
              minLength="6"
              className="native-input" 
            />
          </div>
          
          <div className="native-buttons-stack">
            <button type="submit" className="native-btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
            <Link href="/auth/update-password" style={{ textAlign: 'center', color: '#ef4444', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
        </form>
      </div>

      {/* Danger Zone Section */}
      <div className="native-card" style={{ padding: '1rem', display: 'block' }}>
        <h3 className="native-row-title" style={{ color: '#ef4444', marginBottom: '0.5rem', fontWeight: 600 }}>Danger Zone</h3>
        <p className="native-input-label" style={{ marginBottom: '1rem' }}>
          Deleting your account is permanent. All your data, plugs, and messages will be wiped.
        </p>

        {!isDeleting ? (
          <button 
            type="button"
            onClick={() => setIsDeleting(true)}
            className="native-btn-danger"
          >
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.875rem' }}>Are you absolutely sure?</p>
            <p className="native-input-label">Type <strong style={{ color: 'white' }}>DELETE</strong> below to confirm.</p>
            
            <input 
              type="text" 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="native-input"
            />

            <button 
              type="button"
              onClick={handleDeleteAccount}
              className="native-btn-danger"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setIsDeleting(false);
                setDeleteConfirmText('');
                setDeleteError('');
              }}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                fontWeight: 600,
                borderRadius: '0.75rem',
                padding: '0.875rem',
                fontSize: '17px',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            {deleteError && (
              <p className="native-error-text">{deleteError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
