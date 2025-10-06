import { useEffect, useRef } from 'react';

/**
 * Custom hook for enhanced scrollbar animation and control
 * @param {Object} options - Configuration options
 * @param {number} options.hideDelay - Delay before hiding scrollbar (ms)
 * @param {boolean} options.showOnHover - Show scrollbar on hover
 * @param {boolean} options.autoHide - Auto hide scrollbar after scroll stops
 */
export const useAnimatedScrollbar = (options = {}) => {
  const {
    hideDelay = 1000,
    showOnHover = true,
    autoHide = true
  } = options;

  const elementRef = useRef(null);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let isScrolling = false;

    const showScrollbar = () => {
      element.style.setProperty('--scrollbar-opacity', '1');
      element.classList.add('scrollbar-visible');
    };

    const hideScrollbar = () => {
      element.style.setProperty('--scrollbar-opacity', '0');
      element.classList.remove('scrollbar-visible');
    };

    const handleScroll = () => {
      if (!isScrolling) {
        showScrollbar();
        isScrolling = true;
      }

      // Clear existing timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      // Auto hide after scroll stops
      if (autoHide) {
        scrollTimerRef.current = setTimeout(() => {
          hideScrollbar();
          isScrolling = false;
        }, hideDelay);
      }
    };

    const handleMouseEnter = () => {
      if (showOnHover) {
        showScrollbar();
      }
    };

    const handleMouseLeave = () => {
      if (showOnHover && !isScrolling && autoHide) {
        hideScrollbar();
      }
    };

    // Add event listeners
    element.addEventListener('scroll', handleScroll);
    if (showOnHover) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    // Initial state - hidden
    if (autoHide) {
      hideScrollbar();
    }

    // Cleanup
    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [hideDelay, showOnHover, autoHide]);

  // Methods to manually control scrollbar
  const showScrollbar = () => {
    if (elementRef.current) {
      elementRef.current.style.setProperty('--scrollbar-opacity', '1');
      elementRef.current.classList.add('scrollbar-visible');
    }
  };

  const hideScrollbar = () => {
    if (elementRef.current) {
      elementRef.current.style.setProperty('--scrollbar-opacity', '0');
      elementRef.current.classList.remove('scrollbar-visible');
    }
  };

  return {
    ref: elementRef,
    showScrollbar,
    hideScrollbar
  };
};

/**
 * Higher-order component for adding animated scrollbar to any component
 */
export const withAnimatedScrollbar = (WrappedComponent, options = {}) => {
  return function WithAnimatedScrollbarComponent(props) {
    const { ref } = useAnimatedScrollbar(options);
    
    return (
      <div ref={ref} className="animated-scrollbar-container">
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default useAnimatedScrollbar;