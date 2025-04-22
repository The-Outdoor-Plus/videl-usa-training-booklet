import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Explicitly import ScrollTrigger
// Ensure plugins registered in main.tsx or App.tsx

import LandingAnimation from '../components/LandingAnimation'; 
import LegacyContent from '../components/LegacyContent';
import '../App.css'; // Reuse some app styles if needed

// Constants - Define locally or import if shared
const NEW_BACKGROUND_COLOR = 'rgb(250, 246, 242)'; // New color
const BLACK = '#000000';
// const LEGACY_SECTION_ID = 'legacy-section'; // Remove unused

type LandingStage = 'initial' | 'legacyVisible'; // Only two stages needed here

const LandingSequencePage: React.FC = () => {
  const [landingStage, setLandingStage] = useState<LandingStage>('initial');
  const legacyContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Hook for navigation

  // --- Callback from Initial Animation ---
  const handleAutoScrollComplete = () => {
    console.log("Auto Scroll Complete, revealing Legacy");
    setLandingStage('legacyVisible');
    // Fade in legacy container (which contains already rendered content)
    if (legacyContainerRef.current) {
      gsap.to(legacyContainerRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
       // Optional: Fade in internal elements (can be handled by CSS too)
       gsap.fromTo(legacyContainerRef.current.querySelectorAll('.legacy-text-overlay, .legacy-logo'), 
           { opacity: 0, y: 10 }, 
           { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, delay: 0.3, ease: 'power2.out' } 
       );
    }
  };

  // --- Scroll Trigger for Legacy Pin & Background Transition ---
  useLayoutEffect(() => {
    let st: ScrollTrigger | undefined;
    // Add check for ScrollTrigger existence
    if (landingStage === 'legacyVisible' && legacyContainerRef.current && ScrollTrigger) { 
      console.log("Setting up Legacy ScrollTrigger");
      const legacyContainer = legacyContainerRef.current;
      gsap.set(legacyContainer, { opacity: 1 }); 

      st = ScrollTrigger.create({
        trigger: legacyContainer,
        start: "top top", 
        end: "+=500", 
        scrub: 1, 
        pin: true,
        pinSpacing: true, // Use spacing for simplicity unless it causes issues
        // markers: true, 
        animation: gsap.timeline()
             .to(document.body, { backgroundColor: NEW_BACKGROUND_COLOR, ease: 'none' }, 0) 
             .to(legacyContainer.querySelectorAll('.legacy-text-overlay, .legacy-text-overlay h1, .legacy-text-overlay h2, .legacy-text-overlay p'), 
                 { color: BLACK, ease: 'none' }, 0)
             .to(legacyContainer.querySelectorAll('.videl-usa-subtitle, .behind-name h3'), 
                 { color: '#BF0A30' }, 0)
             .to(legacyContainer.querySelector('.legacy-text-overlay'), 
                 { backgroundColor: 'transparent' }, 0),
        onEnter: () => console.log("Pin Active - BG/Text change start"),
        onLeave: () => {
            console.log("Pin Leave (Forward) - Navigating to /products");
            // Navigate to the main app route when scroll finishes
            navigate('/products');
            // Note: ScrollTrigger might keep running until cleanup, 
            // but navigation should effectively stop interaction here.
        },
        onEnterBack: () => {
            console.log("Pin EnterBack - Reverting BG/Text");
            // Background/text color is handled by the scrubbing animation itself
            // No need to manually set state here if scrubbing back reverses it.
        },
      });
    } else if (!ScrollTrigger) {
        console.error("ScrollTrigger plugin not registered or available!");
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up Legacy ScrollTrigger");
      st?.kill();
      // Reset background when leaving this page/component?
      // document.body.style.backgroundColor = BLACK;
    };
  }, [landingStage, navigate]); // Add navigate to dependencies

  // --- Initial Body Style ---
  useEffect(() => {
      document.body.style.backgroundColor = BLACK;
      document.body.style.overflow = 'auto'; 
      document.documentElement.style.overflow = 'auto';
      window.scrollTo(0, 0); // Ensure starting at top

      // Optional: Reset background on unmount (might cause flash)
      // return () => { document.body.style.backgroundColor = NEW_BACKGROUND_COLOR; };
  }, []);

  return (
    <div className="landing-sequence-page">
      {/* Initial Animation Layer - Renders only initially */} 
      {landingStage === 'initial' && (
        <LandingAnimation onAutoScrollComplete={handleAutoScrollComplete} />
      )}

      {/* Legacy Content Section - Always in DOM after initial for scroll calc, visibility handled by GSAP */} 
      <div 
        ref={legacyContainerRef} 
        id="legacy-container" 
        style={{
            width: '100%',
            position: 'relative', 
            minHeight: '100vh', 
            opacity: 0, // Start hidden, GSAP fades in
        }}
      >
        <LegacyContent /> 
      </div>
    </div>
  );
};

export default LandingSequencePage; 