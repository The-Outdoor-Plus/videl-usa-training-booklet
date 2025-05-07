import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Feature } from '../data/features';
import './FeatureDetailView.css';

// Remove hardcoded path
// const CLOSEUP_IMAGE_PATH = '/closeup.jpg';

interface FeatureDetailViewProps {
  feature: Feature | null;
  isVisible: boolean;
  onClose: () => void;
  isAnimating?: boolean;
}

const FeatureDetailView: React.FC<FeatureDetailViewProps> = ({ 
  feature, 
  isVisible, 
  onClose, 
  isAnimating = false
}) => {
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewRef.current) {
      if (isVisible) {
        gsap.fromTo(viewRef.current, 
          { scale: 0.5, opacity: 0, visibility: 'hidden' },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1, visibility: 'visible' }
        );
      } else {
        const currentOpacity = gsap.getProperty(viewRef.current, "opacity");
        const opacityIsPositive = (typeof currentOpacity === 'number' && currentOpacity > 0) || 
                                (typeof currentOpacity === 'string' && parseFloat(currentOpacity) > 0);

        if (opacityIsPositive) {
            gsap.to(viewRef.current, {
                scale: 0.5, 
                opacity: 0, 
                duration: 0.3, 
                ease: 'power2.in', 
                onComplete: () => {
                    gsap.set(viewRef.current, { visibility: 'hidden' });
                }
            });
        } else {
            gsap.set(viewRef.current, { opacity: 0, scale: 0.5, visibility: 'hidden' });
        }
      }
    }
  }, [isVisible]);

  if (!feature && !isVisible) {
    return null;
  }

  return (
    <div 
      ref={viewRef}
      className={`feature-detail-view ${isVisible ? 'visible' : ''}`}
      style={{ opacity: 0, scale: 0.5, visibility: 'hidden' }}
    >
      <button 
        onClick={onClose} 
        className="close-view-button" 
        aria-label="Close feature view" 
        disabled={isAnimating}
      >
        &times;
      </button>
      <div className="view-content">
        {feature && (
          <>
            <div className="text-content">
                <h2>{feature.name}</h2>
                <p>{feature.description}</p>
            </div>
            {feature.closeupImage && (
                <div className="image-content">
                    <img 
                        src={feature.closeupImage}
                        alt={`Closeup of ${feature.name}`} 
                    />
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeatureDetailView; 