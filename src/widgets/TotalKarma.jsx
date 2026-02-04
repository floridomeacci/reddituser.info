import { useState, useEffect } from 'react';

export default function TotalKarma({ userData, style }) {
  const [displayValue, setDisplayValue] = useState(0);
  const formatNumber = (value) => Intl.NumberFormat('en-US').format(value || 0);
  
  if (!userData) return null;
  
  // Support both 'about' (new API) and 'account_info' (old API)
  const about = userData?.about || userData?.account_info || {};
  
  const commentKarma = about.comment_karma || 0;
  const postKarma = about.link_karma || about.post_karma || 0;
  const totalKarma = about.total_karma || commentKarma + postKarma;
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = totalKarma / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= totalKarma) {
        setDisplayValue(totalKarma);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [totalKarma]);

  const avatarUrl = about.icon_img || about.snoovatar_img || `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png`;
  
  return (
    <div className="cell stat-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <h3 style={{ fontSize: '11px', margin: '0', opacity: 0.6 }}>TOTAL KARMA</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: '#ffffff' }}>
          {formatNumber(displayValue)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <p style={{ fontSize: '11px', margin: '0', opacity: 0.5 }}>{formatNumber(commentKarma)} from comments</p>
      </div>
    </div>
  );
}
