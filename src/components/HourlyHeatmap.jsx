import { useMemo, useState } from 'react';
import { getDataColor } from '../design-tokens';

export default function HourlyHeatmap({ comments, posts }) {
  const [tooltip, setTooltip] = useState(null);

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
    
    // Count how many distinct weeks the data spans
    const weekSet = new Set();
    allItems.forEach(ts => {
      if (!ts) return;
      const d = new Date(ts * 1000);
      const year = d.getFullYear();
      const jan1 = new Date(year, 0, 1);
      const weekNum = Math.floor(((d - jan1) / 86400000 + jan1.getDay()) / 7);
      weekSet.add(`${year}-${weekNum}`);
    });
    const totalWeeks = Math.max(weekSet.size, 1);
    
    // Calculate average activity per hour across all days
    const hourlyAverage = Array(24).fill(0);
    for (let hour = 0; hour < 24; hour++) {
      let total = 0;
      for (let day = 0; day < 7; day++) {
        total += data[day][hour];
      }
      hourlyAverage[hour] = total / 7;
    }
    
    // Total activity across all hours (for threshold)
    const totalActivity = hourlyAverage.reduce((s, v) => s + v, 0);
    const avgPerHour = totalActivity / 24;
    
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
    
    // Only show sleeping window if it's genuinely inactive:
    // - The 8h window must have < 15% of total hourly activity
    // - At least 4 of the 8 hours must have zero or near-zero activity
    let showSleepWindow = false;
    const sleepingHours = new Set();
    
    const sleepWindowRatio = totalActivity > 0 ? minActivitySum / totalActivity : 1;
    let nearZeroCount = 0;
    for (let i = 0; i < 8; i++) {
      const hour = (sleepStartHour + i) % 24;
      if (hourlyAverage[hour] < avgPerHour * 0.15) {
        nearZeroCount++;
      }
    }
    
    if (sleepWindowRatio < 0.15 && nearZeroCount >= 4) {
      showSleepWindow = true;
      for (let i = 0; i < 8; i++) {
        sleepingHours.add((sleepStartHour + i) % 24);
      }
    }
    
    return { data, weekdays, sleepingHours, showSleepWindow, totalWeeks };
  }, [comments, posts]);
  
  const maxCount = Math.max(...heatmapData.data.flat(), 1);
  
  const getColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    const intensity = count / maxCount;
    const baseColor = getDataColor(0);
    
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
          {/* Sleeping hours overlay - only shown when confidently detected */}
          {heatmapData.showSleepWindow && Array.from(heatmapData.sleepingHours).map(hour => (
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
                const isSleepingHour = heatmapData.showSleepWindow && heatmapData.sleepingHours.has(hour);
                const avg = (count / heatmapData.totalWeeks).toFixed(1);
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
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = e.currentTarget.closest('.heatmap-container').getBoundingClientRect();
                      setTooltip({
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top - 4,
                        text: `${heatmapData.weekdays[dayIndex]} ${hour}:00`,
                        count,
                        avg,
                        sleep: isSleepingHour
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
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
      
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: '#1a1a1a',
          border: '1px solid rgba(255, 107, 107, 0.4)',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '12px',
          color: '#fff',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>{tooltip.text}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>
            {tooltip.count} total &middot; <span style={{ color: '#ff6b6b' }}>~{tooltip.avg}/week</span>
          </div>
          {tooltip.sleep && <div style={{ color: '#00ff7f', fontSize: '11px' }}>💤 likely sleeping</div>}
        </div>
      )}
    </div>
  );
}
