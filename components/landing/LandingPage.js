/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import { PILLARS, getCategoriesByPillar } from "@/utils/categories";
import { Globe, Search, MessageSquare, Star, CheckCircle2, ChevronRight, Zap, ChevronDown, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DownloadAppModal from './DownloadAppModal';
import './landing.css';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop"
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const FAQ_ITEMS = [
  {
    q: "How does iPlug ensure providers are trustworthy?",
    a: "iPlug uses a strict verification process and chat-gated reviews. A user can only leave a review if they have actually interacted with the provider through the platform, eliminating fake reviews and ensuring absolute authenticity."
  },
  {
    q: "Do I pay for services through the app?",
    a: "No, iPlug is an discovery and negotiation platform. You chat with the provider, agree on a price, and pay them directly in person or via local transfer when the job is done. No middleman fees."
  },
  {
    q: "How does the GPS feature work?",
    a: "We use hyper-local clustering. When you search for 'mechanic', we show you providers starting from your exact street level, expanding outwards. You'll never be matched with a plug across the country."
  },
  {
    q: "Can I list my own business or event?",
    a: "Absolutely! Creating a plug takes less than 60 seconds. Whether you are an artisan, a local shop owner, or organizing an upcoming tech event, you can list it on iPlug and get discovered by people nearby."
  }
];

function FAQAccordion({ faq }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setIsOpen(!isOpen)}>
      <div className="faq-question">
        <h4>{faq.q}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={20} /></motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="faq-answer"
          >
            <p>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing">
      {/* ---- Dynamic Top Bar ---- */}
      <Navbar />

      <DownloadAppModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
        onContinueWeb={() => {
          setIsDownloadModalOpen(false);
          window.dispatchEvent(new CustomEvent('open-auth-modal'));
        }}
      />

      {/* ---- Hero Section ---- */}
      <section className="hero">
        <div className="hero-background">
          {HERO_IMAGES.map((imgSrc, index) => (
            <motion.img 
              key={imgSrc}
              src={imgSrc} 
              alt={`Hero Background ${index + 1}`} 
              className="hero-bg-img"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: index === currentSlide ? 0.6 : 0, 
                scale: index === currentSlide ? 1 : 1.05 
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: index === currentSlide ? 1 : 0 }}
            />
          ))}
          <div className="hero-overlay"></div>
        </div>

        <motion.div 
          className="hero-inner"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <Globe size={14} className="inline-icon" /> Built for Emerging Markets
          </motion.div>

          <motion.h1 variants={itemVariants} className="hero-title">
            The Digital <span className="gradient-text">Marketplace</span>
            <br />For Everything Local
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-subtitle">
            Whether you&apos;re a startup expanding your reach, a freelancer offering digital skills, or a local artisan growing your daily hustle — iPlug bridges the gap. Discover everyday services, find talented professionals, and connect with your city&apos;s pulse, instantly.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-actions" style={{ marginTop: '1.5rem' }}>
             <button onClick={() => setIsDownloadModalOpen(true)} className="btn btn-primary btn-large">
               Get Started Now <ChevronRight size={18} />
             </button>
          </motion.div>

          {/* Search Bar Visualizer */}
          <motion.div variants={itemVariants} className="hero-search-visual" style={{ marginTop: '2.5rem' }}>
            <Search size={20} className="text-muted" />
            <span>Search for "electrician", "tech event", "barber"...</span>
            <div className="search-pill">Search</div>
          </motion.div>
        </motion.div>
      </section>

      {/* ---- Features Bento Grid ---- */}
      <section className="features-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label"><Zap size={14} className="inline-icon" /> Why iPlug</div>
          <h2 className="section-title">A world-class platform <br/>for everyday connections.</h2>
          <p className="section-subtitle">
            Four pillars: Services, Shops, Places, and Events. Empowering local economies.
          </p>
        </motion.div>

        <motion.div 
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.02, rotateX: 1, rotateY: -1 }}
            className="bento-item bento-large bento-gps"
          >
            <div className="bento-content">
              <div className="bento-icon"><Search size={24} /></div>
              <h3>Hyperlocal Discovery</h3>
              <p>Traveling? Instantly discover the best local spots, artisans, and chefs exactly where you are, down to the street level.</p>
            </div>
            <div className="bento-visual map-visual">
               <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" alt="Map View" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.02 }}
            className="bento-item bento-chat"
          >
            <div className="bento-content">
              <div className="bento-icon"><MessageSquare size={24} /></div>
              <h3>Haggle & Chat</h3>
              <p>Message directly. Send voice notes. Negotiate prices just like you would in a real Nigerian market.</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.02 }}
            className="bento-item bento-trust"
          >
            <div className="bento-content">
              <div className="bento-icon"><Ticket size={24} /></div>
              <h3>Event Publicity</h3>
              <p>Hosting a tech meetup or party? Push your content and create massive local awareness.</p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.02, rotateX: -1, rotateY: 1 }}
            className="bento-item bento-wide bento-reviews"
          >
            <div className="bento-content">
              <div className="bento-icon"><Star size={24} /></div>
              <h3>Zero Fake Reviews</h3>
              <p>Our review system is strictly chat-gated. If you haven't interacted, you can't review. Giving power back to authentic local feedback.</p>
            </div>
            <div className="bento-visual review-visual">
               <div className="mock-review"><Star size={12} fill="var(--warning)" color="var(--warning)" className="inline-icon" /> "Fixed my AC perfectly. Highly recommended!"</div>
               <div className="mock-review"><Star size={12} fill="var(--warning)" color="var(--warning)" className="inline-icon" /> "The Jollof was amazing, real authentic taste."</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ---- How It Works (Visual Steps) ---- */}
      <section className="how-it-works-section">
        <div className="how-it-works-inner">
          <motion.div 
            className="how-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Four simple steps to your next plug</h2>
            
            <div className="steps-list">
              {[
                { num: "1", title: "Search", desc: "Type what you need — 'electrician', 'umbrella', 'tech event'." },
                { num: "2", title: "Chat & Agree", desc: "Message the provider directly to negotiate price and terms." },
                { num: "3", title: "Meet & Connect", desc: "Follow directions to the shop or meet the service provider." },
                { num: "4", title: "Rate & Review", desc: "Leave an honest review to help others." }
              ].map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{step.num}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="how-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ perspective: 1000 }}
          >
             <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" 
                alt="Local Pro" 
                className="pro-img" 
             />
             <motion.div 
               className="floating-card pos-1"
               initial={{ y: 20, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
             >
                <div className="mock-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=100&auto=format&fit=crop')", backgroundSize: 'cover' }}></div>
                <div className="mock-text">
                  <div className="mock-line short"></div>
                  <div className="mock-line long"></div>
                </div>
             </motion.div>
             <motion.div 
               className="floating-card pos-2"
               initial={{ y: 20, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               viewport={{ once: true }}
             >
                <MessageSquare size={16} className="inline-icon" /> "I can be there in 15 mins."
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- FAQ Section ---- */}
      <section className="faq-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="section-title">Frequently Asked Questions</h2>
        </motion.div>

        <div className="faq-list">
          {FAQ_ITEMS.map((faq, i) => (
            <FAQAccordion key={i} faq={faq} />
          ))}
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="cta-section">
        <motion.div 
          className="cta-inner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Ready to find your plug?</h2>
          <p className="section-subtitle">Join thousands of users discovering local services, shops, and events on iPlug today.</p>
          <div className="cta-actions">
             <button onClick={() => setIsDownloadModalOpen(true)} className="btn btn-primary btn-large">
               Download the App <ChevronRight size={18} />
             </button>
          </div>
        </motion.div>
      </section>
      
      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
             <div className="logo-text">iPlug</div>
             <p>Connecting emerging markets. Find your plug anywhere, instantly.</p>
             <div className="social-links" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <a href="#" className="social-icon" style={{ fontWeight: 'bold' }}>X</a>
                <a href="#" className="social-icon" style={{ fontWeight: 'bold' }}>IG</a>
                <a href="#" className="social-icon" style={{ fontWeight: 'bold' }}>IN</a>
             </div>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Download</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Trust & Safety</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} iPlug Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
