'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function ProductTour() {
  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem('iplug_tour_seen');
    
    if (!hasSeenTour) {
      const isMobile = window.innerWidth <= 768;
      
      const steps = [
        {
          element: isMobile ? '#tour-map' : 'body',
          popover: {
            title: 'Welcome to iPlug Hub! 👋',
            description: 'Your city in your pocket. Let\'s show you around the hyperlocal marketplace.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: isMobile ? '#tour-map' : '.desktop-only a[href="/"]',
          popover: {
            title: 'The Map',
            description: 'Discover people, services, and events exactly where they are on the live map.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: isMobile ? '#tour-post' : '#tour-post-desktop',
          popover: {
            title: 'Post a Plug',
            description: 'Got a skill, shop, or service? Tap here to list yourself on the map and get discovered.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: isMobile ? '#tour-inbox' : '#tour-inbox-desktop',
          popover: {
            title: 'Direct Chat',
            description: 'Message providers directly to negotiate. No middlemen.',
            side: 'top',
            align: 'end'
          }
        }
      ];

      const driverObj = driver({
        showProgress: true,
        allowClose: false,
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        steps: steps.filter(step => step.element !== null),
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tour?")) {
            driverObj.destroy();
            localStorage.setItem('iplug_tour_seen', 'true');
          }
        }
      });

      // Start the tour after a short delay so the DOM has time to render
      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, []);

  return null; // This component doesn't render any DOM of its own
}
