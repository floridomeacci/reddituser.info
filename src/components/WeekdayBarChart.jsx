export default function WeekdayBarChart({ comments, posts }) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calculateWeekdayCounts = (items) => {
    if (!items || items.length === 0) return weekdays.map(() => 0);

    const timestamps = items.map(item => item.timestamp || item.created_utc).filter(t => t && t < 3000000000);
    if (timestamps.length === 0) return weekdays.map(() => 0);

    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    timestamps.forEach(timestamp => {
      const date = new Date(timestamp * 1000);
      const day = date.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
      weekdayCounts[adjustedDay]++;
    });

    return weekdayCounts;
  };

  const allItems = [...(comments || []), ...(posts || [])];
  const counts = calculateWeekdayCounts(allItems);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts);
  
  // Add 10% padding to the range for better visibility
  const range = maxCount - minCount;
  const padding = range * 0.1;
  const adjustedMin = minCount - padding;
  const adjustedMax = maxCount + padding;
  const adjustedRange = adjustedMax - adjustedMin;

  return (
    <div className="weekday-chart" style={{ alignItems: 'flex-end' }}>
      {counts.map((count, index) => {
        // Scale with padded range
        const heightPercent = adjustedRange === 0 ? 100 : ((count - adjustedMin) / adjustedRange) * 100;
        
        // Use same red shade system as activity heatmap
        const intensity = range === 0 ? 1 : (count - minCount) / range;
        // Red color from design system: #ff6b6b
        const barColor = `rgba(255, 107, 107, ${0.2 + intensity * 0.8})`;
        
        return (
          <div key={index} className="weekday-bar-container" style={{ 
            flexDirection: 'column', 
            justifyContent: 'flex-end' 
          }}>
            <div className="weekday-count" style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: barColor,
              marginBottom: '4px',
              minHeight: '18px',
              textAlign: 'center'
            }}>
              {count}
            </div>
            <div 
              className="weekday-bar"
              style={{ 
                height: `${heightPercent}%`,
                backgroundColor: barColor,
                minHeight: '0'
              }}
              title={`${count} posts/comments`}
            />
            <span className="weekday-label" style={{ marginTop: '4px' }}>{weekdays[index]}</span>
          </div>
        );
      })}
    </div>
  );
}
