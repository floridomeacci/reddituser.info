import { useMemo, useState } from 'react';
import { getDesignTokens } from '../design-tokens';

export default function ReplyPatterns({ userData, style }) {
  const tokens = getDesignTokens();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { replyStats, commentsByCategory } = useMemo(() => {
    const allComments = userData?.comments || [];
    
    if (allComments.length === 0) return { replyStats: null, commentsByCategory: {} };

    const username = (userData?.username || userData?.about?.name || 'unknown').toLowerCase();
    
    // Group comments by thread (link_id) to detect self-replies
    const commentsByThread = {};
    allComments.forEach(c => {
      const threadId = c.link_id || 'unknown';
      if (!commentsByThread[threadId]) commentsByThread[threadId] = [];
      commentsByThread[threadId].push(c);
    });
    
    // Self-replies: comments in threads where user has multiple comments
    // (subsequent comments in the same thread are considered self-replies)
    const selfReplies = [];
    const otherReplies = [];
    
    Object.values(commentsByThread).forEach(threadComments => {
      // Sort by timestamp to determine order
      const sorted = [...threadComments].sort((a, b) => 
        (a.created_utc || a.timestamp || 0) - (b.created_utc || b.timestamp || 0)
      );
      
      // First comment in thread is "other" reply, subsequent are "self" replies
      sorted.forEach((comment, index) => {
        if (index === 0) {
          otherReplies.push(comment);
        } else {
          selfReplies.push(comment);
        }
      });
    });
    
    const stats = {
      self: selfReplies.length,
      others: otherReplies.length,
      total: allComments.length
    };

    const commentsByCategory = {
      self: selfReplies,
      others: otherReplies
    };

    return { replyStats: stats, commentsByCategory };
  }, [userData]);

  if (!replyStats) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Reply Patterns</h3>
        <p className="stat-meta">Who you respond to most</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '11px' }}>No reply data available</p>
        </div>
      </div>
    );
  }

  const selfPercentage = ((replyStats.self / replyStats.total) * 100).toFixed(1);
  const othersPercentage = ((replyStats.others / replyStats.total) * 100).toFixed(1);

  const selectedComments = selectedCategory ? commentsByCategory[selectedCategory] : [];

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Reply Patterns</h3>
      <p className="stat-meta" style={{ marginBottom: '12px' }}>
        {replyStats.total} total replies • {replyStats.self} self • {replyStats.others} others
      </p>
      
      {!selectedCategory ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100% - 80px)',
          gap: '40px',
          position: 'relative'
        }}>
          {/* Grey baseline */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} />
          
          {/* Self bubble - size based on percentage/ratio */}
          {(() => {
            const selfRatio = replyStats.self / replyStats.total;
            const othersRatio = replyStats.others / replyStats.total;
            const maxSize = 200;
            const minSize = 80;
            const selfSize = minSize + (selfRatio * (maxSize - minSize));
            const othersSize = minSize + (othersRatio * (maxSize - minSize));
            
            return (
              <>
                <div 
                  onClick={() => setSelectedCategory('self')}
                  style={{
                    width: `${selfSize}px`,
                    height: `${selfSize}px`,
                    borderRadius: '50%',
                    background: 'rgba(255, 107, 107, 0.5)',
                    border: '2px solid #ff6b6b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: selfSize > 120 ? '32px' : '24px', fontWeight: 'bold', color: '#fff' }}>
                    {replyStats.self}
                  </div>
                  <div style={{ fontSize: selfSize > 120 ? '12px' : '10px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '4px' }}>
                    Self-replies
                  </div>
                  <div style={{ fontSize: selfSize > 120 ? '16px' : '13px', fontWeight: '600', color: '#fff', marginTop: selfSize > 120 ? '8px' : '4px' }}>
                    {selfPercentage}%
                  </div>
                </div>

                {/* Others bubble - size based on percentage/ratio */}
                <div 
                  onClick={() => setSelectedCategory('others')}
                  style={{
                    width: `${othersSize}px`,
                    height: `${othersSize}px`,
                    borderRadius: '50%',
                    background: 'rgba(250, 82, 82, 0.5)',
                    border: '2px solid #fa5252',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: othersSize > 120 ? '32px' : '24px', fontWeight: 'bold', color: '#fff' }}>
                    {replyStats.others}
                  </div>
                  <div style={{ fontSize: othersSize > 120 ? '12px' : '10px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '4px' }}>
                    Other users
                  </div>
                  <div style={{ fontSize: othersSize > 120 ? '16px' : '13px', fontWeight: '600', color: '#fff', marginTop: othersSize > 120 ? '8px' : '4px' }}>
                    {othersPercentage}%
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div style={{ 
          height: 'calc(100% - 80px)', 
          overflowY: 'auto',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '4px'
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '13px', color: '#fff' }}>
              {selectedCategory === 'self' ? 'Self-replies' : 'Replies to others'} ({selectedComments.length})
            </h4>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                padding: '4px 12px',
                color: '#ff6b6b',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Back to overview
            </button>
          </div>
          {selectedComments.map((comment, idx) => (
            <div 
              key={idx}
              style={{
                marginBottom: '12px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                borderLeft: `3px solid ${selectedCategory === 'self' ? '#ff6b6b' : '#fa5252'}`
              }}
            >
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>
                {selectedCategory === 'others' && `Replying to: ${comment.responding} • `}
                r/{comment.subreddit} • {new Date((comment.timestamp || comment.created_utc) * 1000).toLocaleDateString()} • {comment.karma ?? comment.score ?? 0} karma
              </div>
              <div style={{ fontSize: '12px', color: '#fff', lineHeight: '1.5', marginBottom: '8px' }}>
                {comment.comment || comment.body}
              </div>
              <a 
                href={comment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  fontSize: '10px',
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  display: 'inline-block',
                  padding: '4px 8px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  borderRadius: '3px'
                }}
              >
                View on Reddit →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
