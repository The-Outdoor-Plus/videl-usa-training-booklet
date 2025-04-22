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
}

const FeatureDetailView: React.FC<FeatureDetailViewProps> = ({ feature, isVisible, onClose }) => {
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && viewRef.current) {
      // Animate In
      gsap.fromTo(viewRef.current, 
        { scale: 0.5, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    } else if (!isVisible && viewRef.current) {
      // Ensure it's hidden initially or when isVisible turns false before animation out
      // (The parent component handles the animation out sequence)
      gsap.set(viewRef.current, { opacity: 0, scale: 0.5 });
    }
  }, [isVisible]);

  if (!feature) {
    // While feature is null but view might be animating out, render nothing logical
    // Or keep rendering the last feature during fade out? For now, return null.
    return null; 
  }

  // Render only when intended to be visible, useEffect handles animation
  return (
    <div 
      ref={viewRef}
      className={`feature-detail-view ${isVisible ? 'visible' : ''}`}
      style={{ opacity: 0 }} // Start hidden, GSAP will take over
    >
      <button onClick={onClose} className="close-view-button" aria-label="Close feature view">&times;</button>
      <div className="view-content">
        <div className="text-content">
            <h2>{feature.name}</h2>
            <p>{feature.description}</p>
        </div>
        {feature.closeupImage && (
            <div className="image-content">
                <img 
                    src={feature.closeupImage} // Use feature image, fallback needed?
                alt={`Closeup of ${feature.name}`} 
            />
            </div>
        )}
      </div>
    </div>
  );
};

export default FeatureDetailView; 