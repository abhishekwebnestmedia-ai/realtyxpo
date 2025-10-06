// Scrollbar utilities - disabled for normal scrollbar behavior

// Function to initialize normal scrollbar behavior (no custom animations)
export const initScrollbarAnimation = () => {
  // No custom scrollbar animations - using browser defaults
  console.log('Using normal browser scrollbars');
};

// CSS for normal scrollbars
export const scrollbarCSS = `
  /* Normal scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
    transition: background-color 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f1f1f1;
  }
`;