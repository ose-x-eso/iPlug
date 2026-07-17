'use client';

import { useState } from 'react';
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
    const currentPassword = formData.get('currentPassword');
    
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
    // On success, the action redirects to / layout
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Security Settings</h2>
      
      {/* Change Password */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="auth-form" style={{ maxWidth: '400px' }} autoComplete="off">
          {passwordError && <div className="auth-error">{passwordError}</div>}
          {passwordSuccess && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)', marginBottom: '1rem' }}>
              {passwordSuccess}
            </div>
          )}
          <div className="input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              name="currentPassword" 
              required 
              placeholder="••••••••" 
              className="input-field" 
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••" 
              minLength="6"
              className="input-field" 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="submit" className="btn btn-secondary" disabled={passwordLoading} style={{ width: 'fit-content' }}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
            <a href="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Deleting your account is permanent. All your data, plugs, and messages will be wiped.
        </p>

        {deleteError && <div className="auth-error" style={{ maxWidth: '400px', marginBottom: '1rem' }}>{deleteError}</div>}

        {!isDeleting ? (
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ color: 'var(--danger)', background: 'var(--danger-subtle)' }}
            onClick={() => setIsDeleting(true)}
          >
            Delete Account
          </button>
        ) : (
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', maxWidth: '400px' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Are you absolutely sure?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Type <strong>DELETE</strong> below to confirm.</p>
            
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ background: 'var(--danger)' }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
