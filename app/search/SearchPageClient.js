'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from "@/components/layout/AppShell";
import SearchFilters from "@/components/search/SearchFilters";

export default function SearchPageClient({ user, initialPlugs = [], initialProfiles = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [location, setLocation] = useState('');

  // Filter plugs based on search, tab, and location
  const filteredPlugs = initialPlugs.filter((plug) => {
    // 1. Tab Filter
    if (activeTab !== 'all' && plug.pillar !== activeTab) return false;

    // 2. Location Filter
    if (location.trim() !== '') {
      const locQ = location.toLowerCase();
      // Assume the address or region is stored in plug.address or plug.region
      const matchLoc = plug.address?.toLowerCase().includes(locQ) || 
                       plug.region?.toLowerCase().includes(locQ);
      if (!matchLoc) return false;
    }

    // 3. Search Query Filter (match title, description, or category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = plug.title?.toLowerCase().includes(q);
      const matchDesc = plug.description?.toLowerCase().includes(q);
      const matchCat = plug.category?.toLowerCase().includes(q);
      
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Filter profiles
  const filteredProfiles = searchQuery.trim() !== '' 
    ? initialProfiles.filter(profile => 
        (profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        profile.id !== user?.id // Don't show yourself
      )
    : [];

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
        <main className="dashboard-main">
          <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
            <h1>Find your <span className="gradient-text">Plug</span></h1>
            <p>Search by keyword, filter by category, and pinpoint by region.</p>
          </header>

          <SearchFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            location={location}
            setLocation={setLocation}
          />

          <section className="feed-grid">
            {filteredPlugs.length === 0 && filteredProfiles.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                <h3>No matches found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <>
                {filteredProfiles.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-faint)' }}>People</h3>
                  </div>
                )}
                {filteredProfiles.map(profile => (
                  <Link href={`/messages/${profile.id}`} key={profile.id} style={{ textDecoration: 'none' }}>
                    <div className="feed-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', flexDirection: 'row', gap: '1rem' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>
                        {(profile.username || profile.full_name)?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="feed-card-content" style={{ padding: 0 }}>
                        <div className="feed-card-header" style={{ marginBottom: 0 }}>
                          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {profile.username || profile.full_name}
                            {profile.is_verified && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                              </svg>
                            )}
                          </h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Tap to message</p>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredPlugs.length > 0 && filteredProfiles.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-faint)' }}>Plugs</h3>
                  </div>
                )}
                
                {filteredPlugs.map(plug => (
                  <Link href={`/plug/${plug.id}`} key={plug.id} style={{ textDecoration: 'none' }}>
                    <div className="feed-card">
                      <div className="feed-card-image" style={{ background: 'var(--bg-surface-raised)' }}>
                        <span style={{ fontSize: '3rem' }}>{plug.image_url || '📦'}</span>
                      </div>
                      <div className="feed-card-content">
                        <div className="feed-card-header">
                          <h3>{plug.title}</h3>
                        </div>
                        <p className="feed-card-desc">{plug.description}</p>
                        <div className="feed-card-meta">
                          <span>📍 {plug.address || 'Location unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </section>
        </main>
      </div>
    </AppShell>
  );
}
