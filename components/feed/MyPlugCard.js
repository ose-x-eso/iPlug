'use client';

import { useState } from 'react';
import { deletePlug } from '@/app/actions/plugs';
import EditPlugModal from './EditPlugModal';
import { MapPin, Pencil, Package } from 'lucide-react';

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
  };

  return (
    <>
      <div className="feed-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="feed-card-image" style={{ background: 'linear-gradient(45deg, #1A1A2E, #16213E)', height: '150px' }}>
          {plug.image_url?.startsWith('http') ? (
            <img src={plug.image_url} alt={plug.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <Package size={48} color="var(--text-muted)" />
            </div>
          )}
        </div>
        <div className="feed-card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="feed-card-header">
            <h3>{plug.title}</h3>
          </div>
          <p className="feed-card-desc" style={{ flex: 1 }}>{plug.description}</p>
          <div className="feed-card-meta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span><MapPin size={16} className="inline-icon" /> {plug.address || 'Location unknown'}</span>
            <span className="category-pill active">{plug.category}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setIsEditOpen(true)}
              disabled={isDeleting}
            >
              <Pencil size={16} className="inline-icon" /> Edit
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.5rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditPlugModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          plug={plug}
        />
      )}
    </>
  );
}
