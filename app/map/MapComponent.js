'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to recenter map when location is found
function LocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

const civicIcon = new L.divIcon({
  className: 'civic-marker-wrapper',
  html: `<div style="
    width: 24px; 
    height: 24px; 
    background: #ef4444; 
    border-radius: 50%; 
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(239,68,68,0.8), 0 0 0 0 rgba(239, 68, 68, 0.7); 
    animation: civic-pulse 2s infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
  ">!</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapComponent({ initialPlugs = [], initialBroadcasts = [] }) {
  const [position, setPosition] = useState(null);

  // Derive mapped plugs during render instead of effect to avoid cascading render
  const plugs = React.useMemo(() => {
    const center = position || [37.7749, -122.4194]; // Default SF if no position
    
    return initialPlugs.flatMap(plug => {
      // If it uses the new multi-location array
      if (plug.locations && plug.locations.length > 0) {
        return plug.locations.map((loc, i) => {
          let lat = loc.latitude;
          let lng = loc.longitude;
          if (!lat || !lng) {
            lat = center[0] + (Math.random() - 0.5) * 0.1;
            lng = center[1] + (Math.random() - 0.5) * 0.1;
          }
          return { ...plug, markerId: `${plug.id}-${i}`, latitude: lat, longitude: lng, displayAddress: loc.address };
        });
      }
      
      // Fallback for legacy data
      let lat = plug.latitude;
      let lng = plug.longitude;
      if (!lat || !lng) {
        lat = center[0] + (Math.random() - 0.5) * 0.1;
        lng = center[1] + (Math.random() - 0.5) * 0.1;
      }
      return [{ ...plug, markerId: plug.id, latitude: lat, longitude: lng, displayAddress: plug.address }];
    });
  }, [initialPlugs, position]);

  useEffect(() => {
    let timeoutId;
    
    // Attempt to load last known location from localStorage to avoid jumping to SF immediately
    try {
      const saved = localStorage.getItem('iplug_last_location');
      if (saved) {
        setPosition(JSON.parse(saved));
      }
    } catch (e) {}

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          clearTimeout(timeoutId);
          const newPos = [loc.coords.latitude, loc.coords.longitude];
          setPosition(newPos);
          try { localStorage.setItem('iplug_last_location', JSON.stringify(newPos)); } catch (e) {}
        },
        (err) => {
          console.warn("Geolocation warning:", err.message);
          clearTimeout(timeoutId);
          // Only fallback to SF if we don't have a saved position
          setPosition(prev => prev || [37.7749, -122.4194]);
        },
        { timeout: 10000 } // Increased to 10 seconds for mobile/slow networks
      );
      
      // Fallback if geolocation hangs completely
      timeoutId = setTimeout(() => {
        setPosition(prev => prev || [37.7749, -122.4194]);
      }, 10000);
    } else {
      setTimeout(() => setPosition(prev => prev || [37.7749, -122.4194]), 0);
    }
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (!position) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
        <p>Locating you...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark mode tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <LocationMarker position={position} />
        
        {plugs.map((plug) => (
          <Marker 
            key={plug.markerId} 
            position={[plug.latitude, plug.longitude]}
          >
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>{plug.title}</h3>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#666' }}>{plug.category}</p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>{plug.displayAddress}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {plug.profiles?.avatar_url ? (
                      <img src={plug.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#fff' }}>{plug.profiles?.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>{plug.profiles?.username}</span>
                </div>
                <Link 
                  href={`/plug/${plug.id}`}
                  style={{ display: 'block', background: 'var(--primary)', color: '#fff', textAlign: 'center', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  View Plug
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {initialBroadcasts.map((broadcast) => (
          <Marker 
            key={broadcast.id} 
            position={[broadcast.latitude, broadcast.longitude]}
            icon={civicIcon}
          >
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {broadcast.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>
                    {new Date(broadcast.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#ef4444' }}>{broadcast.title}</h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333' }}>{broadcast.description}</p>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#ef4444', textAlign: 'center', fontWeight: '500' }}>
                  Radius: {broadcast.radius_km} km
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes civic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </div>
  );
}
