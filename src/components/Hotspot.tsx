import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import './Hotspot.css';
import { Feature } from '../data/features'; // Import the Feature type

interface HotspotProps {
  feature: Feature; // Use the Feature type for the prop
  onClick: (feature: Feature) => void;
  className?: string; // Add optional className prop
  nonInteractive?: boolean;
  viewerContainerRef?: React.RefObject<HTMLDivElement | null>; // Added viewer container ref
}

const Hotspot: React.FC<HotspotProps> = ({ feature, onClick, className, nonInteractive = false, viewerContainerRef }) => {
  const [isHovering, setIsHovering] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const hotspotDivRef = useRef<HTMLDivElement>(null); // Ref for the main hotspot div

  const handleMouseEnter = () => {
    // Show hover preview if closeupImage exists, regardless of interactivity
    if (feature.closeupImage) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Use useLayoutEffect to set the initial state of the preview element
  // This runs before the browser paints, ensuring no flicker.
  useLayoutEffect(() => {
    if (feature.closeupImage && previewRef.current) {
      gsap.set(previewRef.current, { autoAlpha: 0, scale: 0.9, y: 0 }); // y: 0 for GSAP transform
    }
  }, [feature.closeupImage]); // Rerun if the image source changes

  useEffect(() => {
    if (feature.closeupImage && previewRef.current && hotspotDivRef.current) {
      const previewElement = previewRef.current;
      const hotspotElement = hotspotDivRef.current;
      gsap.killTweensOf(previewElement); // Kill any existing tweens

      if (isHovering) {
        const basePreviewStyle: React.CSSProperties = {
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            // Ensure other necessary styles for measurement are here if not in CSS
            width: '120px', // Assuming fixed width from previewStyle object
            height: '120px', // Assuming fixed height from previewStyle object
        };
        let animationTargetY = '-5px'; // Default animation y offset

        // Apply base styles for measurement, keeping it invisible
        gsap.set(previewElement, { ...basePreviewStyle, visibility: 'hidden', display: 'block', autoAlpha: 0 });
        
        const dynamicStyleChanges: Partial<React.CSSProperties> = {};

        if (viewerContainerRef?.current) {
            const viewerRect = viewerContainerRef.current.getBoundingClientRect();
            const hotspotRect = hotspotElement.getBoundingClientRect();
            const previewRect = previewElement.getBoundingClientRect(); // Measured with base styles
            
            // Vertical check
            if (previewRect.top < viewerRect.top) { // Overflowing top
                dynamicStyleChanges.bottom = 'auto';
                dynamicStyleChanges.top = '100%';
                animationTargetY = '5px'; // Animate downwards
            } else if (previewRect.bottom > viewerRect.bottom) { // Overflowing bottom
                dynamicStyleChanges.bottom = '100%';
                dynamicStyleChanges.top = 'auto';
                // animationTargetY remains '-5px' (upwards)
            }

            // Horizontal check 
            // (Simplified: if preview center is outside, try to align edge)
            // const previewCenterRelativeToHotspotX = hotspotRect.left + (hotspotRect.width / 2) - previewRect.width / 2; 

            if (previewRect.right > viewerRect.right) { // Tends to overflow right
                dynamicStyleChanges.left = 'auto';
                dynamicStyleChanges.right = `calc(50% - ${hotspotRect.width / 2}px)`;// Align right edge of preview with center of hotspot
                dynamicStyleChanges.transform = 'translateX(0%)'; 
            } else if (previewRect.left < viewerRect.left) { // Tends to overflow left
                dynamicStyleChanges.left = `calc(50% - ${hotspotRect.width / 2}px)`;// Align left edge of preview with center of hotspot
                dynamicStyleChanges.right = 'auto';
                dynamicStyleChanges.transform = 'translateX(0%)';
            }
            // Apply dynamic style changes before animation
            gsap.set(previewElement, dynamicStyleChanges);
        }
        // Reset display and visibility for animation
        gsap.set(previewElement, { display: 'block', visibility: 'visible' });

        gsap.to(previewElement, {
          autoAlpha: 1,
          scale: 1,
          y: animationTargetY,
          duration: 0.2,
          ease: 'power1.out'
        });
      } else {
        gsap.to(previewElement, {
          autoAlpha: 0,
          scale: 0.9,
          y: 0, // GSAP transform y
          duration: 0.15,
          ease: 'power1.in',
          onComplete: () => {
            // Reset to default positioning for next hover after it's hidden
            gsap.set(previewElement, {
                bottom: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                top: 'auto',
                right: 'auto',
                y: 0 // Reset GSAP transform y
            });
          }
        });
      }
    }
  }, [isHovering, feature.closeupImage, viewerContainerRef]);

  const previewStyle: React.CSSProperties = {
    // Positioning (bottom, left, transform, top, right) is now mostly dynamic 
    // or set by GSAP. Base appearance styles remain.
    width: '120px',
    height: '120px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
    zIndex: 10,
    pointerEvents: 'none',
    position: 'absolute', // Crucial for GSAP set and calculations
    // visibility, opacity, scale are handled by GSAP's autoAlpha & transforms
  };

  const previewImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div 
      ref={hotspotDivRef} // Attach ref here
      style={{ position: 'absolute', top: `${feature.y}%`, left: `${feature.x}%` }} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`hotspot ${className || ''}${nonInteractive ? 'non-interactive' : ''}`}
        style={{ position: 'relative', transform: 'translate(-50%, -50%)' }}
        onClick={() => !nonInteractive && onClick(feature)}
        aria-label={nonInteractive ? feature.name : `Zoom to ${feature.name}`}
        disabled={nonInteractive}
      >
        <pre>{feature.name}</pre>
      </button>

      {feature.closeupImage && (
        <div ref={previewRef} style={previewStyle} className="hotspot-preview">
          <img 
            src={feature.closeupImage}
            alt={`${feature.name} closeup preview`}
            style={previewImageStyle}
          />
        </div>
      )}
    </div>
  );
};

export default Hotspot; 