import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { COLORS, CHART_CONFIG, getDesignTokens } from '../design-tokens';

export default function CommentScatter({ comments }) {
  const tokens = getDesignTokens();
  
  const data = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    
    return comments
      .filter(c => (c.comment || c.body) && typeof c.karma === 'number')
      .map((c) => ({
        length: (c.comment || c.body).length,
        karma: c.karma,
        text: (c.comment || c.body).slice(0, 50) + '...'
      }));
  }, [comments]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xs)',
          fontSize: 'var(--font-size-tiny)'
        }}>
          <div className="stat-meta">Length: {data.length} chars</div>
          <div className="stat-meta">Karma: {data.karma}</div>
          <div className="stat-meta" style={{ maxWidth: '200px', marginTop: '4px' }}>
            {data.text}
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return <div className="stat-meta" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>No comment data</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
          <XAxis 
            type="number" 
            dataKey="length" 
            name="Length"
            stroke={tokens.chart.axis}
            tick={CHART_CONFIG.axis.tick}
            label={{ value: 'Length (chars)', position: 'insideBottom', offset: -10, fill: tokens.chart.axis }}
          />
          <YAxis 
            type="number" 
            dataKey="karma" 
            name="Karma"
            stroke={tokens.chart.axis}
            tick={CHART_CONFIG.axis.tick}
            label={{ value: 'Karma', angle: -90, position: 'insideLeft', fill: tokens.chart.axis }}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter 
            data={data} 
            opacity={0.8}
            shape={(props) => {
              const { cx, cy, payload } = props;
              const color = payload.karma > 0 ? '#00ff7f' : '#ff4444';
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={2.5} 
                  fill={color}
                  style={{ cursor: 'pointer' }}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
