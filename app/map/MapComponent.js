'use client';

import { useState, useEffect } from 'react';
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

export default function MapComponent({ initialPlugs }) {
  const [position, setPosition] = useState(null);
  const [plugs, setPlugs] = useState(initialPlugs);

  useEffect(() => {
    // Generate mock coordinates for plugs that don't have them
    // so they appear around the user or default center.
    // In a real app, these would come from the database.
    const center = position || [37.7749, -122.4194]; // Default SF if no position
    
    const mappedPlugs = initialPlugs.map(plug => {
      if (plug.latitude && plug.longitude) return plug;
      
      // Add small random offset to center (-0.05 to +0.05)
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      return {
        ...plug,
        latitude: center[0] + latOffset,
        longitude: center[1] + lngOffset
      };
    });
    
    setPlugs(mappedPlugs);
  }, [initialPlugs, position]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          setPosition([loc.coords.latitude, loc.coords.longitude]);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Default center if user denies location
          setPosition([37.7749, -122.4194]); // SF
        }
      );
    } else {
      setPosition([37.7749, -122.4194]); // SF
    }
  }, []);

  if (!position) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
        <p>Locating you...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
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
            key={plug.id} 
            position={[plug.latitude, plug.longitude]}
          >
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>{plug.title}</h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>{plug.category}</p>
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
      </MapContainer>
    </div>
  );
}
