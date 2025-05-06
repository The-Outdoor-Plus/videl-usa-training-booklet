import { Feature, commercialGrillFeatures, fiveBurnerGrillFeatures, fourBurnerGrillFeatures } from './features';
// Interface for a single product
export interface Product {
  id: string; // Unique ID (e.g., used in URL)
  name: string; // Display name
  listImage: string; // Image for the product list page
  mainImage: string; // Main image for the interactive viewer
  features: Feature[]; // Array of features specific to this product
}

// --- Sample Product Data ---

// Import or define features for the first product (our current grill)
// Let's assume the features from 'features.ts' belong to this grill

// Add more product feature imports here as needed
// import { features as otherGrillFeatures } from './otherFeatures'; 

export const products: Product[] = [
  {
    id: 'commercial-grill-36inch-vg-3b36',
    name: 'Videl 36" Commercial Premium Grill',
    listImage: '/commercial_grill.png', // Placeholder list image
    mainImage: '/features/commercial/commercial_grill.png', // The main image we've been using
    features: commercialGrillFeatures, // Use the imported features
  },
  {
    id: '42-grill-5-burner',
    name: 'Videl 42" 5 Burner Grill',
    listImage: '/42-grill-5-burner.png',
    mainImage: '/features/42-grill-5-burner/42-grill-5-burner.png',
    features: fiveBurnerGrillFeatures,
  },
  {
    id: '36-grill-4-burner',
    name: 'Videl 36" 4 Burner Grill',
    listImage: '/36-grill-4-burner.png',
    mainImage: '/features/36-grill-4-burner/36-grill-4-burner.png',
    features: fourBurnerGrillFeatures,
  }, 
  // --- Add more products below ---
]; 