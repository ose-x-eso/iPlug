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
          element: isMobile ? '#tour-map' : '.desktop-only a[href="/"]',
          popover: {
            title: isMobile ? 'The Map' : 'Home Feed',
            description: 'Discover people, services, and events exactly where they are on the live map.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-post', // Mobile bottom nav post button
          popover: {
            title: 'Post a Plug',
            description: 'Got a skill, shop, or service? Tap here to list yourself on the map and get discovered.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#tour-post-desktop', // Desktop post button
          popover: {
            title: 'Post a Plug',
            description: 'Got a skill, shop, or service? Tap here to list yourself on the map and get discovered.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-login', // Get Started button for logged out users
          popover: {
            title: 'Get Started',
            description: 'Sign in to chat with providers, leave reviews, and post your own plugs!',
            side: 'bottom',
            align: 'end'
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
