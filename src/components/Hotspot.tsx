import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './Hotspot.css';
import { Feature } from '../data/features'; // Import the Feature type

interface HotspotProps {
  feature: Feature; // Use the Feature type for the prop
  onClick: (feature: Feature) => void;
  className?: string; // Add optional className prop
  nonInteractive?: boolean;
}

const Hotspot: React.FC<HotspotProps> = ({ feature, onClick, className, nonInteractive = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // Show hover preview if closeupImage exists, regardless of interactivity
    if (feature.closeupImage) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    if (feature.closeupImage && previewRef.current) {
      const previewElement = previewRef.current;
      gsap.killTweensOf(previewElement);

      if (isHovering) {
        gsap.to(previewElement, { 
          opacity: 1, 
          scale: 1, 
          y: '-5px',
          visibility: 'visible', 
          duration: 0.2, 
          ease: 'power1.out' 
        });
      } else {
        gsap.to(previewElement, { 
          opacity: 0, 
          scale: 0.9, 
          y: '0px',
          duration: 0.15, 
          ease: 'power1.in', 
          onComplete: () => {
            gsap.set(previewElement, { visibility: 'hidden' });
          }
        });
      }
    }
  }, [isHovering, feature.closeupImage]);

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '120%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '120px',
    height: '120px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
    zIndex: 10,
    pointerEvents: 'none',
    opacity: 0,
    scale: 0.9,
    visibility: 'hidden',
  };

  const previewImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div 
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