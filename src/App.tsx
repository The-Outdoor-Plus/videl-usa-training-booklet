import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Ensure GSAP plugins are registered somewhere before use (e.g., main.tsx)
// import { gsap } from 'gsap'; 
// import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

// Import Page/Layout Components
import LandingSequencePage from './pages/LandingSequencePage';
import MainLayout from './layouts/MainLayout';
import ProductListPage from './pages/ProductListPage';
import ProductInteractiveViewer from './components/ProductInteractiveViewer';

// Import Global CSS
import './App.css';

function App() {
  // App component is now just the Router setup
  return (
    <Router>
      <Routes>
        {/* Landing Sequence Route */}
        <Route path="/" element={<LandingSequencePage />} />

        {/* Main Application Routes (use MainLayout) */}
        <Route path="/products" element={<MainLayout />}>
          {/* Index route for /products (list page) */}
          <Route index element={<ProductListPage />} /> 
          {/* Route for specific product viewer */}
          <Route path=":productId" element={<ProductInteractiveViewer />} />
        </Route>

        {/* Optional: Redirect base path or add 404 */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
