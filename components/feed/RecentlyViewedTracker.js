'use client';

import { useEffect } from 'react';

export default function RecentlyViewedTracker({ plug }) {
  useEffect(() => {
    if (!plug) return;
    
    try {
      const historyStr = localStorage.getItem('iplug_recent_plugs');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      // Remove it if it's already in the list so we can push it to the front
      history = history.filter(p => p.id !== plug.id);
      
      // Add to front
      history.unshift({
        id: plug.id,
        title: plug.title,
        image_url: plug.image_url,
        category: plug.category || plug.address
      });
      
      // Keep only last 10
      history = history.slice(0, 10);
      
      localStorage.setItem('iplug_recent_plugs', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to update recently viewed plugs", e);
    }
  }, [plug]);

  return null;
}
