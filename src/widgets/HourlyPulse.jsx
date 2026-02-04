import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea } from 'recharts';
import { CHART_CONFIG, getDesignTokens } from '../design-tokens';
import { COLORS } from '../design-tokens';

export default function HourlyPulse({ userData, style }) {
  const [useEstimatedTimezone, setUseEstimatedTimezone] = useState(false);
  const tokens = getDesignTokens();

  // Get viewer's local timezone offset
  const viewerTimezoneOffset = -new Date().getTimezoneOffset() / 60;
  const viewerTimezoneStr = `UTC${viewerTimezoneOffset >= 0 ? '+' : ''}${viewerTimezoneOffset}`;

  // Calculate activity from actual comments and posts
  const calculateHourlyActivity = () => {
    const hourCounts = Array(24).fill(0);
    const allItems = [...(userData?.comments || []), ...(userData?.posts || [])];
    
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const date = new Date(timestamp * 1000);
        const hour = date.getUTCHours(); // Use UTC hours as baseline
        hourCounts[hour]++;
      }
    });
    
    return hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    }));
  };

  let activityByHour = calculateHourlyActivity();
  
  if (!activityByHour || activityByHour.length === 0) {
    activityByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0
    }));
  }

  // Calculate sleeping hours to estimate timezone
  let sleepStartHour = 0;
  let isBotLike = false;

  if (activityByHour && activityByHour.length > 0) {
    const totalActivity = activityByHour.reduce((sum, h) => sum + h.count, 0);
    let minActivitySum = Infinity;
    for (let startHour = 0; startHour < 24; startHour++) {
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        const hourIdx = (startHour + i) % 24;
        sum += activityByHour[hourIdx].count;
      }
      if (sum < minActivitySum) {
        minActivitySum = sum;
        sleepStartHour = startHour;
      }
    }

    if (totalActivity > 50 && (minActivitySum / totalActivity) > 0.20) {
      isBotLike = true;
    }
  }

  let displayedActivityByHour = activityByHour;
  let timezoneOffset = 0;

  if (useEstimatedTimezone && !isBotLike) {
    displayedActivityByHour = Array.from({ length: 24 }, (_, i) => {
      const sourceIndex = (i + sleepStartHour) % 24;
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        count: activityByHour[sourceIndex].count,
        originalHour: activityByHour[sourceIndex].hour
      };
    });
    
    let offset = (24 - sleepStartHour) % 24;
    if (offset > 12) offset -= 24;
    timezoneOffset = offset;
  } else if (isBotLike && useEstimatedTimezone) {
    setUseEstimatedTimezone(false);
  }
  
  // Find peak activity window
  const findPeakActivityWindow = (data) => {
    if (!data || data.length === 0) {
      return { 
        start: 0, end: 3, peak: 0,
        startFormatted: '00:00', endFormatted: '03:00'
      };
    }
    
    let maxSum = 0;
    let peakStart = 0;
    const windowSize = 3;
    
    for (let i = 0; i <= data.length - windowSize; i++) {
      const sum = data.slice(i, i + windowSize).reduce((acc, h) => acc + (h.count || 0), 0);
      if (sum > maxSum) {
        maxSum = sum;
        peakStart = i;
      }
    }
    
    const startHour = data[peakStart].hour;
    const endHour = data[Math.min(peakStart + windowSize - 1, data.length - 1)].hour;
    
    const parseHour = (hourStr) => {
      if (typeof hourStr === 'number') return hourStr;
      return parseInt(hourStr.split(':')[0], 10);
    };
    
    return {
      start: parseHour(startHour),
      end: parseHour(endHour),
      peak: parseHour(data[peakStart + Math.floor(windowSize / 2)]?.hour || startHour),
      startFormatted: startHour,
      endFormatted: endHour
    };
  };
  
  const peakWindow = findPeakActivityWindow(displayedActivityByHour);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Hourly pulse</h3>
      {isBotLike && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-4px', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', color: '#ff6b6b', fontWeight: 'bold', border: '1px solid #ff6b6b', padding: '2px 6px', borderRadius: '4px' }}>
            POSSIBLE BOT (No sleep detected)
          </span>
        </div>
      )}
      <p className="stat-meta" style={{ marginBottom: '4px' }}>Activity count per hour of day (24h format)</p>
      {displayedActivityByHour.some(h => h.count > 0) ? (
        <>
          <p style={{ fontSize: '9px', color: COLORS.ACCENT_PRIMARY, marginBottom: '4px', marginTop: 0 }}>
            Peak activity: {peakWindow.startFormatted}-{peakWindow.endFormatted} (highlighted)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '9px', color: tokens.colors.textLightGrey }}>
                {useEstimatedTimezone ? `User Est. (UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset})` : `Viewer (${viewerTimezoneStr})`}
              </span>
              <label style={{ position: 'relative', display: 'inline-block', width: '30px', height: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={useEstimatedTimezone}
                  onChange={(e) => setUseEstimatedTimezone(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: useEstimatedTimezone ? COLORS.ACCENT_PRIMARY : '#333',
                  transition: '.4s',
                  borderRadius: '34px',
                  border: '1px solid #444'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '12px',
                    width: '12px',
                    left: useEstimatedTimezone ? '16px' : '1px',
                    bottom: '1px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%'
                  }}/>
                </span>
              </label>
            </div>
          </div>
        </>
      ) : (
        <p style={{ fontSize: '9px', color: '#ff6b6b', marginBottom: '8px', marginTop: 0 }}>
          No activity data - Search for a username above to load data
        </p>
      )}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayedActivityByHour}>
            <defs>
              <linearGradient id="peakGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke={tokens.chart.axis}
              tick={CHART_CONFIG.axis.tick}
              axisLine={CHART_CONFIG.axis.axisLine}
              label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: tokens.chart.axis }}
            />
            <YAxis
              stroke={tokens.chart.axis}
              tick={CHART_CONFIG.axis.tick}
              axisLine={CHART_CONFIG.axis.axisLine}
              label={{ value: 'Posts + Comments', angle: -90, position: 'insideLeft', fill: tokens.chart.axis }}
              domain={[0, 'auto']}
            />
            <ReferenceArea
              x1={peakWindow.startFormatted}
              x2={peakWindow.endFormatted}
              fill="url(#peakGlow)"
              fillOpacity={1}
              label={{
                value: 'Most active',
                position: 'top',
                fill: COLORS.ACCENT_PRIMARY,
                fontSize: 10,
                fontWeight: 600
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#666" 
              strokeWidth={CHART_CONFIG.line.strokeWidth} 
              dot={{ fill: COLORS.ACCENT_PRIMARY, r: CHART_CONFIG.line.dot.r }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
