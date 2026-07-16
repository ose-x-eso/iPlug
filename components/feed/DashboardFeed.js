'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from "@/components/layout/AppShell";
import EditPlugModal from './EditPlugModal';

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
      title: '🛠️ Top Services & Mechanics',
      items: initialPlugs.filter(p => p.pillar === 'services')
    },
    {
      title: '🛍️ Trending Shops',
      items: initialPlugs.filter(p => p.pillar === 'shops')
    },
    {
      title: '🏢 Places to Explore',
      items: initialPlugs.filter(p => p.pillar === 'places')
    },
    {
      title: '🆕 Newest Arrivals',
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
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
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
                          <div className="spotify-card-img">
                            {plug.image_url || '📦'}
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
                              ✏️
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
                      <h2 className="spotify-section-title">
                        {cat.title}
                      </h2>
                      <div className="spotify-carousel">
                        {cat.items.map(plug => (
                          <div 
                            key={plug.id} 
                            className="spotify-card"
                            onClick={() => router.push(`/plug/${plug.id}`)}
                            style={{ position: 'relative', cursor: 'pointer' }}
                          >
                            <div className="spotify-card-img">
                              {plug.image_url || '📦'}
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
                                ✏️
                              </button>
                            )}
                          </div>
                        ))}
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
