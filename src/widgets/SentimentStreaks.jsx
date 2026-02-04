import { ComposedChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SentimentStreaks({ userData, style }) {
  const allActivity = [...(userData?.comments || []), ...(userData?.posts || [])].filter(item => item.sentiment);
  
  if (allActivity.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
        <h3>Sentiment Streaks</h3>
        <p className="stat-meta" style={{ marginBottom: '8px' }}>Longest consecutive sentiment streaks over time</p>
        <div style={{ color: '#999', textAlign: 'center', paddingTop: '50px' }}>No sentiment data available</div>
      </div>
    );
  }

  const sorted = allActivity.sort((a, b) => (a.timestamp || a.created_utc) - (b.timestamp || b.created_utc));
  
  const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
  
  let currentPositiveStreak = 0;
  let currentNeutralStreak = 0;
  let currentNegativeStreak = 0;
  let lastPositiveTimestamp = null;
  let lastNeutralTimestamp = null;
  let lastNegativeTimestamp = null;
  let currentSentimentType = null;
  const data = [];
  
  sorted.forEach((item, index) => {
    const polarity = item.sentiment?.polarity || 0;
    const timestamp = item.timestamp || item.created_utc;
    const date = new Date(timestamp * 1000);
    
    let sentimentType;
    if (polarity > 0.1) {
      sentimentType = 'positive';
    } else if (polarity < -0.1) {
      sentimentType = 'negative';
    } else {
      sentimentType = 'neutral';
    }
    
    if (sentimentType === 'positive') {
      if (lastPositiveTimestamp === null || timestamp - lastPositiveTimestamp <= WEEK_IN_SECONDS) {
        currentPositiveStreak++;
      } else {
        currentPositiveStreak = 1;
      }
      lastPositiveTimestamp = timestamp;
      
      if (currentSentimentType !== 'positive') {
        if (timestamp - (lastNeutralTimestamp || 0) > WEEK_IN_SECONDS) currentNeutralStreak = 0;
        if (timestamp - (lastNegativeTimestamp || 0) > WEEK_IN_SECONDS) currentNegativeStreak = 0;
      }
    } else if (sentimentType === 'negative') {
      if (lastNegativeTimestamp === null || timestamp - lastNegativeTimestamp <= WEEK_IN_SECONDS) {
        currentNegativeStreak++;
      } else {
        currentNegativeStreak = 1;
      }
      lastNegativeTimestamp = timestamp;
      
      if (currentSentimentType !== 'negative') {
        if (timestamp - (lastPositiveTimestamp || 0) > WEEK_IN_SECONDS) currentPositiveStreak = 0;
        if (timestamp - (lastNeutralTimestamp || 0) > WEEK_IN_SECONDS) currentNeutralStreak = 0;
      }
    } else {
      if (lastNeutralTimestamp === null || timestamp - lastNeutralTimestamp <= WEEK_IN_SECONDS) {
        currentNeutralStreak++;
      } else {
        currentNeutralStreak = 1;
      }
      lastNeutralTimestamp = timestamp;
      
      if (currentSentimentType !== 'neutral') {
        if (timestamp - (lastPositiveTimestamp || 0) > WEEK_IN_SECONDS) currentPositiveStreak = 0;
        if (timestamp - (lastNegativeTimestamp || 0) > WEEK_IN_SECONDS) currentNegativeStreak = 0;
      }
    }
    
    currentSentimentType = sentimentType;
    
    if (index % 3 === 0 || index === sorted.length - 1) {
      data.push({
        date: date.toLocaleDateString(),
        timestamp: timestamp,
        goodStreak: currentPositiveStreak,
        neutralStreak: currentNeutralStreak,
        evilStreak: currentNegativeStreak
      });
    }
  });
  
  // Calculate average values for rendering order
  const avgGood = data.reduce((sum, d) => sum + d.goodStreak, 0) / data.length;
  const avgNeutral = data.reduce((sum, d) => sum + d.neutralStreak, 0) / data.length;
  const avgEvil = data.reduce((sum, d) => sum + d.evilStreak, 0) / data.length;
  
  const sortedStreaks = [
    { key: 'goodStreak', avg: avgGood, color: '#4ade80', name: 'Good Streak' },
    { key: 'neutralStreak', avg: avgNeutral, color: '#404040', name: 'Neutral Streak' },
    { key: 'evilStreak', avg: avgEvil, color: '#ff6b6b', name: 'Evil Streak' }
  ].sort((a, b) => b.avg - a.avg);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Sentiment Streaks</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Longest consecutive sentiment streaks over time</p>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data}>
          <XAxis dataKey="date" stroke="#666" tick={{ fill: '#999', fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 10 }} label={{ value: 'Streak Length', angle: -90, position: 'insideLeft', fill: '#999' }} />
          <Tooltip 
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          {sortedStreaks.map(streak => (
            <Area 
              key={streak.key}
              type="monotone" 
              dataKey={streak.key} 
              stroke={streak.color} 
              fill={streak.color} 
              fillOpacity={1} 
              strokeWidth={2} 
              name={streak.name}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
