'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserPassword } from '@/app/actions/auth';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    const result = await updateUserPassword(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else {
      setSuccessMsg('Password successfully updated! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-page)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <>
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

              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading} style={{ marginTop: '1rem' }}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
