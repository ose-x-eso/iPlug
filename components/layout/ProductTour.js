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
      
      const rawSteps = [
        {
          element: undefined,
          popover: {
            title: 'Welcome to iPlug Hub! 👋',
            description: 'Your city in your pocket. Let\'s show you around the hyperlocal marketplace.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: isMobile ? '#tour-map' : 'a.nav-item[href="/map"]',
          popover: {
            title: 'The Map',
            description: 'Discover people, services, and events exactly where they are on the live map.',
            side: isMobile ? 'bottom' : 'right',
            align: 'start'
          }
        },
        {
          element: isMobile ? 'a.tab-item[href="/"]' : 'a.nav-item[href="/"]',
          popover: {
            title: 'Home Feed',
            description: 'This is your dashboard. Discover trending shops, local services, and events right around you.',
            side: isMobile ? 'top' : 'right',
            align: 'start'
          }
        },
        {
          element: isMobile ? 'a.tab-item[href="/search"]' : 'a.nav-item[href="/search"]',
          popover: {
            title: 'Hyperlocal Search',
            description: 'Looking for a specific skill, shop, or place? Search instantly and find who is closest to you.',
            side: isMobile ? 'top' : 'right',
            align: 'center'
          }
        },
        {
          element: isMobile ? '.tab-action-btn' : '.new-plug-btn',
          popover: {
            title: 'Post a Plug',
            description: 'Got a skill, shop, or service? Tap here to list yourself on the map and get discovered by locals.',
            side: isMobile ? 'top' : 'right',
            align: isMobile ? 'center' : 'end'
          }
        },
        {
          element: isMobile ? 'a.tab-item[href="/messages"]' : 'a.nav-item[href="/messages"]',
          popover: {
            title: 'Direct Inbox',
            description: 'Chat directly with service providers, haggle prices, and negotiate safely without leaving the app.',
            side: isMobile ? 'top' : 'right',
            align: 'end'
          }
        },
        {
          element: undefined,
          popover: {
            title: 'You\'re All Set! 🎉',
            description: 'Your local economy is now at your fingertips. Go ahead and explore what your city has to offer.',
            side: 'bottom',
            align: 'center'
          }
        }
      ];

      // Start the tour after a short delay so the DOM has time to render
      setTimeout(() => {
        // Only include steps where the element actually exists in the DOM right now, 
        // OR where there is no element (like the welcome step)
        const validSteps = rawSteps.filter(step => 
          !step.element || document.querySelector(step.element) !== null
        );

        const driverObj = driver({
          showProgress: true,
          allowClose: false,
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          steps: validSteps,
          onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tour?")) {
              driverObj.destroy();
              localStorage.setItem('iplug_tour_seen', 'true');
            }
          }
        });

        driverObj.drive();
      }, 1000);
    }
  }, []);

  return null; // This component doesn't render any DOM of its own
}
