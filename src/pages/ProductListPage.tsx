import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap'; // Import gsap
import { products } from '../data/products'; // Import the product data
import './ProductListPage.css'; // We'll create this CSS file

const ProductListPage: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Intro Animation
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.product-card');
    if (cards && cards.length > 0) {
        gsap.fromTo(cards, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
    }
  }, []);

  return (
    <div className="product-list-page">
      {/* Removed the h2 title for cleaner look matching screenshot */}
      <div className="product-grid" ref={gridRef}>
        {products.map((product) => (
          <Link to={`/products/${product.id}`} key={product.id} className="product-card">
            {/* This container now holds the image and the accent */}
            <div className="product-image-container">
              <img src={product.listImage} alt={product.name} className="product-list-image" />
              {/* The accent element, styled by CSS */}
              <div className="red-accent"></div>
            </div>
            {/* Product name below the image container */}
            <h3 className="product-name">{product.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage; 