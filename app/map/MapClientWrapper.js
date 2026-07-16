'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
      <p>Loading Map...</p>
    </div>
  )
});

export default function MapClientWrapper({ initialPlugs }) {
  return <MapComponent initialPlugs={initialPlugs} />;
}
