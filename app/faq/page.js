'use client';

import { useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const ALL_FAQS = [
  {
    q: "What exactly is iPlug?",
    a: "iPlug is your city in your pocket. It's a live map that allows you to discover local artisans, find services, locate events, and even receive critical safety broadcasts based on your exact location."
  },
  {
    q: "How does iPlug ensure providers are trustworthy?",
    a: "iPlug uses a strict verification process and chat-gated reviews. A user can only leave a review if they have actually interacted with the provider through the platform, eliminating fake reviews and ensuring absolute authenticity."
  },
  {
    q: "Do I pay for services through the app?",
    a: "Currently, no. iPlug is a discovery and negotiation platform. You chat with the provider, agree on a price, and pay them directly when the job is done. While we may incorporate secure middleman escrow roles in the future, for now, there are zero middleman fees."
  },
  {
    q: "How does the GPS clustering feature work?",
    a: "We use hyper-local clustering. When you search for 'mechanic', we show you providers starting from your exact street level, expanding outwards. You'll never be matched with a plug across the country unless you activate Global Discovery mode."
  },
  {
    q: "Can I list my own business or event?",
    a: "Absolutely! Creating a plug takes less than 60 seconds. Whether you are an artisan, a local shop owner, or organizing an upcoming tech event, you can list it on iPlug and get discovered by people nearby."
  },
  {
    q: "What is Civic Broadcasting?",
    a: "Verified government officials, local agencies, and community leaders can use iPlug as a real-time geographic information system. They can instantly push critical updates, safety alerts, or news directly to the feeds of residents within specific coordinates."
  },
  {
    q: "Is there a limit to how many plugs I can create?",
    a: "Standard users can create up to 5 free plugs. If you run multiple businesses or organize numerous events, you can upgrade your account to create unlimited plugs."
  },
  {
    q: "What is Global Discovery mode?",
    a: "By default, iPlug shows you what's happening immediately around you. However, you can toggle Global Discovery to cast your net worldwide, allowing you to explore the cultural and economic heartbeat of distant cities and regions."
  }
];

function FAQAccordion({ faq }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '1rem'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
        <h4>{faq.q}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={20} /></motion.div>
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        style={{ overflow: 'hidden', color: 'var(--text-muted)', lineHeight: '1.6' }}
      >
        <p style={{ marginTop: '1rem' }}>{faq.a}</p>
      </motion.div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '100px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4rem', fontSize: '1.1rem' }}>Everything you need to know about iPlug, from hyper-local discovery to civic broadcasting.</p>
        
        <div>
          {ALL_FAQS.map((faq, i) => (
            <FAQAccordion key={i} faq={faq} />
          ))}
        </div>
      </div>
    </main>
  );
}
