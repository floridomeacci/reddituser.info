import { useState, useEffect } from 'react';

export default function Contributions({ userData, style }) {
  const [displayComments, setDisplayComments] = useState(0);
  const [displayPosts, setDisplayPosts] = useState(0);
  const formatNumber = (value) => Intl.NumberFormat('en-US').format(value || 0);
  
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  const totalComments = userData?.comments?.length || 0;
  const totalPosts = userData?.posts?.length || 0;
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const commentIncrement = totalComments / steps;
    const postIncrement = totalPosts / steps;
    let currentComments = 0;
    let currentPosts = 0;
    
    const interval = setInterval(() => {
      currentComments += commentIncrement;
      currentPosts += postIncrement;
      
      if (currentComments >= totalComments && currentPosts >= totalPosts) {
        setDisplayComments(totalComments);
        setDisplayPosts(totalPosts);
        clearInterval(interval);
      } else {
        setDisplayComments(Math.floor(currentComments));
        setDisplayPosts(Math.floor(currentPosts));
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [totalComments, totalPosts]);

  const aboutInfo = userData?.about || userData?.account_info || {};
  const avatarUrl = aboutInfo.icon_img || aboutInfo.snoovatar_img || `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png`;
  
  return (
    <div className="cell stat-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <h3 style={{ fontSize: '11px', margin: '0', opacity: 0.6 }}>CONTRIBUTIONS</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '48px' }}>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: 'var(--color-text-white)' }}>{formatNumber(displayComments)}</p>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: 'var(--color-text-white)' }}>{formatNumber(displayPosts)}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <div style={{ display: 'flex', gap: '48px' }}>
          <p style={{ fontSize: '11px', margin: '0', opacity: 0.5, width: '80px', textAlign: 'center' }}>COMMENTS</p>
          <p style={{ fontSize: '11px', margin: '0', opacity: 0.5, width: '80px', textAlign: 'center' }}>POSTS</p>
        </div>
      </div>
    </div>
  );
}
