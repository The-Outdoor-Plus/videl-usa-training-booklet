import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
// import LegacyContent from './LegacyContent'; // No longer rendered here
import './LandingAnimation.css';
// import { LEGACY_SECTION_ID } from '../App'; // Remove import

// Re-define the ID needed for getElementById
const LEGACY_SECTION_ID = 'legacy-section'; 

interface LandingAnimationProps {
  // Rename callback for clarity
  onAutoScrollComplete: () => void; 
}

const LandingAnimation: React.FC<LandingAnimationProps> = ({ onAutoScrollComplete }) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Landing Animation Mounted");
    const logo = logoRef.current;
    if (!logo) {
        console.error("Landing logo ref not found!");
        return;
    }

    let tl: gsap.core.Timeline | null = null; // Define timeline variable

    // Delay calculation slightly to ensure target element is ready
    const rafId = requestAnimationFrame(() => {
        const legacySectionElement = document.getElementById(LEGACY_SECTION_ID);
        let targetScroll = window.innerHeight; // Default fallback
        if (legacySectionElement) {
            const rect = legacySectionElement.getBoundingClientRect();
            targetScroll = rect.top + window.scrollY;
            console.log(`Target scroll position calculated: ${targetScroll} (from element top: ${rect.top})`);
        } else {
            console.warn("Legacy section element not found for scroll calculation, falling back to viewport height.");
        }

        tl = gsap.timeline({ 
            delay: 0.1, // Shorter delay now calculation is deferred
            onComplete: () => {
                console.log("Landing Animation Timeline Complete");
                onAutoScrollComplete(); 
            } 
        });

        gsap.set(logo, { opacity: 0 });

        tl.to(logo, { opacity: 1, duration: 1.5, ease: 'power2.inOut' })
          .to(window, { 
              scrollTo: { y: targetScroll, autoKill: true }, 
              duration: 2.0, 
              ease: 'power1.inOut' 
          }, ">+=0.5")
          .to(logo, { 
              opacity: 0, 
              duration: 0.8, // Ensure fade out completes before scroll ends
              ease: 'power1.in' 
          }, "<+=0.7"); // Start fade later in scroll, ensure it finishes
    });

    return () => {
        cancelAnimationFrame(rafId); // Cleanup RAF
        tl?.kill(); // Cleanup timeline
        console.log("Landing Animation Cleanup");
    };

  }, [onAutoScrollComplete]);

  return (
    <div ref={containerRef} className="landing-animation-container" style={{ height: '100vh', pointerEvents: 'none' }}>
       {/* Render the initial centered logo */}
       <img 
            ref={logoRef} 
            src="/videl_white_logo.png" 
            alt="Videl USA Logo" 
            className="landing-logo" // Needs CSS for fixed center
        />
    </div>
  );
};

export default LandingAnimation; 