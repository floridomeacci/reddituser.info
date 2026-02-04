import { ResponsiveContainer, ScatterChart, Scatter, Cell, Tooltip, ZAxis, XAxis, YAxis } from 'recharts';
import { getDesignTokens } from '../design-tokens';
import { useState } from 'react';

export default function RemovedCommentsBySubreddit({ userData, style }) {
  const tokens = getDesignTokens();
  const [hoveredSubreddit, setHoveredSubreddit] = useState(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  
  const username = (userData?.username || userData?.about?.name || '').toLowerCase();
  
  // Check if comment is removed - only user's own content
  const isRemovedComment = (comment) => {
    // Only count if it's the user's own comment
    const author = (comment.author || '').toLowerCase();
    if (author && author !== username && author !== '[deleted]') return false;
    
    if (comment.removed_by_category) return true;
    const text = comment.body || comment.comment || '';
    if (text === '[removed]' || text === '[deleted]') return true;
    if (text.includes('[removed]') || text.includes('[deleted]')) return true;
    return false;
  };
  
  // Check if post is removed - posts in userData.posts are always user's own
  const isRemovedPost = (post) => {
    if (post.removed_by_category) return true;
    const text = post.selftext || post.post || '';
    if (text === '[removed]' || text === '[deleted]') return true;
    if (text.includes('[removed]') || text.includes('[deleted]')) return true;
    return false;
  };
  
  const calculateRemovedBySubreddit = () => {
    const allComments = userData?.comments || [];
    const allPosts = userData?.posts || [];
    
    if (allComments.length === 0 && allPosts.length === 0) return { allSubreddits: [], chartData: [] };
    
    // Filter removed comments (only user's own)
    const removedComments = allComments.filter(comment => isRemovedComment(comment));
    
    // Filter removed posts (user's own)
    const removedPosts = allPosts.filter(post => isRemovedPost(post));
    
    const removedItems = [...removedComments, ...removedPosts];
    
    if (removedItems.length === 0) return { allSubreddits: [], chartData: [] };
    
    // Group by subreddit
    const subredditData = {};
    
    removedItems.forEach(item => {
      const subreddit = item.subreddit || 'unknown';
      
      if (!subredditData[subreddit]) {
        subredditData[subreddit] = {
          name: subreddit,
          value: 0,
          removedBy: {} // Track removal reasons
        };
      }
      
      subredditData[subreddit].value++;
      
      // Track removal reason
      const reason = item.removed_by_category || 'unknown';
      subredditData[subreddit].removedBy[reason] = (subredditData[subreddit].removedBy[reason] || 0) + 1;
    });
    
    // Convert to array and sort - assign colors to ALL subreddits
    const sorted = Object.values(subredditData)
      .sort((a, b) => b.value - a.value);
    
    // Assign colors to all subreddits for the legend
    const allSubreddits = sorted.map((item, index) => ({
      ...item,
      fill: getColor(index)
    }));
    
    // Create scattered bubble layout centered in the right side - show top 10 only
    const displayData = allSubreddits.slice(0, 10);
    const chartData = displayData.map((item, index, arr) => {
      const positions = [
        { x: 45, y: 60 },
        { x: 70, y: 55 },
        { x: 38, y: 78 },
        { x: 63, y: 73 },
        { x: 52, y: 88 },
        { x: 78, y: 83 },
        { x: 32, y: 95 },
        { x: 48, y: 98 },
        { x: 72, y: 93 },
        { x: 60, y: 65 }
      ];
      return {
        x: positions[index].x,
        y: positions[index].y,
        z: item.value,
        name: item.name,
        value: item.value,
        fill: item.fill,
        removedBy: item.removedBy
      };
    });
    
    // Return both full list and chart data
    return { allSubreddits, chartData };
  };
  
  const getColor = (index) => {
    const colors = [
      '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
      '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131',
      '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131',
      '#c92a2a', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e'
    ];
    return colors[index % colors.length];
  };
  
  const { allSubreddits, chartData } = calculateRemovedBySubreddit();
  const totalRemoved = allSubreddits.reduce((sum, d) => sum + d.value, 0);
  
  const renderLabel = (props) => {
    const { cx, cy, value, payload, name } = props;
    // Use the name from the data point if payload is undefined
    const itemName = payload?.name || name;
    if (!value) return null;
    
    const isHovered = hoveredSubreddit === null || hoveredSubreddit === itemName;
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="14px"
        fontWeight="bold"
        opacity={isHovered ? 1 : 0.3}
        style={{ 
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease'
        }}
      >
        {value}
      </text>
    );
  };
  
  const selectedRemovedContent = selectedSubreddit ? [
    ...(userData?.comments || []).filter(c => {
      const text = (c.comment || c.body || '');
      return c.subreddit === selectedSubreddit && (text.includes('[removed]') || text.includes('[deleted]'));
    }).map(c => ({ ...c, text: c.comment || c.body })),
    ...(userData?.posts || []).filter(p => {
      const text = (p.post || '');
      return p.subreddit === selectedSubreddit && (text.includes('[removed]') || text.includes('[deleted]'));
    }).map(p => ({ ...p, text: p.post }))
  ] : [];
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <p style={{ color: '#fff', margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
            r/{data.name}
          </p>
          <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '11px' }}>
            {data.value} removed
          </p>
        </div>
      );
    }
    return null;
  };
  

  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Removed content by subreddit</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {totalRemoved} total (posts + comments) • All {allSubreddits.length} subreddits
      </p>
      {!selectedSubreddit ? (
        allSubreddits.length > 0 ? (
        <div style={{ display: 'flex', height: '100%', gap: '16px' }}>
          {/* Legend on the left */}
          <div style={{ 
            flex: '0 0 45%', 
            overflowY: 'auto', 
            paddingRight: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px 8px',
            alignContent: 'start'
          }}>
            {allSubreddits.map((item, index) => (
              <div 
                key={item.name} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '11px',
                  opacity: hoveredSubreddit === null || hoveredSubreddit === item.name ? 1 : 0.3,
                  transition: 'opacity 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredSubreddit(item.name)}
                onMouseLeave={() => setHoveredSubreddit(null)}
                onClick={() => setSelectedSubreddit(item.name)}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: item.fill,
                  border: '1px solid #000',
                  flexShrink: 0
                }} />
                <span style={{ color: '#fff', flex: 1 }}>r/{item.name}</span>
              </div>
            ))}
          </div>
          
          {/* Bubble chart on the right */}
          <div style={{ flex: '0 0 55%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <ZAxis type="number" dataKey="z" range={[800, 8000]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={chartData} label={renderLabel} isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      stroke="none"
                      opacity={hoveredSubreddit === null || hoveredSubreddit === entry.name ? 1 : 0.3}
                      style={{ 
                        transition: 'opacity 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => setHoveredSubreddit(entry.name)}
                      onMouseLeave={() => setHoveredSubreddit(null)}
                      onClick={() => setSelectedSubreddit(entry.name)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '12px', color: '#888' }}>No removed content found</p>
        </div>
      )
      ) : (
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>r/{selectedSubreddit} removed ({selectedRemovedContent.length})</h4>
            <button 
              onClick={() => setSelectedSubreddit(null)}
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
              Back
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedRemovedContent.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  borderLeft: '3px solid #ff6b6b'
                }}
              >
                <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>
                  {item.karma ?? item.score ?? 0} karma • {new Date((item.timestamp || item.created_utc) * 1000).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '11px', color: '#fff', lineHeight: '1.4' }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
