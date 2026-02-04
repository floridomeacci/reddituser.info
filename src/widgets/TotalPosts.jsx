import { useState, useEffect } from 'react';

export default function TotalPosts({ userData, style }) {
  // Use the posts array length as the source of truth
  // account_info.total_submissions may be 0 during incremental updates
  const totalPosts = userData?.posts?.length || 0;
  const [displayPosts, setDisplayPosts] = useState(0);

  useEffect(() => {
    if (totalPosts === 0) {
      setDisplayPosts(0);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = totalPosts / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        setDisplayPosts(totalPosts);
        clearInterval(interval);
      } else {
        setDisplayPosts(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalPosts]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get the earliest post timestamp
  const firstPost = userData?.posts?.reduce((earliest, post) => {
    const timestamp = post.timestamp || post.created_utc;
    if (!earliest || timestamp < earliest) return timestamp;
    return earliest;
  }, null);
  
  const formattedDate = firstPost ? new Date(firstPost * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="cell stat-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <h3 style={{ fontSize: '11px', margin: '0', opacity: 0.6 }}>TOTAL POSTS</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: '#ffffff' }}>
          {formatNumber(displayPosts)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <p style={{ fontSize: '11px', margin: '0', opacity: 0.5 }}>Since {formattedDate}</p>
      </div>
    </div>
  );
}
