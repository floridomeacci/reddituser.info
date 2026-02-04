import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * FocusableWidget - Wraps any widget with focus mode functionality
 * Adds an enlarge icon in top-right that zooms the widget to fullscreen
 */
function FocusableWidget({ children, widgetName, style }) {
  const [isFocused, setIsFocused] = useState(false);
  const widgetRef = useRef(null);

  const handleFocusToggle = (e) => {
    e.stopPropagation();
    setIsFocused(!isFocused);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsFocused(false);
    }
  };

  return (
    <>
      {/* Render widget with a ref */}
      <div ref={widgetRef} className="focusable-widget-wrapper" style={style}>
        {children}
        <svg
          className="cell-focus-icon"
          onClick={handleFocusToggle}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </div>

      {/* Focus overlay */}
      {isFocused && createPortal(
        <div className="focus-overlay" onClick={handleOverlayClick}>
          <div className="focus-widget-container">
            {children}
            <svg
              className="cell-focus-icon"
              onClick={handleFocusToggle}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default FocusableWidget;
