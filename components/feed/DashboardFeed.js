'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from "@/components/layout/AppShell";
import EditPlugModal from './EditPlugModal';
import { Mailbox, Pencil, Package, Wrench, ShoppingBag, Building, Sparkles } from 'lucide-react';

export default function DashboardFeed({ user, initialPlugs = [], initialProfiles = [] }) {
  const router = useRouter();
  const [recentPlugs, setRecentPlugs] = useState([]);
  const [editingPlug, setEditingPlug] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('iplug_recent_plugs');
      if (stored) {
        setRecentPlugs(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const categories = [
    {
      title: <><Wrench size={16} className="inline-icon" /> Top Services &amp; Mechanics</>,
      pillar: 'services',
      items: initialPlugs.filter(p => p.pillar === 'services')
    },
    {
      title: <><ShoppingBag size={16} className="inline-icon" /> Trending Shops</>,
      pillar: 'shops',
      items: initialPlugs.filter(p => p.pillar === 'shops')
    },
    {
      title: <><Building size={16} className="inline-icon" /> Places to Explore</>,
      pillar: 'places',
      items: initialPlugs.filter(p => p.pillar === 'places')
    },
    {
      title: <><Sparkles size={16} className="inline-icon" /> Newest Arrivals</>,
      pillar: 'new',
      items: initialPlugs.slice(0, 10) // First 10 (already ordered by created_at desc)
    }
  ];

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
      
      <main className="dashboard-main">
        {/* Header removed as requested */}

        {/* Spotify-style Horizontal Rows (Default View) */}
          <div>
            {initialPlugs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={48} color="var(--text-muted)" /></span>
                <h3>No plugs found</h3>
                <p>Be the first to list a service or shop in your area!</p>
              </div>
            ) : (
              <>
                {recentPlugs.length > 0 && (
                  <section className="spotify-section">
                    <h2 className="spotify-section-title">
                      🕒 Jump back in
                    </h2>
                    <div className="spotify-carousel">
                      {recentPlugs.map(plug => (
                        <div 
                          key={plug.id} 
                          className="spotify-card"
                          onClick={() => router.push(`/plug/${plug.id}`)}
                          style={{ position: 'relative', cursor: 'pointer' }}
                        >
                          <div className="spotify-card-img" style={{ backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--bg-input)' }}>
                            {!plug.image_url?.startsWith('http') && <Package size={48} color="var(--text-muted)" />}
                          </div>
                          <div>
                            <h3 className="spotify-card-title">{plug.title}</h3>
                            <p className="spotify-card-subtitle">{plug.category || 'Recently viewed'}</p>
                          </div>
                          {user && user.id === plug.provider_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPlug(plug);
                              }}
                              style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                              title="Edit Plug"
                            >
                              <Pencil size={16} className="inline-icon" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {categories.map((cat, idx) => {
                  if (cat.items.length === 0) return null;
                  return (
                    <section className="spotify-section" key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                        <h2 className="spotify-section-title" style={{ marginBottom: 0 }}>
                          {cat.title}
                        </h2>
                        {cat.pillar && (
                          <span 
                            onClick={() => router.push(`/category/${cat.pillar}`)}
                            style={{ 
                              color: 'var(--text-secondary)', 
                              fontSize: '0.85rem', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            See all
                          </span>
                        )}
                      </div>
                      <div className="spotify-carousel">
                        {cat.items.map(plug => (
                          <div 
                            key={plug.id} 
                            className="spotify-card"
                            onClick={() => router.push(`/plug/${plug.id}`)}
                            style={{ position: 'relative', cursor: 'pointer' }}
                          >
                            <div className="spotify-card-img" style={{ backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--bg-input)' }}>
                              {!plug.image_url?.startsWith('http') && <Package size={48} color="var(--text-muted)" />}
                            </div>
                            <div>
                              <h3 className="spotify-card-title">{plug.title}</h3>
                              <p className="spotify-card-subtitle">{plug.category || plug.address || 'Local Plug'}</p>
                            </div>
                            {user && user.id === plug.provider_id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlug(plug);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '0.5rem',
                                  right: '0.5rem',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                                title="Edit Plug"
                              >
                                <Pencil size={16} className="inline-icon" />
                              </button>
                            )}
                          </div>
                        ))}
                        {cat.pillar && (
                          <div 
                            className="spotify-card"
                            onClick={() => router.push(`/category/${cat.pillar}`)}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              cursor: 'pointer',
                              background: 'var(--bg-input)',
                              border: '2px dashed var(--border)',
                              opacity: 0.8
                            }}
                          >
                            <div style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>•••</div>
                            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Explore More</div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>
      </main>
        <EditPlugModal 
          isOpen={!!editingPlug} 
          onClose={() => setEditingPlug(null)} 
          plug={editingPlug} 
        />
      </div>
    </AppShell>
  );
}
