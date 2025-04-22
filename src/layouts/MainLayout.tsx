import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const FINAL_BACKGROUND_COLOR = 'rgb(250, 246, 242)'; // Use new color

const MainLayout: React.FC = () => {
  const location = useLocation();

  // Ensure background is correct and scroll is reset when navigating within main app
  useEffect(() => {
    document.body.style.backgroundColor = FINAL_BACKGROUND_COLOR;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [location.pathname]); // Rerun effect when route path changes

  return (
    <>
      <header className="App-header"> {/* Use existing App.css class */}
        <img src="/videl_black_logo.png" alt="Videl USA Logo" className="header-logo" />
      </header>
      <main className="App-main"> {/* Use existing App.css class */}
        <Outlet /> {/* Renders the nested route component (List or Viewer) */}
      </main>
      <footer className="App-footer"> {/* Use existing App.css class */}
        <p>&copy; 2024 Videl USA. All rights reserved.</p>
      </footer>
    </>
  );
};

export default MainLayout; 