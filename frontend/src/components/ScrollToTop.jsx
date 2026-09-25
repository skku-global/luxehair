import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores the viewport to the top of the page on every route change.
 * Without this, navigating from a long catalog to a product detail page
 * leaves the reader stranded mid-page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
