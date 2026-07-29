'use client';

import { useState } from 'react';
import { deletePlug } from '@/app/actions/plugs';
import EditPlugModal from './EditPlugModal';
import { MapPin, Pencil, Package, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

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
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-xl)', 
        overflow: 'hidden', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}>
        
        {/* Card Header / Image */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--accent-flat), var(--accent-subtle))', 
          height: '180px',
          position: 'relative',
          borderBottom: '1px solid var(--border)'
        }}>
          {plug.image_url?.startsWith('http') ? (
            <img src={plug.image_url} alt={plug.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)'}}>
              <Package size={64} />
            </div>
          )}
          
          {/* Glassmorphic overlay for category */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)'
          }}>
            {plug.category}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1.3' }}>{plug.title}</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <MapPin size={14} color="var(--accent-flat)" /> {plug.address || 'Location unknown'}
          </div>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.9rem', 
            lineHeight: '1.5', 
            margin: '0 0 1.5rem 0', 
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {plug.description}
          </p>
          
          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
            <Link 
              href={`/plug/${plug.id}`}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', gap: '0.25rem', textDecoration: 'none' }}
            >
              <Eye size={14} /> View
            </Link>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', gap: '0.25rem' }}
              onClick={() => setIsEditOpen(true)}
              disabled={isDeleting}
            >
              <Pencil size={14} /> Edit
            </button>
            <button 
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', gap: '0.25rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={14} /> {isDeleting ? '...' : 'Delete'}
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
