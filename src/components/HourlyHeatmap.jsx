import { useMemo } from 'react';
import { getDataColor } from '../design-tokens';

export default function HourlyHeatmap({ comments, posts }) {
  const heatmapData = useMemo(() => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = Array(7).fill(null).map(() => Array(24).fill(0));
    
    const allItems = [
      ...(comments || []).map(c => c.timestamp),
      ...(posts || []).map(p => p.timestamp)
    ];
    
    allItems.forEach(timestamp => {
      if (!timestamp) return;
      const date = new Date(timestamp * 1000);
      const day = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const hour = date.getHours();
      data[day][hour]++;
    });
    
    // Calculate average activity per hour across all days
    const hourlyAverage = Array(24).fill(0);
    for (let hour = 0; hour < 24; hour++) {
      let total = 0;
      for (let day = 0; day < 7; day++) {
        total += data[day][hour];
      }
      hourlyAverage[hour] = total / 7;
    }
    
    // Find the 8-hour window with the least activity (likely sleeping hours)
    let minActivitySum = Infinity;
    let sleepStartHour = 0;
    
    for (let startHour = 0; startHour < 24; startHour++) {
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        const hour = (startHour + i) % 24;
        sum += hourlyAverage[hour];
      }
      if (sum < minActivitySum) {
        minActivitySum = sum;
        sleepStartHour = startHour;
      }
    }
    
    // Create array of sleeping hours
    const sleepingHours = new Set();
    for (let i = 0; i < 8; i++) {
      sleepingHours.add((sleepStartHour + i) % 24);
    }
    
    return { data, weekdays, sleepingHours };
  }, [comments, posts]);
  
  const maxCount = Math.max(...heatmapData.data.flat(), 1);
  
  const getColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    const intensity = count / maxCount;
    const baseColor = getDataColor(0); // Use red from our color system
    
    // Convert hex to rgba with intensity
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
  };
  
  return (
    <div className="heatmap-container" style={{ position: 'relative' }}>
      <div className="heatmap-grid">
        <div className="heatmap-yaxis">
          {heatmapData.weekdays.map(day => (
            <div key={day} className="heatmap-label">{day}</div>
          ))}
        </div>
        <div className="heatmap-cells" style={{ position: 'relative' }}>
          {/* Sleeping hours overlay - spans all rows */}
          {Array.from(heatmapData.sleepingHours).map(hour => (
            <div
              key={`sleep-overlay-${hour}`}
              style={{
                position: 'absolute',
                left: `${(hour / 24) * 100}%`,
                width: `${(1 / 24) * 100}%`,
                top: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0, 255, 127, 0.25), rgba(0, 255, 127, 0.1))',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          ))}
          
          {heatmapData.data.map((dayData, dayIndex) => (
            <div key={dayIndex} className="heatmap-row">
              {dayData.map((count, hour) => {
                const isSleepingHour = heatmapData.sleepingHours.has(hour);
                const cellStyle = {
                  backgroundColor: getColor(count),
                  position: 'relative',
                  zIndex: 2
                };
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className="heatmap-cell"
                    style={cellStyle}
                    title={`${heatmapData.weekdays[dayIndex]} ${hour}:00 - ${count} activities${isSleepingHour ? ' 💤 (likely sleeping)' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-xaxis">
        {[0, 6, 12, 18, 24].map(hour => (
          <span key={hour}>{hour}h</span>
        ))}
      </div>
    </div>
  );
}
