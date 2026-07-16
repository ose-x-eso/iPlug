'use client';

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If they already submitted successfully, completely hide the widget
  if (isSubmitted) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    const result = await submitFeedback(feedback);
    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      setIsOpen(false);
    } else {
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="feedback-widget-container">
      {/* Modal Popup */}
      {isOpen && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          width: '320px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Beta Feedback</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            What do you think of iPlug? Let us know what we can add or improve!
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us your thoughts..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                resize: 'none',
                marginBottom: '1rem'
              }}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isSubmitting || !feedback.trim()}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? 'Sending...' : (
                <>
                  <Send size={16} /> Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(255, 69, 58, 0.39)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={20} />
          Beta Feedback
        </button>
      )}
    </div>
  );
}
