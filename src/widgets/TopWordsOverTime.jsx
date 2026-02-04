import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getDesignTokens, COLORS } from '../design-tokens';

export default function TopWordsOverTime({ userData, style }) {
  const tokens = getDesignTokens();
  
  const chartData = useMemo(() => {
    const allActivity = [...(userData?.comments || []), ...(userData?.posts || [])];
    if (allActivity.length === 0) return [];
    
    // Common words to exclude
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
      'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
      'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
      'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
      'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
      'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
      'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been',
      'has', 'had', 'were', 'said', 'did', 'having', 'may', 'am', 'im', 'dont', 'doesnt', 'didnt', 'cant',
      'wont', 'shouldnt', 'wouldnt', 'couldnt', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt', 'havent',
      'hadnt', 'thats', 'theres', 'heres', 'wheres', 'youre', 'theyre', 'ive', 'youve', 'weve', 'theyve',
      'id', 'youd', 'hed', 'shed', 'wed', 'theyd', 'ill', 'youll', 'hell', 'shell', 'well', 'theyll',
      'really', 'much', 'very', 'still', 'more', 'here', 'going', 'yeah', 'right', 'thing', 'things',
      'removed', 'deleted'
    ]);
    
    // Count word frequency and total activity
    const wordData = {};
    const totalActivityByWord = {};
    
    allActivity.forEach(item => {
      const text = item.comment || item.body || item.title || item.post || '';
      const words = text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 4 && !stopWords.has(word));
      
      words.forEach(word => {
        wordData[word] = (wordData[word] || 0) + 1;
        totalActivityByWord[word] = (totalActivityByWord[word] || 0) + 1;
      });
    });
    
    // Get top 10 words
    const topWords = Object.entries(wordData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Calculate total content count for width proportionality
    const totalContent = allActivity.length;
    
    return topWords.map(([word, count]) => ({
      word,
      frequency: count,
      contentCount: totalActivityByWord[word], // Use as width (proportional to usage)
      percentage: ((count / totalContent) * 100).toFixed(1)
    }));
  }, [userData]);
  
  const colors = [
    COLORS.ACCENT_PRIMARY, 
    COLORS.DATA_3, 
    COLORS.DATA_6, 
    COLORS.DATA_2, 
    COLORS.DATA_8,
    COLORS.DATA_4, 
    COLORS.DATA_9, 
    COLORS.DATA_1, 
    COLORS.DATA_7, 
    COLORS.DATA_5
  ];
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: `1px solid ${COLORS.ACCENT_PRIMARY}`,
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          <p style={{ margin: '0 0 4px 0', color: '#fff', fontWeight: 'bold' }}>
            {data.word}
          </p>
          <p style={{ margin: '2px 0', color: COLORS.TEXT_LIGHT_GREY }}>
            Frequency: {data.frequency} times
          </p>
          <p style={{ margin: '2px 0', color: COLORS.TEXT_LIGHT_GREY }}>
            Usage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Top 10 Words</h3>
      <p className="stat-meta">Most frequently used words (width = frequency)</p>
      {chartData.length > 0 ? (
        <div style={{ 
          display: 'flex', 
          height: 'calc(100% - 80px)',
          alignItems: 'flex-end',
          gap: '0',
          padding: '10px'
        }}>
          {chartData.map((item, index) => {
            const maxFrequency = chartData[0].frequency;
            const heightPercent = (item.frequency / maxFrequency) * 100;
            const totalFrequency = chartData.reduce((sum, d) => sum + d.frequency, 0);
            const widthPercent = (item.frequency / totalFrequency) * 100;
            
            return (
              <div
                key={item.word}
                style={{
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  backgroundColor: colors[index % colors.length],
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  const tooltip = e.currentTarget.querySelector('.custom-tooltip');
                  if (tooltip) tooltip.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  const tooltip = e.currentTarget.querySelector('.custom-tooltip');
                  if (tooltip) tooltip.style.display = 'none';
                }}
                title={`${item.word}: ${item.frequency} times (${item.percentage}%)`}
              >
                <div 
                  className="custom-tooltip"
                  style={{
                    display: 'none',
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: `1px solid ${colors[index % colors.length]}`,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none'
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', color: '#fff', fontWeight: 'bold' }}>
                    {item.word}
                  </p>
                  <p style={{ margin: '2px 0', color: COLORS.TEXT_LIGHT_GREY }}>
                    {item.frequency} times
                  </p>
                  <p style={{ margin: '2px 0', color: COLORS.TEXT_LIGHT_GREY }}>
                    {item.percentage}%
                  </p>
                </div>
                
                <div style={{ 
                  fontSize: '10px', 
                  color: '#fff',
                  fontWeight: 'bold',
                  writingMode: widthPercent < 8 ? 'vertical-rl' : 'horizontal-tb',
                  transform: widthPercent < 8 ? 'rotate(180deg)' : 'none',
                  textAlign: 'center'
                }}>
                  {item.frequency}
                </div>
                
                <div style={{ 
                  fontSize: widthPercent < 6 ? '8px' : '10px',
                  color: '#fff',
                  fontWeight: '600',
                  writingMode: widthPercent < 8 ? 'vertical-rl' : 'horizontal-tb',
                  transform: widthPercent < 8 ? 'rotate(180deg)' : 'none',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {item.word}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '11px' }}>No word data available</p>
        </div>
      )}
    </div>
  );
}
