import React from 'react';
import './LegacyContent.css';

// Assume the legacy image is in the public folder
const LEGACY_IMAGE_PATH = '/the_legacy.png';
const LEGACY_SECTION_ID = 'legacy-section'; // Define ID here

const LegacyContent: React.FC = () => {
  return (
    <section 
      id={LEGACY_SECTION_ID}
      className="legacy-section" 
      style={{ backgroundImage: `url(${LEGACY_IMAGE_PATH})` }}
    >
      <div className="legacy-text-overlay">
        <div className="videl-usa-subtitle">VIDEL USA</div>
        <h1>THE LEGACY</h1>
        <h2>A TRIBUTE TO FAMILY</h2>
        <p>
          VIDEL USA is a proud leader in Outdoor Luxury Cooking, a division of The
          Outdoor Plus. With the same commitment to premium quality that made The
          Outdoor Plus a leader in the industry.
        </p>
        <p>
          VIDEL USA is here to provide BBQ enthusiasts with the best premium grills
          and components to take their outdoor cooking to the next level.
        </p>
        <div className="behind-name">
          <h3>BEHIND THE NAME</h3>
          <p>Videl is named after Lupe's granddaughters, Vivian & Delilah</p>
        </div>
        {/* Add the bottom logo */}
        <img src="/videl_white_logo.png" alt="Videl USA Logo" className="legacy-logo" />
      </div>
    </section>
  );
};

export default LegacyContent; 