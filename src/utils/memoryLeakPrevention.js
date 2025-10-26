/**
 * Memory leak prevention utilities
 * Provides tools to prevent common React memory leaks
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// Custom hook to prevent memory leaks from async operations
export const useSafeAsyncState = (initialState) => {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState];
};

// Custom hook for safe API calls
export const useSafeApiCall = () => {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const makeApiCall = useCallback(async (apiFunction, ...args) => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Pass abort signal to API call if supported
      const result = await apiFunction(...args, {
        signal: abortControllerRef.current.signal
      });
      return result;
    } catch (error) {
      // Don't throw if request was aborted
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  }, []);

  return makeApiCall;
};

// Custom hook for cleanup on unmount
export const useCleanup = (cleanupFunction) => {
  useEffect(() => {
    return cleanupFunction;
  }, [cleanupFunction]);
};

// Custom hook for safe intervals
export const useSafeInterval = (callback, delay) => {
  const savedCallback = useRef();
  const intervalRef = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      intervalRef.current = setInterval(tick, delay);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);

  // Manual cleanup function
  const clearSafeInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return clearSafeInterval;
};

// Custom hook for safe timeouts
export const useSafeTimeout = () => {
  const timeoutRef = useRef();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setSafeTimeout = useCallback((callback, delay) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(callback, delay);
    return timeoutRef.current;
  }, []);

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
};

// Custom hook for event listeners with cleanup
export const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    
    if (element && element.addEventListener) {
      element.addEventListener(eventName, eventListener);
      
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    }
  }, [eventName, element]);
};

// Memory leak detector (development only)
export const useMemoryLeakDetector = (componentName) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  renderCountRef.current += 1;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    const mountTime = Date.now();
    mountTimeRef.current = mountTime;

    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTime;
      
      console.log(`[Memory Leak Detector] ${componentName}:`, {
        renderCount: renderCountRef.current,
        lifespan: `${lifespan}ms`,
        mountTime: new Date(mountTime).toISOString(),
        unmountTime: new Date(unmountTime).toISOString()
      });

      // Warn about potential memory leaks
      if (renderCountRef.current > 10) {
        console.warn(`[Memory Leak Warning] ${componentName} rendered ${renderCountRef.current} times. Check for unnecessary re-renders.`);
      }

      if (lifespan < 100) {
        console.warn(`[Memory Leak Warning] ${componentName} unmounted quickly (${lifespan}ms). This might indicate rapid mounting/unmounting.`);
      }
    };
  }, [componentName]);
};

// HOC to wrap components with memory leak protection
export const withMemoryLeakProtection = (WrappedComponent, componentName) => {
  return function MemoryLeakProtectedComponent(props) {
    useMemoryLeakDetector(componentName || WrappedComponent.name);
    return <WrappedComponent {...props} />;
  };
};

// Utility to check for common memory leak patterns
export const checkForMemoryLeaks = () => {
  if (import.meta.env.DEV) {
    // Check for potential memory leaks
    const warnings = [];

    // Check for uncanceled timers
    if (window.setInterval.__called > 0 && window.clearInterval.__called === 0) {
      warnings.push('Potential memory leak: setInterval called without clearInterval');
    }

    // Check for event listeners
    if (window.addEventListener.__called > window.removeEventListener.__called) {
      warnings.push('Potential memory leak: event listeners not properly removed');
    }

    // Check React Fiber nodes (if available)
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.renderers && hook.renderers.size > 0) {
        hook.renderers.forEach((renderer) => {
          if (renderer.getCurrentFiber) {
            const fiber = renderer.getCurrentFiber();
            if (fiber && fiber.memoizedState) {
              // Check for hanging state
              warnings.push('React components with hanging state detected');
            }
          }
        });
      }
    }

    if (warnings.length > 0) {
      console.group('[Memory Leak Checker]');
      warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    return warnings;
  }
  return [];
};

// Initialize memory leak detection (development only)
if (import.meta.env.DEV) {
  // Monkey patch timer functions to track usage
  const originalSetInterval = window.setInterval;
  const originalClearInterval = window.clearInterval;
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.setInterval.__called = 0;
  window.clearInterval.__called = 0;
  window.setTimeout.__called = 0;
  window.clearTimeout.__called = 0;
  window.addEventListener.__called = 0;
  window.removeEventListener.__called = 0;

  window.setInterval = function(...args) {
    window.setInterval.__called++;
    return originalSetInterval.apply(this, args);
  };

  window.clearInterval = function(...args) {
    window.clearInterval.__called++;
    return originalClearInterval.apply(this, args);
  };

  window.setTimeout = function(...args) {
    window.setTimeout.__called++;
    return originalSetTimeout.apply(this, args);
  };

  window.clearTimeout = function(...args) {
    window.clearTimeout.__called++;
    return originalClearTimeout.apply(this, args);
  };

  window.addEventListener = function(...args) {
    window.addEventListener.__called++;
    return originalAddEventListener.apply(this, args);
  };

  window.removeEventListener = function(...args) {
    window.removeEventListener.__called++;
    return originalRemoveEventListener.apply(this, args);
  };

  // Run memory leak check periodically
  setInterval(() => {
    checkForMemoryLeaks();
  }, 30000); // Check every 30 seconds
}