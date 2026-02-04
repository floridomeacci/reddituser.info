import { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_CONFIG, getDesignTokens } from '../design-tokens';
import { COLORS } from '../design-tokens';

export default function KarmaMomentum({ userData, style }) {
  const tokens = getDesignTokens();
  const [selectedPoint, setSelectedPoint] = useState(null);

  if (!userData || !userData.comments?.length) return null;

  const karmaTrendData = (userData?.comments || [])
    .slice(0, 20)
    .reverse()
    .map((comment, index) => {
      const karmaVal = comment.karma ?? comment.score ?? 0;
      return {
        index: index + 1,
        karma: karmaVal,
        karmaPositive: Math.max(karmaVal, 0),
        karmaNegative: Math.min(karmaVal, 0),
        subreddit: comment.subreddit,
        text: (comment.comment || comment.body || '').slice(0, 150),
        timestamp: comment.timestamp || comment.created_utc
      };
    });
  
  const karmaTrend = karmaTrendData.length ? karmaTrendData : [{ index: 0, karma: 0, karmaPositive: 0, karmaNegative: 0, subreddit: 'n/a', text: '' }];
  
  const selectedComment = selectedPoint !== null ? (userData?.comments || [])[selectedPoint] : null;

  // Calculate trend line
  if (karmaTrend.length > 0 && karmaTrend[0].index !== 0) {
    const n = karmaTrend.length;
    const sumX = karmaTrend.reduce((sum, d) => sum + d.index, 0);
    const sumY = karmaTrend.reduce((sum, d) => sum + d.karma, 0);
    const sumXY = karmaTrend.reduce((sum, d) => sum + (d.index * d.karma), 0);
    const sumX2 = karmaTrend.reduce((sum, d) => sum + (d.index * d.index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    karmaTrend.forEach(d => {
      d.trend = slope * d.index + intercept;
    });
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column' }}>
      <h3>Karma momentum</h3>
      <p className="stat-meta" style={{ marginBottom: '4px' }}>Last 20 comments karma trend (oldest → newest)</p>
      <p style={{ fontSize: '9px', color: '#4a9eff', marginBottom: '8px', marginTop: 0 }}>Blue dashed line shows overall trend</p>
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={karmaTrend}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ff4444" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ff4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="index" 
              stroke={tokens.chart.axis} 
              tick={CHART_CONFIG.axis.tick}
              label={{ value: 'Comment #', position: 'insideBottom', offset: -5, fill: tokens.chart.axis }}
            />
            <YAxis 
              stroke={tokens.chart.axis} 
              tick={CHART_CONFIG.axis.tick}
              label={{ value: 'Karma', angle: -90, position: 'insideLeft', fill: tokens.chart.axis }}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--spacing-xs)',
                      fontSize: 'var(--font-size-tiny)',
                      maxWidth: '250px'
                    }}>
                      <div className="stat-meta">Comment #{data.index}</div>
                      <div className="stat-meta">Karma: {data.karma}</div>
                      <div className="stat-meta">r/{data.subreddit}</div>
                      {data.text && (
                        <div className="stat-meta" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          "{data.text}..."
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Area 
              type="monotone" 
              dataKey="karmaPositive" 
              stroke="none"
              fill="url(#colorPositive)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="karmaNegative" 
              stroke="none"
              fill="url(#colorNegative)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="#4a9eff"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="karma" 
              stroke="transparent"
              strokeWidth={0}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                const color = payload.karma > 0 ? COLORS.ACCENT_PRIMARY : '#ff4444';
                return (
                  <circle 
                    key={`karma-dot-${index}`}
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill={color}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPoint(index)}
                  />
                );
              }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {selectedComment && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.95)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: '#999' }}>
              r/{selectedComment.subreddit} • {selectedComment.karma ?? selectedComment.score ?? 0} karma
            </div>
            <button 
              onClick={() => setSelectedPoint(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff6b6b',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#fff', lineHeight: '1.4' }}>
            {selectedComment.comment || selectedComment.body}
          </div>
        </div>
      )}
    </div>
  );
}
