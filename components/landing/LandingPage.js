'use client';

import Navbar from "@/components/layout/Navbar";
import { PILLARS, getCategoriesByPillar } from "@/utils/categories";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ---- Dynamic Top Bar ---- */}
      <Navbar />

      {/* ---- Hero Section ---- */}
      <section className="hero">
        <div className="hero-inner anim-up">
          <div className="hero-badge">
            🌍 Built for Emerging Markets
          </div>

          <h1 className="hero-title">
            Find Your <span className="gradient-text">Plug</span>,
            <br />Anywhere You Are
          </h1>

          <p className="hero-subtitle">
            Need an electrician? Looking for a shop? Finding a gym?
            Stop asking around — iPlugg connects you with services, shops,
            and places near you in seconds.
          </p>

          {/* Search Bar */}
          <div className="search-bar anim-up delay-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search for electrician, barber, gym...</span>
          </div>

          {/* Pillar Cards */}
          <div className="pillars anim-up delay-2">
            {Object.entries(PILLARS).map(([key, pillar]) => (
              <div key={key} className="pillar-card">
                <span className="pillar-icon">{pillar.icon}</span>
                <span className="pillar-label">{pillar.label}</span>
                <span className="pillar-count">{getCategoriesByPillar(key).length} categories</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-strip anim-up delay-3">
            <div className="stat">
              <div className="stat-value">30+</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat">
              <div className="stat-value">GPS</div>
              <div className="stat-label">Street-level</div>
            </div>
            <div className="stat">
              <div className="stat-value">Free</div>
              <div className="stat-label">To Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features Grid ---- */}
      <section className="features">
        <div className="section-header">
          <div className="section-label">Why iPlugg</div>
          <h2 className="section-title">Everything you need, right in your area</h2>
          <p className="section-subtitle">
            Three pillars, one app. Find services, products, and places — all near you.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card anim-up delay-1">
            <div className="feature-icon-wrap">🔍</div>
            <h3>GPS Discovery</h3>
            <p>Find providers and shops near your exact location. Street-level precision.</p>
          </div>

          <div className="feature-card anim-up delay-2">
            <div className="feature-icon-wrap">💬</div>
            <h3>Chat & Negotiate</h3>
            <p>Message directly. Send voice notes. Haggle on price — just like a real market.</p>
          </div>

          <div className="feature-card anim-up delay-3">
            <div className="feature-icon-wrap">✅</div>
            <h3>Verified Providers</h3>
            <p>Verified badges build trust. Know who you're dealing with before you meet.</p>
          </div>

          <div className="feature-card anim-up delay-4">
            <div className="feature-icon-wrap">⭐</div>
            <h3>Honest Reviews</h3>
            <p>Chat-gated reviews only. You must interact before you can rate. No fakes.</p>
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="how-it-works">
        <div className="section-header">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Four simple steps</h2>
        </div>

        <div className="steps">
          <div className="step anim-up delay-1">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Search</h3>
              <p>Type what you need — "electrician", "umbrella", "gym". See results near you instantly.</p>
            </div>
          </div>

          <div className="step anim-up delay-2">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Chat & Agree</h3>
              <p>Message the provider directly. Negotiate price, discuss details, agree on terms.</p>
            </div>
          </div>

          <div className="step anim-up delay-3">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Meet & Connect</h3>
              <p>Follow directions to the shop or meet the service provider. Pay in person.</p>
            </div>
          </div>

          <div className="step anim-up delay-4">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Rate & Review</h3>
              <p>Leave an honest review to help others find trustworthy plugs in your area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="cta-section">
        <h2 className="section-title">Ready to find your plug?</h2>
        <p>Join iPlugg and never ask around again.</p>
        <button className="btn btn-primary btn-lg">
          Get Started — It's Free
        </button>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        © 2026 iPlugg. Built for the Global South 🌍
      </footer>
    </div>
  );
}
