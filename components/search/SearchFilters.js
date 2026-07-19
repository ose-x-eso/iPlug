 
 
'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Wrench, ShoppingBag, Building, Ticket } from 'lucide-react';

export default function SearchFilters({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab, 
  location, 
  setLocation,
  searchInputId 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('iplug_search_history');
      if (stored) {
        setTimeout(() => setRecentSearches(JSON.parse(stored)), 0);
      }
    } catch (e) {}
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced fetch to Nominatim API
  useEffect(() => {
    const fetchLocations = async () => {
      if (!location || location.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        // Using Nominatim OpenStreetMap API. Bound to Nigeria for MVP, but can be removed.
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&countrycodes=ng`);
        const data = await response.json();
        
        // Extract display names
        const results = data.map(item => item.display_name);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      // Only trigger API if the user is actually focused on the input
      if (document.activeElement?.name === 'location_input') {
        fetchLocations();
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleSelectLocation = (selected) => {
    // Take just the most relevant part of the address (e.g. "Ikeja, Lagos")
    const simplified = selected.split(',').slice(0, 2).join(',');
    setLocation(simplified);
    setShowDropdown(false);
  };

  const saveSearchToHistory = (query) => {
    if (!query || !query.trim()) return;
    try {
      const current = JSON.parse(localStorage.getItem('iplug_search_history') || '[]');
      const updated = [query.trim(), ...current.filter(q => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 5);
      localStorage.setItem('iplug_search_history', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (e) {}
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveSearchToHistory(searchQuery);
      setShowHistory(false);
    }
  };

  return (
    <div className="search-filters">
      <div className="search-bar dashboard-search" style={{ marginBottom: '1rem', position: 'relative' }} ref={searchContainerRef}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          id={searchInputId}
          type="text" 
          placeholder="Search for electricians, fresh food, gyms..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => { if (recentSearches.length > 0) setShowHistory(true); }}
        />
        {showHistory && recentSearches.length > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '110%', 
            left: 0, 
            right: 0, 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-md)', 
            boxShadow: 'var(--shadow-lg)', 
            zIndex: 50,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', fontWeight: 'bold' }}>
              Recent Searches
            </div>
            {recentSearches.map((historyItem, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSearchQuery(historyItem);
                  setShowHistory(false);
                  saveSearchToHistory(historyItem); // Bump to top
                }}
                style={{
                  padding: '0.8rem 1rem',
                  borderBottom: idx === recentSearches.length - 1 ? 'none' : '1px solid var(--border)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {historyItem}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-bar location-search" style={{ marginBottom: '1.5rem', background: 'var(--bg-input)', position: 'relative' }} ref={dropdownRef}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <input 
          type="text"
          name="location_input"
          placeholder="Enter region or city (e.g. Yaba, Ikeja)" 
          className="search-input"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          autoComplete="off"
        />
        
        {isSearching && (
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Searching...</span>
          </div>
        )}

        {showDropdown && suggestions.length > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '110%', 
            left: 0, 
            right: 0, 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-md)', 
            boxShadow: 'var(--shadow-lg)', 
            zIndex: 50,
            overflow: 'hidden'
          }}>
            {suggestions.map((suggestion, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectLocation(suggestion)}
                style={{
                  padding: '1rem',
                  borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--text-muted)' }}><MapPin size={16} className="inline-icon" /></span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="dashboard-categories" style={{ marginBottom: '1.5rem' }}>
        <div 
          className={`category-pill ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >All</div>
        <div 
          className={`category-pill ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        ><Wrench size={16} className="inline-icon" /> Services</div>
        <div 
          className={`category-pill ${activeTab === 'shops' ? 'active' : ''}`}
          onClick={() => setActiveTab('shops')}
        ><ShoppingBag size={16} className="inline-icon" /> Shops</div>
        <div 
          className={`category-pill ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        ><Building size={16} className="inline-icon" /> Places</div>
        <div 
          className={`category-pill ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        ><Ticket size={16} className="inline-icon" /> Events</div>
      </section>
    </div>
  );
}
