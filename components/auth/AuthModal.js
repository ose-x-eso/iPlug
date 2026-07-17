'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, signUp, sendPasswordResetEmail } from '@/app/actions/auth';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../layout/Logo';

export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true);
      setErrorMsg('');
      setSuccessMsg('');
      setIsForgotPassword(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabSwitch = (loginState) => {
    setIsLogin(loginState);
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPassword(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    let result;

    try {
      if (isForgotPassword) {
        result = await sendPasswordResetEmail(formData);
      } else if (isLogin) {
        result = await login(formData);
      } else {
        result = await signUp(formData);
      }
    } catch (err) {
      console.error('Action error:', err);
      result = { error: err?.message || String(err) || 'An unexpected error occurred.' };
    }

    if (result?.error) {
      let errorMessage = 'An unknown error occurred.';
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error?.message) {
        errorMessage = result.error.message;
      } else {
        const stringified = JSON.stringify(result.error);
        if (stringified !== '{}' && stringified !== '""') {
          errorMessage = stringified;
        } else if (result.error?.name === 'AuthApiError') {
          errorMessage = 'Authentication failed. Please check your details.';
        }
      }
      setErrorMsg(errorMessage);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      if (isForgotPassword) {
        setSuccessMsg('Password reset link sent to your email.');
      } else if (isLogin) {
        onClose();
        window.location.reload();
      } else {
        if (result.requireConfirmation) {
          setSuccessMsg('Account created! Please check your email to confirm your account.');
        } else {
          setSuccessMsg('Account created! Logging you in...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size={40} showText={false} />
          </div>
          <h2>{isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join iPlug'}</h2>
          <p>{isForgotPassword ? 'Enter your email to receive a reset link.' : isLogin ? 'Log in to find your plug.' : 'Create an account to start discovering.'}</p>
        </div>

        {!isForgotPassword && (
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
        )}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!isLogin && !successMsg && (
            <>
              <div className="auth-form-grid">
                <div className="input-group">
                  <label>Full Name (Private)</label>
                  <input type="text" name="fullName" required placeholder="Ose Web Developer" autoComplete="name" className="input-field" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Only used for account recovery.
                  </p>
                </div>
                <div className="input-group">
                  <label>Username (Public)</label>
                  <input type="text" name="username" required placeholder="ose_dev" pattern="^[a-zA-Z0-9_]{3,15}$" title="3-15 characters, letters, numbers, and underscores only" autoComplete="off" className="input-field" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    How you appear to others.
                  </p>
                </div>
              </div>
              <div className="auth-form-grid">
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phoneNumber" required placeholder="+234..." autoComplete="tel" className="input-field" />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" className="input-field" />
                </div>
              </div>
            </>
          )}

          {!successMsg && !isForgotPassword && (
            <>
              {isLogin && (
                <div className="input-group">
                  <label>Email or Username</label>
                  <input type="text" name="email" required placeholder="you@example.com or ose_dev" autoComplete="email" className="input-field" />
                </div>
              )}

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-text)', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    placeholder="••••••••" 
                    minLength="6" 
                    autoComplete="current-password" 
                    className="input-field" 
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                {isLoading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </>
          )}

          {isForgotPassword && !successMsg && (
            <>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" className="input-field" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)}
                className="btn btn-ghost btn-full" 
                style={{ marginTop: '0.5rem' }}
              >
                Back to Login
              </button>
            </>
          )}
        </form>

      </div>
    </div>
  );
}
