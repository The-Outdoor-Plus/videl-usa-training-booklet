import React from 'react';
import './FeatureDetails.css';
import { Feature } from '../data/features';

interface FeatureDetailsProps {
  feature: Feature | null;
  isVisible: boolean;
  onClose: () => void;
}

const FeatureDetails: React.FC<FeatureDetailsProps> = ({ feature, isVisible, onClose }) => {
  if (!feature) {
    return null; // Don't render if no feature is active
  }

  // Add a class based on visibility for CSS transitions
  const className = `feature-details ${isVisible ? 'visible' : ''}`;

  return (
    <div className={className}>
      <h2>{feature.name}</h2>
      <p>{feature.description}</p>
      <button onClick={onClose} className="close-button" aria-label="Close feature details">
        &times; {/* Simple close icon */}
      </button>
    </div>
  );
};

export default FeatureDetails; 