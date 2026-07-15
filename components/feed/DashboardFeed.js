'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from "@/components/layout/Navbar";

export default function DashboardFeed({ user, initialPlugs = [], initialProfiles = [] }) {
  // Use username, fallback to email prefix
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || "User";

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter plugs based on search query and active tab
  const filteredPlugs = initialPlugs.filter((plug) => {
    // 1. Tab Filter
    if (activeTab !== 'all' && plug.pillar !== activeTab) return false;

    // 2. Search Filter (match title, description, or category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = plug.title?.toLowerCase().includes(q);
      const matchDesc = plug.description?.toLowerCase().includes(q);
      const matchCat = plug.category?.toLowerCase().includes(q);
      
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Filter profiles (People) if there is a search query
  const filteredProfiles = searchQuery.trim() !== '' 
    ? initialProfiles.filter(profile => 
        (profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        profile.id !== user?.id // Don't show yourself
      )
    : [];

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, <span className="gradient-text">{displayName}</span></h1>
          <p>What are you looking for today?</p>
        </header>

        <div className="search-bar dashboard-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search for electricians, fresh food, gyms..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <section className="dashboard-categories">
          <div 
            className={`category-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >All</div>
          <div 
            className={`category-pill ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >🛠️ Services</div>
          <div 
            className={`category-pill ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >🛍️ Shops</div>
          <div 
            className={`category-pill ${activeTab === 'places' ? 'active' : ''}`}
            onClick={() => setActiveTab('places')}
          >🏢 Places</div>
        </section>

        <section className="feed-grid">
          {filteredPlugs.length === 0 && filteredProfiles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
              {initialPlugs.length === 0 ? (
                <>
                  <h3>No plugs found</h3>
                  <p>Be the first to list a service or shop in your area!</p>
                </>
              ) : (
                <>
                  <h3>No matches found</h3>
                  <p>Try adjusting your search or filters to find what you're looking for.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {filteredProfiles.length > 0 && (
                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>People</h3>
                </div>
              )}
              {filteredProfiles.map(profile => (
                <Link href={`/messages/${profile.id}`} key={profile.id} style={{ textDecoration: 'none' }}>
                  <div className="feed-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', flexDirection: 'row', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>
                      {(profile.username || profile.full_name)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="feed-card-content" style={{ padding: 0 }}>
                      <div className="feed-card-header" style={{ marginBottom: 0 }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          @{profile.username || profile.full_name}
                          {profile.is_verified && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                            </svg>
                          )}
                        </h3>
                      </div>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: 0 }}>Tap to message</p>
                    </div>
                  </div>
                </Link>
              ))}

              {filteredPlugs.length > 0 && filteredProfiles.length > 0 && (
                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Plugs</h3>
                </div>
              )}
              
              {filteredPlugs.map(plug => (
                <Link href={`/plug/${plug.id}`} key={plug.id} style={{ textDecoration: 'none' }}>
                  <div className="feed-card">
                    <div className="feed-card-image" style={{ background: 'linear-gradient(45deg, #1A1A2E, #16213E)' }}>
                      <span style={{ fontSize: '3rem' }}>{plug.image_url || '📦'}</span>
                    </div>
                    <div className="feed-card-content">
                      <div className="feed-card-header">
                        <h3>{plug.title}</h3>
                      </div>
                      <p className="feed-card-desc">{plug.description}</p>
                      <div className="feed-card-meta">
                        <span>📍 {plug.address || 'Location unknown'}</span>
                        <span>⭐ 4.8 (12 Reviews)</span>
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
  );
}
