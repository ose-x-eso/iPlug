'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from "@/components/layout/AppShell";
import SearchFilters from "@/components/search/SearchFilters";
import { Mailbox, MapPin, Package } from 'lucide-react';

export default function SearchPageClient({ user, initialPlugs = [], initialProfiles = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [location, setLocation] = useState('');
  const [showSearchFab, setShowSearchFab] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB if scrolled past 150px
      setShowSearchFab(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Try to focus the search input after a short delay to allow scrolling
    setTimeout(() => {
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 500);
  };

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
            searchInputId="main-search-input"
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
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={16} className="inline-icon" /></span>
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
                  <Link href={`/profile/${profile.id}`} key={profile.id} style={{ textDecoration: 'none' }}>
                    <div className="feed-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', flexDirection: 'row', gap: '1rem' }}>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        background: 'var(--gradient-accent)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.5rem', 
                        color: 'white',
                        backgroundImage: profile.avatar_url?.startsWith('http') ? `url(${profile.avatar_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {!profile.avatar_url?.startsWith('http') && ((profile.username || profile.full_name)?.charAt(0).toUpperCase() || 'U')}
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Tap to view profile</p>
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
                      <div className="feed-card-image" style={{ 
                        background: 'var(--bg-surface-raised)',
                        backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {!plug.image_url?.startsWith('http') && <Package size={48} color="var(--text-muted)" />}
                      </div>
                      <div className="feed-card-content">
                        <div className="feed-card-header">
                          <h3>{plug.title}</h3>
                        </div>
                        <p className="feed-card-desc">{plug.description}</p>
                        <div className="feed-card-meta">
                          <span><MapPin size={16} className="inline-icon" /> {plug.address || 'Location unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </section>

          {showSearchFab && (
            <button 
              onClick={scrollToSearch}
              style={{
                position: 'fixed',
                bottom: '80px', // Above the mobile bottom nav
                right: '20px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 59, 48, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 100,
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          )}
        </main>
      </div>
    </AppShell>
  );
}
