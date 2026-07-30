'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from "@/components/layout/AppShell";
import SearchFilters from "@/components/search/SearchFilters";
import { Mailbox, MapPin, Package, Megaphone, Target, X } from 'lucide-react';
import { toggleSkillRequest } from '@/app/actions/profile';

export default function SearchPageClient({ user, initialPlugs = [], initialProfiles = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [location, setLocation] = useState('');
  const [showSearchFab, setShowSearchFab] = useState(false);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSaveBroadcast = async () => {
    if (!user) {
      alert("Please log in to broadcast a request.");
      return;
    }
    if (!broadcastDesc.trim()) return;
    setIsBroadcasting(true);
    
    let lat = null;
    let lng = null;
    
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        console.warn('Could not get location for broadcast');
      }
    }

    const res = await toggleSkillRequest({
      isActive: true,
      desc: broadcastDesc.trim(),
      lat,
      lng
    });

    setIsBroadcasting(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsBroadcastModalOpen(false);
      alert("Broadcast successful! Your request is now live.");
    }
  };

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
         profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (profile.is_requesting_skill && profile.skill_request_desc?.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (profile.id !== user?.id || profile.is_requesting_skill) // Show yourself if you have an active beacon so you can verify it
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
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={48} color="var(--text-muted)" /></span>
                <h3 style={{ color: 'var(--text-heading)' }}>No Plugs found in this area</h3>
                <p>Don't give up. Broadcast this request to the iPlug community and let the right Plug find you.</p>
                <button 
                  className="native-btn-primary" 
                  onClick={() => {
                    setBroadcastDesc(searchQuery);
                    setIsBroadcastModalOpen(true);
                  }}
                  style={{ marginTop: '1.5rem', background: 'var(--danger)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}
                >
                  <Megaphone size={18} /> Broadcast Request
                </button>
              </div>
            ) : (
              <>
                {filteredProfiles.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                    <h3 className="native-section-title" style={{ marginLeft: 0 }}>People</h3>
                    <div className="native-card">
                      {filteredProfiles.map(profile => (
                        <Link href={`/profile/${profile.id}`} key={profile.id} className="native-row" style={{ color: 'inherit' }}>
                          <div className="native-row-content">
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              background: 'var(--gradient-accent)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '1.2rem', 
                              color: 'white',
                              backgroundImage: profile.avatar_url?.startsWith('http') ? `url(${profile.avatar_url})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}>
                              {!profile.avatar_url?.startsWith('http') && ((profile.username || profile.full_name)?.charAt(0).toUpperCase() || 'U')}
                            </div>
                            <div className="native-row-text">
                              <span className="native-row-title" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {profile.username || profile.full_name}
                                {profile.is_verified && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                                  </svg>
                                )}
                              </span>
                              <span className="native-input-label">
                                {profile.is_requesting_skill ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 2s infinite' }}></span>
                                    Needs: {profile.skill_request_desc?.slice(0, 30)}{profile.skill_request_desc?.length > 30 ? '...' : ''}
                                  </span>
                                ) : (
                                  'Tap to view profile'
                                )}
                              </span>
                            </div>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPlugs.length > 0 && filteredProfiles.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-faint)' }}>Plugs</h3>
                  </div>
                )}
                
                {filteredPlugs.map(plug => {
                  const plugOwner = initialProfiles.find(p => p.id === plug.provider_id);
                  const isRequesting = plugOwner?.is_requesting_skill;
                  
                  return (
                  <Link href={`/plug/${plug.id}`} key={plug.id} style={{ textDecoration: 'none' }}>
                    <div className="feed-card" style={{ position: 'relative' }}>
                      <div className="feed-card-image" style={{ 
                        background: 'var(--bg-surface-raised)',
                        backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {!plug.image_url?.startsWith('http') && <Package size={48} color="var(--text-muted)" />}
                        {isRequesting && (
                          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'var(--danger)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', animation: 'pulse 2s infinite', boxShadow: '0 2px 8px var(--danger-subtle)' }}>
                            <Target size={12} /> Seeking Skill
                          </div>
                        )}
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
                )})}
              </>
            )}

            {/* Always show Broadcast option if there are results, at the bottom */}
            {(filteredPlugs.length > 0 || filteredProfiles.length > 0) && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 1rem', marginTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text-heading)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Didn't find what you're looking for?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Broadcast this request to the iPlug community and let the right Plug find you.</p>
                <button 
                  className="native-btn-primary" 
                  onClick={() => {
                    setBroadcastDesc(searchQuery);
                    setIsBroadcastModalOpen(true);
                  }}
                  style={{ margin: '0 auto' }}
                >
                  <Megaphone size={16} /> Broadcast Request
                </button>
              </div>
            )}
          </section>

          {showSearchFab && (
            <button 
              onClick={scrollToSearch}
              style={{
                position: 'fixed',
                bottom: '120px', // Above the mobile bottom nav and feedback widget
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

      {isBroadcastModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="anim-scale" style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '400px',
            padding: '2rem',
            border: '1px solid var(--border)',
            position: 'relative'
          }}>
            <button onClick={() => setIsBroadcastModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>
              <Target size={24} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-heading)' }}>Activate Beacon</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Describe exactly what you need. This will be visible to everyone who sees your profile or pin.</p>
            
            <textarea
              placeholder="e.g., I need an experienced Plumber around Yaba immediately..."
              value={broadcastDesc}
              onChange={(e) => setBroadcastDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                minHeight: '100px',
                resize: 'none',
                marginBottom: '1.5rem'
              }}
            />

            <button 
              onClick={handleSaveBroadcast}
              disabled={isBroadcasting || !broadcastDesc.trim()}
              className="native-btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger)', display: 'flex', justifyContent: 'center' }}
            >
              {isBroadcasting ? 'Activating...' : 'Broadcast Need'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
