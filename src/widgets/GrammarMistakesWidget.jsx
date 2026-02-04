import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getDesignTokens } from '../design-tokens';

export default function GrammarMistakesWidget({ grammarMistakes, grammarLoading, style }) {
  const [selectedGrammarPoint, setSelectedGrammarPoint] = useState(null);
  const tokens = getDesignTokens();

  // Group mistakes by comment
  const mistakesByComment = {};
  (grammarMistakes || []).forEach(mistake => {
    const commentKey = `${mistake.url || ''}_${mistake.timestamp}`;
    if (!mistakesByComment[commentKey]) {
      mistakesByComment[commentKey] = {
        mistakes: [],
        timestamp: mistake.timestamp,
        type: mistake.type,
        subreddit: mistake.subreddit,
        karma: mistake.karma,
        text: mistake.excerpt || mistake.context,
        url: mistake.url
      };
    }
    mistakesByComment[commentKey].mistakes.push(mistake);
  });

  // Create scatter plot data
  const scatterData = Object.values(mistakesByComment).map(data => ({
    timestamp: data.timestamp * 1000,
    severity: data.mistakes.length,
    text: data.text,
    mistakes: data.mistakes,
    type: data.type,
    subreddit: data.subreddit,
    karma: data.karma,
    url: data.url,
    date: new Date(data.timestamp * 1000)
  })).sort((a, b) => a.timestamp - b.timestamp);

  const uniqueComments = Object.keys(mistakesByComment).length;

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Grammar Mistakes</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {(grammarMistakes?.length || 0) === 0
          ? (grammarLoading ? 'Analyzing text...' : 'No grammar mistakes detected')
          : `${grammarMistakes.length} total errors across ${uniqueComments} comments (each dot = 1 comment)`}
      </p>
      <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
        {grammarLoading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card-bg)',
            opacity: 0.95,
            zIndex: 10,
            borderRadius: 'var(--radius-sm)'
          }}>
            <div className="stat-meta">Analyzing grammar...</div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" domain={[-120, 120]} hide={true} />
            <YAxis type="number" dataKey="y" domain={[-120, 120]} hide={true} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 8px',
                      fontSize: '10px',
                      maxWidth: '280px'
                    }}>
                      <div style={{ color: '#ff6b6b', fontWeight: '600', marginBottom: '4px' }}>
                        {data.severity} {data.severity === 1 ? 'Error' : 'Errors'}
                      </div>
                      {data.mistakes?.slice(0, 2).map((mistake, idx) => (
                        <div key={idx} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: idx < 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                          <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2px' }}>
                            {mistake.error}
                          </div>
                          {mistake.replacements && mistake.replacements.length > 0 && (
                            <div style={{ color: '#ff6b6b', fontSize: '9px' }}>
                              → {mistake.replacements.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                      {data.severity > 2 && (
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginTop: '2px', marginBottom: '4px' }}>
                          +{data.severity - 2} more
                        </div>
                      )}
                      <div style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '9px', 
                        fontStyle: 'italic',
                        marginTop: '6px',
                        paddingTop: '4px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        "{data.text?.substring(0, 120)}{data.text?.length > 120 ? '...' : ''}"
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {scatterData.length > 0 && (
              <Scatter 
                data={scatterData.map((item, idx) => {
                  const angle = (idx / scatterData.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                  const distance = Math.random() * 80 + 20;
                  return {
                    ...item,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                  };
                })} 
                opacity={0.8}
                onClick={(data) => setSelectedGrammarPoint(data)}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const color = payload.severity > 3 ? '#ff4444' : payload.severity > 1 ? '#ff6b6b' : '#ff9999';
                  const radius = Math.min(4 + payload.severity * 1, 12);
                  return (
                    <circle cx={cx} cy={cy} r={radius} fill={color} style={{ cursor: 'pointer' }} />
                  );
                }}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
