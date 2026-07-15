'use client';

import { useState, useEffect } from 'react';
import { login, signUp } from '@/app/actions/auth';

export default function AuthModal({ isOpen, onClose }) {
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
      setErrorMsg(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      if (isLogin) {
        onClose();
      } else {
        setSuccessMsg('Account created! Please check your email for the confirmation link.');
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
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

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!isLogin && !successMsg && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="fullName" required placeholder="Chinedu Okafor" />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phoneNumber" required placeholder="+234..." />
              </div>
            </>
          )}

          {!successMsg && (
            <>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" required placeholder="you@example.com" />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" required placeholder="••••••••" minLength="6" />
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
