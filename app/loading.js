export default function Loading() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh', paddingBottom: '90px' }}>
      {/* Topbar Skeleton */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: '4px' }}></div>
      </div>
      
      <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Toggle Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="skeleton" style={{ width: '220px', height: '40px', borderRadius: '100px' }}></div>
        </div>
        
        {/* Sections Skeletons */}
        {[1, 2, 3].map((section) => (
          <div key={section} style={{ marginBottom: '2rem' }}>
            <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '1rem', borderRadius: '4px' }}></div>
            <div style={{ display: 'flex', gap: '1rem', overflow: 'hidden' }}>
              {[1, 2, 3, 4].map((card) => (
                <div key={card} style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '8px' }}></div>
                  <div className="skeleton" style={{ width: '140px', height: '16px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ width: '100px', height: '12px', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
