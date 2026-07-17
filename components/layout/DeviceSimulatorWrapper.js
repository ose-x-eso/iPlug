/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import './simulator.css';

export default function DeviceSimulatorWrapper({ children }) {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      
      // Calculate and set simulator scale to ensure it fits any screen height
      if (window.innerHeight > 0) {
        // Base device height is 844 + padding = ~900px
        const requiredHeight = 900;
        const availableHeight = window.innerHeight;
        // Keep 20px padding top/bottom at least
        const maxAllowedHeight = availableHeight - 40;
        
        let scale = 1;
        if (requiredHeight > maxAllowedHeight) {
          scale = maxAllowedHeight / requiredHeight;
        }
        document.documentElement.style.setProperty('--simulator-scale', scale);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSimulator = () => {
    const newMode = !isSimulatorMode;
    setIsSimulatorMode(newMode);
    localStorage.setItem('iplug_simulator_mode', String(newMode));
  };

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`app-wrapper ${isSimulatorMode ? 'simulator-active' : ''}`}>
        {isSimulatorMode ? (
          <div className="simulator-environment">
            <div className="simulator-bg"></div>
            
            <div className="device-frame">
              <div className="device-notch">
                <div className="device-camera"></div>
                <div className="device-speaker"></div>
              </div>
              <div className="device-screen">
                <div className="device-screen-scrollable">
                  {children}
                </div>
              </div>
              
              {/* Hardware buttons */}
              <div className="device-button volume-up"></div>
              <div className="device-button volume-down"></div>
              <div className="device-button power"></div>
            </div>
          </div>
        ) : (
          <div className="desktop-environment">
            {children}
          </div>
        )}
      </div>

      <button 
        className="simulator-toggle-btn" 
        onClick={toggleSimulator}
        title={isSimulatorMode ? "Switch to Desktop View" : "Simulate Mobile Device"}
      >
        {isSimulatorMode ? (
          <><Monitor size={18} /> Desktop View</>
        ) : (
          <><Smartphone size={18} /> Mobile App View</>
        )}
      </button>
    </>
  );
}
