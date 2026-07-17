import React from 'react';

export default function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
      <img 
        src="/iplug_logo.png" 
        alt="iPlug Logo" 
        width={size} 
        height={size} 
        style={{ 
          borderRadius: size * 0.25, 
          objectFit: 'cover',
          boxShadow: '0 4px 10px rgba(255, 107, 53, 0.3)'
        }} 
      />
      
      {showText && (
        <span style={{ 
          fontSize: size * 0.6, 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          color: 'var(--text-heading)',
          fontFamily: 'var(--font-display)'
        }}>
          iPlug
        </span>
      )}
    </div>
  );
}
