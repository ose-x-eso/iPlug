export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'var(--bg-base)'
    }}>
      <div className="loader-pulse"></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Loading...</p>
    </div>
  );
}
