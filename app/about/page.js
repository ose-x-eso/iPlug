import Navbar from "@/components/layout/Navbar";
import { Map, Users, Globe, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ padding: '120px 20px 60px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,107,53,0.05) 0%, transparent 100%)' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Mapping the <span style={{ background: 'linear-gradient(90deg, #FF6B35, #FF3D71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Human Environment</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          Your exact geographic coordinates should unlock the entire cultural, economic, and civic pulse of your environment. iPlug is the ultimate network for everything local, connecting you to the physical world right outside your door.
        </p>
      </section>

      {/* Core Mission */}
      <section style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            The digital world is perfectly mapped, but the physical world remains chaotic and disconnected. iPlug was founded on a simple premise: your exact geographic coordinates should unlock the entire cultural, economic, and civic pulse of your environment.
          </p>
          <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            Whether you're moving to a new city and need to find trusted locals, a freelancer looking to offer services to your immediate neighborhood, or a government agency broadcasting critical alerts to a specific radius, iPlug is the unified layer that makes it happen.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Map size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Hyper-Local First</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>We prioritize what is immediately around you. Our clustering algorithms ensure that discovery starts at the street level and expands organically.</p>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(33, 179, 166, 0.1)', color: '#21B3A6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Zero Fake Reviews</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Trust is our currency. By strictly gating our review system to only those who have engaged in verified chats, we've eliminated algorithmic manipulation.</p>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Peer-to-Peer</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>We don't stand in the middle. Connect directly, negotiate on your terms, and complete interactions in the real world without hidden fees.</p>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(157, 78, 221, 0.1)', color: '#9D4EDD', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Globe size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Global Reach</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>While rooted locally, iPlug is built for the globe. Our Global Discovery mode lets you project your presence worldwide or explore distant environments.</p>
        </div>

      </section>

      {/* Footer Teaser */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Ready to shape your environment?</h2>
        <a href="/" style={{ display: 'inline-flex', background: 'var(--accent-flat)', color: 'white', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: '600', fontSize: '1.1rem' }}>
          Explore iPlug Today
        </a>
      </section>

    </main>
  );
}
