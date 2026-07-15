'use client';

import { useState } from 'react';
import { deletePlug } from '@/app/actions/plugs';
import EditPlugModal from './EditPlugModal';

export default function MyPlugCard({ plug }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plug? This cannot be undone.')) return;
    
    setIsDeleting(true);
    const result = await deletePlug(plug.id);
    if (result?.error) {
      alert(result.error);
      setIsDeleting(false);
    }
    // If successful, Next.js revalidates the path and the card will disappear
  };

  return (
    <>
      <div className="feed-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="feed-card-image" style={{ background: 'linear-gradient(45deg, #1A1A2E, #16213E)', height: '150px' }}>
          <span style={{ fontSize: '3rem' }}>{plug.image_url || '📦'}</span>
        </div>
        <div className="feed-card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="feed-card-header">
            <h3>{plug.title}</h3>
          </div>
          <p className="feed-card-desc" style={{ flex: 1 }}>{plug.description}</p>
          <div className="feed-card-meta">
            <span>📍 {plug.address || 'Location unknown'}</span>
            <span className="category-pill active">{plug.category}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setIsEditOpen(true)}
              disabled={isDeleting}
            >
              ✏️ Edit
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.5rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      </div>

      <EditPlugModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        plug={plug} 
      />
    </>
  );
}
