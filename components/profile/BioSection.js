'use client';

import { useState } from 'react';

export default function BioSection({ bio, maxLength = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bio) return null;

  const isLong = bio.length > maxLength;
  const displayText = isExpanded ? bio : bio.slice(0, maxLength);

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
        {displayText}
        {isLong && !isExpanded && '...'}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary)', 
            padding: 0, 
            marginTop: '0.25rem', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          {isExpanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
}
