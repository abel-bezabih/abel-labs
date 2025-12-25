'use client';

import { useEffect, useRef } from 'react';

/**
 * Webpack Error Handler
 * 
 * Catches webpack module loading errors and provides automatic recovery
 * Only triggers once per session to avoid reload loops
 */
export function WebpackErrorHandler() {
  const hasReloaded = useRef(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we've already tried to recover in this session
    const sessionKey = 'webpack-error-recovery-attempted';
    if (sessionStorage.getItem(sessionKey)) {
      return; // Don't set up handlers if we've already tried
    }

    // Listen for unhandled errors
    const handleError = (event: ErrorEvent) => {
      // Skip if we've already handled an error
      if (hasReloaded.current) return;

      const error = event.error || event.message || '';
      const errorString = String(error);
      
      // Check if it's a webpack/module loading error
      const isWebpackError = 
        errorString.includes('webpack') ||
        errorString.includes('__webpack_require__') ||
        (errorString.includes('Cannot find module') && event.filename?.includes('webpack')) ||
        (errorString.includes('Module not found') && event.filename?.includes('webpack'));
      
      if (isWebpackError && event.filename) {
        console.warn('Webpack module loading error detected:', errorString.substring(0, 100));
        
        // Mark that we've attempted recovery
        sessionStorage.setItem(sessionKey, 'true');
        hasReloaded.current = true;
        
        // Clear any existing timeout
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current);
        }
        
        // Wait a bit for webpack to finish compiling, then reload
        reloadTimeoutRef.current = setTimeout(() => {
          console.log('Reloading page to recover from webpack error...');
          window.location.reload();
        }, 1500);
      }
    };

    // Listen for unhandled promise rejections (webpack errors sometimes show up here)
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (hasReloaded.current) return;

      const error = String(event.reason || '');
      
      if (error.includes('webpack') || error.includes('__webpack_require__')) {
        console.warn('Webpack promise rejection detected');
        event.preventDefault(); // Prevent default error logging
        
        sessionStorage.setItem(sessionKey, 'true');
        hasReloaded.current = true;
        
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current);
        }
        
        reloadTimeoutRef.current = setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, []);

  return null;
}

