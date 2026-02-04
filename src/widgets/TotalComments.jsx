import { useState, useEffect } from 'react';

export default function TotalComments({ userData, style }) {
  const totalComments = userData?.comments?.length || 0;
  const [displayComments, setDisplayComments] = useState(0);

  useEffect(() => {
    if (totalComments === 0) {
      setDisplayComments(0);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = totalComments / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        setDisplayComments(totalComments);
        clearInterval(interval);
      } else {
        setDisplayComments(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalComments]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get the earliest comment timestamp
  const firstComment = userData?.comments?.reduce((earliest, comment) => {
    const timestamp = comment.timestamp || comment.created_utc;
    if (!earliest || timestamp < earliest) return timestamp;
    return earliest;
  }, null);
  
  const formattedDate = firstComment ? new Date(firstComment * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="cell stat-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <h3 style={{ fontSize: '11px', margin: '0', opacity: 0.6 }}>TOTAL COMMENTS</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: '#ffffff' }}>
          {formatNumber(displayComments)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <p style={{ fontSize: '11px', margin: '0', opacity: 0.5 }}>Since {formattedDate}</p>
      </div>
    </div>
  );
}
