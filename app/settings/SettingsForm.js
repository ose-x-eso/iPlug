'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';

export default function SettingsForm({ initialProfile }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    const result = await updateProfile(formData);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
      {errorMsg && <div className="auth-error">{errorMsg}</div>}
      {successMsg && (
        <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      <div className="input-group">
        <label>Full Name</label>
        <input 
          type="text" 
          name="full_name" 
          defaultValue={initialProfile?.full_name || ''} 
          required 
          placeholder="Ose Web Developer" 
        />
      </div>

      <div className="input-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          name="phone_number" 
          defaultValue={initialProfile?.phone_number || ''} 
          placeholder="+234..." 
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Used for customers to contact you directly if you list a plug.
        </p>
      </div>

      <div className="input-group">
        <label>Email Address</label>
        <input 
          type="email" 
          defaultValue={initialProfile?.email || ''} 
          disabled 
          style={{ opacity: 0.7, cursor: 'not-allowed' }}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Email address cannot be changed currently.
        </p>
      </div>

      <button type="submit" className="btn btn-primary mt-lg" disabled={isLoading} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
