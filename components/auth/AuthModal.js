'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, signUp } from '@/app/actions/auth';

export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabSwitch = (loginState) => {
    setIsLogin(loginState);
    setErrorMsg('');
    setSuccessMsg('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    let result;

    if (isLogin) {
      result = await login(formData);
    } else {
      result = await signUp(formData);
    }

    if (result?.error) {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : (result.error?.message || JSON.stringify(result.error) || 'An unknown error occurred.');
      setErrorMsg(errorMessage);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      if (isLogin) {
        onClose();
        // Force the Server Component (app/page.js) to re-run and show DashboardFeed
        window.location.reload();
      } else {
        setSuccessMsg('Account created! Logging you in...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>{isLogin ? 'Welcome Back' : 'Join iPlugg'}</h2>
          <p>{isLogin ? 'Log in to find your plug.' : 'Create an account to start discovering.'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => handleTabSwitch(true)}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => handleTabSwitch(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!isLogin && !successMsg && (
            <>
              <div className="input-group">
                <label>Full Name (Private)</label>
                <input type="text" name="fullName" required placeholder="Ose Web Developer" autoComplete="name" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Only used for billing and account recovery.
                </p>
              </div>
              <div className="input-group">
                <label>Username (Public)</label>
                <input type="text" name="username" required placeholder="ose_dev" pattern="^[a-zA-Z0-9_]{3,15}$" title="3-15 characters, letters, numbers, and underscores only" autoComplete="off" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This is how you will appear to others on the platform.
                </p>
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phoneNumber" required placeholder="+234..." autoComplete="tel" />
              </div>
            </>
          )}

          {!successMsg && (
            <>
              <div className="input-group">
                <label>{isLogin ? 'Email or Username' : 'Email Address'}</label>
                <input type="text" name="email" required placeholder={isLogin ? "you@example.com or ose_dev" : "you@example.com"} autoComplete="email" />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" required placeholder="••••••••" minLength="6" autoComplete="current-password" />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </>
          )}
        </form>

      </div>
    </div>
  );
}
