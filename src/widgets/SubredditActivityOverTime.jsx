import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getDesignTokens } from '../design-tokens';

export default function SubredditActivityOverTime({ userData, style }) {
  const [highlightedSubIndex, setHighlightedSubIndex] = useState(null);
  const tokens = getDesignTokens();

  const allActivity = [...(userData?.comments || []), ...(userData?.posts || [])];
  
  if (allActivity.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, position: 'relative' }}>
        <h3>Subreddit Activity Over Time</h3>
        <p className="stat-meta" style={{ marginBottom: '8px' }}>
          Activity distribution across subreddits over time (streamgraph)
        </p>
        <div style={{ color: '#999', textAlign: 'center', paddingTop: '50px' }}>No activity data available</div>
      </div>
    );
  }

  // Get top 10 subreddits
  const subredditCounts = {};
  allActivity.forEach(item => {
    const sub = item.subreddit || 'unknown';
    subredditCounts[sub] = (subredditCounts[sub] || 0) + 1;
  });
  const topSubs = Object.entries(subredditCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name]) => name);

  // Group by month and subreddit
  const monthlyData = {};
  allActivity.forEach(item => {
    const date = new Date((item.timestamp || item.created_utc) * 1000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const sub = item.subreddit || 'unknown';
    
    if (!topSubs.includes(sub)) return;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey };
      topSubs.forEach(s => monthlyData[monthKey][s] = 0);
    }
    monthlyData[monthKey][sub]++;
  });

  const streamData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const desaturatedRedPalette = [
    'rgba(255, 107, 107, 0.7)',
    'rgba(220, 90, 90, 0.7)',
    'rgba(255, 130, 130, 0.7)',
    'rgba(200, 80, 80, 0.7)',
    'rgba(255, 150, 150, 0.7)',
    'rgba(180, 70, 70, 0.7)',
    'rgba(255, 120, 120, 0.7)',
    'rgba(230, 100, 100, 0.7)',
    'rgba(255, 140, 140, 0.7)',
    'rgba(190, 75, 75, 0.7)'
  ];

  const handlePrevious = () => {
    setHighlightedSubIndex(prev => {
      if (prev === null) return topSubs.length - 1;
      return prev === 0 ? null : prev - 1;
    });
  };

  const handleNext = () => {
    setHighlightedSubIndex(prev => {
      if (prev === null) return 0;
      return prev === topSubs.length - 1 ? null : prev + 1;
    });
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, position: 'relative' }}>
      <h3 style={{ marginBottom: '4px' }}>Subreddit Activity Over Time</h3>
      <p className="stat-meta" style={{ marginTop: 0, marginBottom: '8px', marginLeft: 0, marginRight: 0 }}>
        Activity distribution across subreddits over time (streamgraph)
      </p>
      
      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ color: '#888', fontSize: '12px', marginRight: '8px' }}>
          {highlightedSubIndex !== null ? `r/${topSubs[highlightedSubIndex]}` : 'All subreddits'}
        </span>
        <button
          onClick={handlePrevious}
          style={{
            background: '#2a2a2a',
            border: '1px solid #444',
            color: '#fff',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          ←
        </button>
        <button
          onClick={handleNext}
          style={{
            background: '#2a2a2a',
            border: '1px solid #444',
            color: '#fff',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          →
        </button>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={streamData} stackOffset="wiggle">
          <XAxis 
            dataKey="month"
            stroke={tokens.chart.axis}
            tick={{ fill: tokens.chart.axis, fontSize: 10 }}
            tickFormatter={(value) => {
              const [year, month] = value.split('-');
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
            }}
          />
          <YAxis hide />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              const data = payload[0]?.payload;
              if (!data) return null;
              
              const [year, month] = data.month.split('-');
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              
              return (
                <div style={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                    {monthNames[parseInt(month) - 1]} {year}
                  </div>
                  {topSubs.map((sub, i) => (
                    data[sub] > 0 && (
                      <div key={sub} style={{ 
                        color: i === highlightedSubIndex ? '#00ff7f' : desaturatedRedPalette[i % desaturatedRedPalette.length].replace('0.7', '1'),
                        marginTop: '2px',
                        fontWeight: i === highlightedSubIndex ? 'bold' : 'normal'
                      }}>
                        r/{sub}: {data[sub]}
                      </div>
                    )
                  ))}
                </div>
              );
            }}
          />
          {topSubs.map((sub, i) => (
            <Area
              key={sub}
              type="monotone"
              dataKey={sub}
              stackId="1"
              stroke="none"
              fill={highlightedSubIndex === i ? '#00ff7f' : desaturatedRedPalette[i % desaturatedRedPalette.length]}
              fillOpacity={highlightedSubIndex === null ? 0.8 : (highlightedSubIndex === i ? 1 : 0.3)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
