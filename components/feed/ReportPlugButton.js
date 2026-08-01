'use client';

import { AlertCircle } from 'lucide-react';

export default function ReportPlugButton() {
  return (
    <button 
      onClick={() => alert('Report submitted to admins. Thank you for keeping iPlug Hub safe.')}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.5rem', 
        textDecoration: 'none', 
        padding: '0.5rem', 
        fontWeight: '600', 
        color: '#ef4444', 
        background: 'transparent', 
        border: '1px dashed #ef4444', 
        borderRadius: 'var(--radius-md)', 
        cursor: 'pointer', 
        marginTop: '1rem', 
        fontSize: '0.9rem',
        width: '100%'
      }}
    >
      <AlertCircle size={16} /> Report this Plug
    </button>
  );
}
