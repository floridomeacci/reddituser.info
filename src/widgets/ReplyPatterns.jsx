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
          flexDirection: 'column',
          justifyContent: 'center',
          height: 'calc(100% - 80px)',
          gap: '16px',
          padding: '0 8px'
        }}>
          {/* Self-replies bar */}
          <div 
            onClick={() => setSelectedCategory('self')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Self-replies</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{replyStats.self} <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({selfPercentage}%)</span></span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${selfPercentage}%`, height: '100%', borderRadius: '4px', background: 'rgba(255, 107, 107, 0.6)', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Other users bar */}
          <div 
            onClick={() => setSelectedCategory('others')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Other users</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{replyStats.others} <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({othersPercentage}%)</span></span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${othersPercentage}%`, height: '100%', borderRadius: '4px', background: '#ff6b6b', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Ratio indicator */}
          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reply ratio</div>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: `${selfPercentage}%`, height: '100%', background: 'rgba(255,107,107,0.6)' }} />
              <div style={{ width: `${othersPercentage}%`, height: '100%', background: '#ff6b6b' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
              <span>Self {selfPercentage}%</span>
              <span>Others {othersPercentage}%</span>
            </div>
          </div>

          <p className="stat-meta" style={{ textAlign: 'center', marginTop: '4px', fontSize: '10px' }}>Click a category to see comments</p>
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
