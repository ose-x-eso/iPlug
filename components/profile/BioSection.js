'use client';

import { useState } from 'react';

export default function BioSection({ bio, maxLength = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bio) return null;

  const isLong = bio.length > maxLength;
  const displayText = isExpanded ? bio : bio.slice(0, maxLength);

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'left' }}>
      <h3 className="native-section-title" style={{ marginLeft: 0 }}>About</h3>
      <div className="native-card" style={{ padding: '1rem' }}>
        <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'white', whiteSpace: 'pre-wrap', margin: 0 }}>
          {displayText}
          {isLong && !isExpanded && '...'}
        </p>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              padding: 0, 
              marginTop: '0.5rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    </div>
  );
}
