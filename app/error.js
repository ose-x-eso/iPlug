'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#222', color: '#ff8888', minHeight: '100vh' }}>
      <h2 style={{ color: 'white' }}>Something went wrong!</h2>
      <button
        onClick={() => reset()}
        style={{ padding: '0.5rem 1rem', background: 'white', color: 'black', margin: '1rem 0' }}
      >
        Try again
      </button>
      <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#ff5555' }}>{error?.name}: {error?.message}</h3>
        <pre style={{ margin: 0 }}>{error?.stack}</pre>
        {error?.digest && <p style={{ color: '#aaa', marginTop: '1rem' }}>Digest: {error.digest}</p>}
      </div>
    </div>
  );
}
