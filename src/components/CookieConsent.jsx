import { useState, useEffect } from 'react';
import { COLORS } from '../design-tokens';

export default function CookieConsent({ onTermsClick }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2a2a2a',
      borderTop: '1px solid rgba(255, 107, 107, 0.3)',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: '300px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: 0 }}>
            We use cookies to enhance your experience, analyze site usage, and log IP addresses for security purposes. 
            By continuing to use this site, you consent to our use of cookies and data collection practices as described in our{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onTermsClick) onTermsClick();
              }}
              style={{
                color: COLORS.ACCENT_PRIMARY,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Terms and Conditions
            </a>.
          </p>
        </div>
        
        <button
          onClick={handleAccept}
          style={{
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: '600',
            background: COLORS.ACCENT_PRIMARY,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = '#ff5252';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = COLORS.ACCENT_PRIMARY;
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
