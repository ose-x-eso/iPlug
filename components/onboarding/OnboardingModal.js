'use client';

import { useState, useEffect } from 'react';
import { updateOnboardingState } from '@/app/actions/profile';
import { MapPin, Bell, Smartphone, UserCircle, Wrench, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingModal({ userProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If we have a profile and they haven't completed onboarding, show it
    if (userProfile && userProfile.has_completed_onboarding === false) {
      setIsOpen(true);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    await updateOnboardingState(true);
    setIsOpen(false);
    setIsSubmitting(false);
    router.refresh();
  };

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="anim-scale" style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border)'
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', height: '4px', background: 'var(--bg-input)' }}>
          <div style={{ 
            width: `${(step / 3) * 100}%`, 
            background: 'var(--gradient-accent)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ padding: '2rem' }}>
          {step === 1 && (
            <div className="anim-fade">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-text)' }}>
                  <UserCircle size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Welcome to iPlug</h2>
                <p style={{ color: 'var(--text-muted)' }}>How do you plan to use the app today?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  onClick={nextStep}
                  style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-flat)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-heading)' }}><Wrench size={24} /></div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem' }}>I want to offer a service</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>List your hustle as a Plug</p>
                  </div>
                </button>

                <button 
                  onClick={nextStep}
                  style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-flat)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-heading)' }}><MapPin size={24} /></div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem' }}>I need a service</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Find plugs around me</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="anim-fade">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
                  <MapPin size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Drop your Pin</h2>
                <p style={{ color: 'var(--text-muted)' }}>iPlug uses your location to show you services nearby and put you on the map.</p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '100%', height: '120px', background: 'url("https://www.transparenttextures.com/patterns/cubes.png") var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#10b981', animation: 'float 2s ease-in-out infinite' }}>
                      <MapPin size={40} fill="currentColor" />
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={nextStep} style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-full)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}>
                  Skip for now
                </button>
                <button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(() => nextStep(), () => nextStep());
                    } else {
                      nextStep();
                    }
                  }}
                  className="btn-primary" 
                  style={{ flex: 2, padding: '1rem', borderRadius: 'var(--radius-full)' }}
                >
                  Allow Location
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="anim-fade">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#3b82f6' }}>
                  <Sparkles size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Enable Superpowers</h2>
                <p style={{ color: 'var(--text-muted)' }}>Stay in the loop with instant alerts.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                  <Bell size={24} color="#f59e0b" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: 'var(--text-heading)' }}>Push Notifications</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when clients message you</p>
                  </div>
                  <button onClick={() => alert("Go to Settings to enable this for now!")} style={{ padding: '0.5rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-heading)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Enable
                  </button>
                </div>

                <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                  <Smartphone size={24} color="#8b5cf6" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: 'var(--text-heading)' }}>Install App</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add iPlug to your homescreen</p>
                  </div>
                  <button onClick={() => alert("Tap 'Add to Home Screen' in your browser menu!")} style={{ padding: '0.5rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-heading)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Install
                  </button>
                </div>

              </div>

              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn-primary btn-full"
                style={{ padding: '1rem', borderRadius: 'var(--radius-full)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmitting ? 'Saving...' : 'Get Started'} <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
