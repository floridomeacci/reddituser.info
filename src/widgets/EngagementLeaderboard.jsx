import { COLORS, getDesignTokens } from '../design-tokens';
import { useState } from 'react';

export default function EngagementLeaderboard({ userData, style }) {
  const tokens = getDesignTokens();
  const [hoveredComment, setHoveredComment] = useState(null);
  
  if (!userData || !userData.comments?.length) return null;
  
  // Group comments by post URL, count comments per post
  const postEngagement = (userData?.comments || []).reduce((acc, comment) => {
    // Extract post URL from comment URL (remove comment ID part)
    const postUrl = comment.url?.split('/').slice(0, -2).join('/');
    if (!postUrl) return acc;
    
    if (!acc[postUrl]) {
      acc[postUrl] = {
        url: postUrl,
        subreddit: comment.subreddit,
        comments: [],
        count: 0
      };
    }
    
    acc[postUrl].comments.push(comment);
    acc[postUrl].count++;
    return acc;
  }, {});
  
  // Sort by engagement count and take top 16
  const topEngagedPosts = Object.values(postEngagement)
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);
  
  const handleCommentClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
        {/* Left column - Title */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '140px', maxWidth: '140px' }}>
          <h3 style={{ textAlign: 'left', lineHeight: '1.2', fontSize: '14px' }}>Posts you commented on the most</h3>
          {hoveredComment && (
            <div style={{ 
              fontSize: '9px', 
              color: tokens.text?.secondary || COLORS.TEXT_GREY,
              textAlign: 'left',
              lineHeight: '1.4',
              maxHeight: '200px',
              overflow: 'auto',
              wordBreak: 'break-word',
              paddingBottom: '8px'
            }}>
              {hoveredComment}
            </div>
          )}
        </div>

        {/* Right column - Leaderboard bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', paddingTop: '10px', paddingBottom: '10px' }}>
          {topEngagedPosts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%', justifyContent: 'space-evenly' }}>
              {topEngagedPosts.map((post, idx) => {
                // Calculate opacity: first item = 1.0, last item = 0.3
                const opacity = 1 - (idx / topEngagedPosts.length) * 0.7;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flex: 1 }}>
                    <span style={{ fontSize: '6px', color: tokens.text?.primary || COLORS.TEXT_PRIMARY, minWidth: '95px', textAlign: 'right' }}>
                      r/{post.subreddit}
                    </span>
                    <div style={{ display: 'flex', gap: '2px', width: '100%', height: '100%' }}>
                      {post.comments.map((comment, commentIdx) => (
                        <div
                          key={commentIdx}
                          onClick={() => handleCommentClick(comment.url)}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = opacity * 0.7;
                            setHoveredComment(comment.comment);
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = opacity;
                            setHoveredComment(null);
                          }}
                          style={{
                            height: '100%',
                            width: `calc((100% - ${(post.comments.length - 1) * 2}px) / ${post.comments.length})`,
                            backgroundColor: COLORS.ACCENT_PRIMARY,
                            opacity: opacity,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            flexShrink: 0,
                          }}
                          title={`${comment.karma} karma - Click to view`}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '6px', color: tokens.text?.secondary || COLORS.TEXT_GREY, minWidth: '15px' }}>
                      {post.count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: COLORS.TEXT_GREY_LIGHT }}>No engagement data found</p>
          )}
        </div>
      </div>
    </div>
  );
}
