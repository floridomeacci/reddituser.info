import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid } from 'recharts';
import { getDesignTokens } from '../design-tokens';

export default function RemovedCommentsOverTime({ userData, style }) {
  const tokens = getDesignTokens();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const username = (userData?.username || userData?.about?.name || '').toLowerCase();
  
  const calculateRemovedCommentsOverTime = () => {
    const allComments = userData?.comments || [];
    const allPosts = userData?.posts || [];
    
    if (allComments.length === 0 && allPosts.length === 0) return [];
    
    // Check if content is removed - multiple detection methods
    // ONLY for content authored by the user
    const isRemovedComment = (comment) => {
      // Only count if it's the user's own comment
      const author = (comment.author || '').toLowerCase();
      if (author && author !== username && author !== '[deleted]') return false;
      
      // Method 1: Check removed_by_category field
      if (comment.removed_by_category) return true;
      
      // Method 2: Check if body equals "[removed]" or "[deleted]"
      const text = comment.body || comment.comment || '';
      if (text === '[removed]' || text === '[deleted]') return true;
      if (text.includes('[removed]') || text.includes('[deleted]')) return true;
      
      return false;
    };
    
    const isRemovedPost = (post) => {
      // Only count user's own posts - posts always belong to user in userData.posts
      // Method 1: Check removed_by_category field
      if (post.removed_by_category) return true;
      
      // Method 2: Check if selftext equals "[removed]" or "[deleted]"
      const text = post.selftext || post.post || '';
      if (text === '[removed]' || text === '[deleted]') return true;
      if (text.includes('[removed]') || text.includes('[deleted]')) return true;
      
      return false;
    };
    
    // Filter removed comments (only user's own removed comments)
    const removedComments = allComments.filter(comment => isRemovedComment(comment));
    
    // Filter removed posts (user's own posts that were removed)
    const removedPosts = allPosts.filter(post => isRemovedPost(post));
    
    const removedItems = [...removedComments, ...removedPosts];
    
    if (removedItems.length === 0) return [];
    
    // Group by month
    const monthlyData = {};
    
    removedItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (!timestamp) return;
      
      const date = new Date(timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          timestamp: timestamp,
          count: 0
        };
      }
      
      monthlyData[monthKey].count++;
    });
    
    // Convert to array and sort by timestamp
    const chartData = Object.values(monthlyData)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(data => {
        const date = new Date(data.timestamp * 1000);
        return {
          ...data,
          monthLabel: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        };
      });
    
    return chartData;
  };
  
  const chartData = calculateRemovedCommentsOverTime();
  
  // Helper to check if comment is removed (user's own only)
  const isRemovedCommentItem = (comment) => {
    const author = (comment.author || '').toLowerCase();
    if (author && author !== username && author !== '[deleted]') return false;
    if (comment.removed_by_category) return true;
    const text = comment.body || comment.comment || '';
    return text === '[removed]' || text === '[deleted]' || 
           text.includes('[removed]') || text.includes('[deleted]');
  };
  
  // Helper to check if post is removed
  const isRemovedPostItem = (post) => {
    if (post.removed_by_category) return true;
    const text = post.selftext || post.post || '';
    return text === '[removed]' || text === '[deleted]' || 
           text.includes('[removed]') || text.includes('[deleted]');
  };
  
  const selectedMonthContent = selectedMonth ? [
    ...(userData?.comments || []).filter(c => {
      if (!isRemovedCommentItem(c)) return false;
      const date = new Date((c.timestamp || c.created_utc) * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    }).map(c => ({ ...c, text: c.comment || c.body, type: 'comment' })),
    ...(userData?.posts || []).filter(p => {
      if (!isRemovedPostItem(p)) return false;
      const date = new Date((p.timestamp || p.created_utc) * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    }).map(p => ({ ...p, text: p.post || p.selftext, type: 'post', title: p.title }))
  ] : [];
  const totalRemoved = chartData.reduce((sum, d) => sum + d.count, 0);
  
  // Calculate trend line using linear regression
  const calculateTrendLine = () => {
    if (chartData.length < 2) return chartData;
    
    const n = chartData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    chartData.forEach((point, index) => {
      sumX += index;
      sumY += point.count;
      sumXY += index * point.count;
      sumX2 += index * index;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return chartData.map((point, index) => ({
      ...point,
      trend: slope * index + intercept
    }));
  };
  
  const dataWithTrend = calculateTrendLine();
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          padding: '8px 12px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#fff' }}>
            {data.monthLabel}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold', color: tokens.colors.accentPrimary }}>
            {data.count} removed
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Removed content over time</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {totalRemoved} total removed (posts + comments)
      </p>
      {!selectedMonth ? (
        chartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataWithTrend}>
              <defs>
                <linearGradient id="removedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tokens.colors.accentPrimary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={tokens.colors.accentPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="monthLabel"
                stroke={tokens.colors.textSecondary}
                style={{ fontSize: '10px' }}
                tick={{ fill: tokens.colors.textSecondary }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke={tokens.colors.textSecondary}
                style={{ fontSize: '10px' }}
                tick={{ fill: tokens.colors.textSecondary }}
                label={{ 
                  value: 'Count', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '10px', fill: tokens.colors.textSecondary }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={tokens.colors.accentPrimary}
                strokeWidth={2}
                fill="url(#removedGradient)"
                dot={{ r: 3, fill: tokens.colors.accentPrimary }}
                activeDot={{ r: 5, fill: tokens.colors.accentPrimary }}
                onClick={(data) => data && setSelectedMonth(data.month)}
                cursor="pointer"
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke={tokens.colors.textSecondary}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                opacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
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
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Removed in {chartData.find(d => d.month === selectedMonth)?.monthLabel} ({selectedMonthContent.length})</h4>
            <button 
              onClick={() => setSelectedMonth(null)}
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
            {selectedMonthContent.map((item, idx) => (
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
                  r/{item.subreddit} • {item.karma ?? item.score ?? 0} karma
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
