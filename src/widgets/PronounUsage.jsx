import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getDesignTokens } from '../design-tokens';

export default function PronounUsage({ userData, style }) {
  const tokens = getDesignTokens();
  const [selectedPronounCategory, setSelectedPronounCategory] = useState(null);
  
  const analyzePronounUsage = () => {
    const allComments = userData?.comments || [];
    const allPosts = userData?.posts || [];
    
    if (allComments.length === 0 && allPosts.length === 0) return [];
    
    // Define pronoun categories
    const pronouns = {
      'I/Me': ['i', 'me', 'my', 'mine', 'myself'],
      'You': ['you', 'your', 'yours', 'yourself', 'yourselves'],
      'He/Him': ['he', 'him', 'his', 'himself'],
      'She/Her': ['she', 'her', 'hers', 'herself'],
      'They/Them': ['they', 'them', 'their', 'theirs', 'themselves', 'themself'],
      'We/Us': ['we', 'us', 'our', 'ours', 'ourselves'],
      'It': ['it', 'its', 'itself']
    };
    
    const counts = {};
    Object.keys(pronouns).forEach(category => {
      counts[category] = 0;
    });
    
    // Combine all text
    const allText = [];
    allComments.forEach(comment => {
      const text = comment.comment || comment.body || '';
      if (text) allText.push(text);
    });
    allPosts.forEach(post => {
      const text = post.post || post.title || '';
      if (text) allText.push(text);
    });
    
    // Count pronouns
    allText.forEach(text => {
      // Split into words and clean
      const words = text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      words.forEach(word => {
        Object.entries(pronouns).forEach(([category, pronounList]) => {
          if (pronounList.includes(word)) {
            counts[category]++;
          }
        });
      });
    });
    
    // Convert to chart data
    const chartData = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return chartData;
  };
  
  const chartData = analyzePronounUsage();
  const totalPronouns = chartData.reduce((sum, d) => sum + d.count, 0);
  
  // Get comments that contain selected pronoun category
  const getCommentsWithPronoun = (category) => {
    const pronounMap = {
      'I/Me': ['i', 'me', 'my', 'mine', 'myself'],
      'You': ['you', 'your', 'yours', 'yourself', 'yourselves'],
      'He/Him': ['he', 'him', 'his', 'himself'],
      'She/Her': ['she', 'her', 'hers', 'herself'],
      'They/Them': ['they', 'them', 'their', 'theirs', 'themselves', 'themself'],
      'We/Us': ['we', 'us', 'our', 'ours', 'ourselves'],
      'It': ['it', 'its', 'itself']
    };
    
    const pronouns = pronounMap[category] || [];
    const allContent = [
      ...(userData?.comments || []).map(c => ({ ...c, text: c.comment || c.body })),
      ...(userData?.posts || []).map(p => ({ ...p, text: p.post }))
    ];
    
    return allContent.filter(item => {
      if (!item.text) return false;
      const words = item.text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/);
      return words.some(word => pronouns.includes(word));
    }).slice(0, 50); // Limit to 50 examples
  };
  
  const selectedComments = selectedPronounCategory ? getCommentsWithPronoun(selectedPronounCategory) : [];
  
  // Calculate insights based on research
  const getInsights = () => {
    if (totalPronouns === 0) return null;
    
    const iMeCategory = chartData.find(d => d.name === 'I/Me');
    const youCategory = chartData.find(d => d.name === 'You');
    const weCategory = chartData.find(d => d.name === 'We/Us');
    const theyCategory = chartData.find(d => d.name === 'They/Them');
    
    const iMePercent = iMeCategory ? (iMeCategory.count / totalPronouns * 100) : 0;
    const youPercent = youCategory ? (youCategory.count / totalPronouns * 100) : 0;
    const wePercent = weCategory ? (weCategory.count / totalPronouns * 100) : 0;
    const theyPercent = theyCategory ? (theyCategory.count / totalPronouns * 100) : 0;
    
    const insights = [];
    
    // Research-based insights (Pennebaker's research on pronoun use)
    if (iMePercent > 12) {
      insights.push({
        text: 'High "I/Me" usage may indicate self-focus or introspection',
        color: '#ff6b6b',
        note: 'Research suggests correlation with depression or self-awareness'
      });
    } else if (iMePercent < 4) {
      insights.push({
        text: 'Low "I/Me" usage may indicate power or status',
        color: '#51cf66',
        note: 'People in positions of authority tend to use fewer first-person pronouns'
      });
    }
    
    if (youPercent > 8) {
      insights.push({
        text: 'High "You" usage suggests engagement and directness',
        color: '#4dabf7',
        note: 'Common in conversational, persuasive, or instructional communication'
      });
    }
    
    if (wePercent > 5) {
      insights.push({
        text: 'High "We/Us" usage indicates group identity',
        color: '#a9e34b',
        note: 'Reflects collective thinking and social connection'
      });
    }
    
    if (theyPercent > 8) {
      insights.push({
        text: 'High "They/Them" usage shows focus on others',
        color: '#ffa94d',
        note: 'May indicate storytelling, gossip, or external focus'
      });
    }
    
    return insights;
  };
  
  const insights = getInsights();
  
  const getColor = (index) => {
    // Red color palette
    const colors = [
      '#ff6b6b',  // Primary red
      '#ff8787',  // Lighter red
      '#fa5252',  // Darker red
      '#e03131',  // Deep red
      '#c92a2a',  // Dark red
      '#ff4757',  // Coral red
      '#ff7f7f',  // Soft red
    ];
    return colors[index % colors.length];
  };
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalPronouns > 0 ? ((data.count / totalPronouns) * 100).toFixed(1) : 0;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          padding: '8px 12px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>
            {data.name}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold', color: tokens.colors.accentPrimary }}>
            {data.count} uses ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Pronoun Usage</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {totalPronouns} total pronouns detected • Click a bar to see examples
      </p>
      {!selectedPronounCategory ? (
        chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <XAxis 
                  dataKey="name"
                  stroke={tokens.colors.textSecondary}
                  style={{ fontSize: '10px' }}
                  tick={{ fill: tokens.colors.textSecondary }}
                />
                <YAxis 
                  stroke={tokens.colors.textSecondary}
                  style={{ fontSize: '10px' }}
                  tick={{ fill: tokens.colors.textSecondary }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => setSelectedPronounCategory(data.name)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            opacity: 0.5 
          }}>
            <p style={{ fontSize: '11px' }}>No pronoun data available</p>
          </div>
        )
      ) : (
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Using "{selectedPronounCategory}" ({selectedComments.length})</h4>
            <button 
              onClick={() => setSelectedPronounCategory(null)}
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
            {selectedComments.map((item, idx) => (
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
                  r/{item.subreddit} • {item.karma || 0} karma
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
