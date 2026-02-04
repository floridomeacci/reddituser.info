import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { CHART_CONFIG, getDesignTokens } from '../design-tokens';

export default function LongestStreak({ userData, style }) {
  const tokens = getDesignTokens();
  
  const calculateStreakOverTime = () => {
    const allActivity = [...(userData?.comments || []), ...(userData?.posts || [])];
    if (allActivity.length === 0) return { data: [], maxStreak: 0, streakStart: null, streakEnd: null };
    
    // Group activities by calendar day
    const activityByDay = {};
    allActivity.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      const date = new Date(timestamp * 1000);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!activityByDay[dayKey]) {
        activityByDay[dayKey] = {
          dayKey,
          timestamp: timestamp,
          date: date,
          activities: []
        };
      }
      activityByDay[dayKey].activities.push(item);
    });
    
    // Sort days
    const sortedDays = Object.values(activityByDay).sort((a, b) => a.timestamp - b.timestamp);
    
    // Find the longest streak of consecutive days
    let maxStreak = 1;
    let maxStreakStart = 0;
    let maxStreakEnd = 0;
    let currentStreak = 1;
    let currentStreakStart = 0;
    
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1].date);
      const currDate = new Date(sortedDays[i].date);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakStart = currentStreakStart;
          maxStreakEnd = i;
        }
      } else {
        currentStreak = 1;
        currentStreakStart = i;
      }
    }
    
    // Extract the longest streak period with timestamps for proper time-based plotting
    const streakData = [];
    const streakStartTime = sortedDays[maxStreakStart].timestamp;
    
    for (let i = maxStreakStart; i <= maxStreakEnd; i++) {
      const day = sortedDays[i];
      const hoursFromStart = (day.timestamp - streakStartTime) / 3600;
      
      // Add multiple data points per day to show activity distribution
      day.activities.forEach((activity, actIndex) => {
        const actTimestamp = activity.timestamp || activity.created_utc;
        const actHoursFromStart = (actTimestamp - streakStartTime) / 3600;
        
        streakData.push({
          timestamp: actTimestamp,
          hoursFromStart: actHoursFromStart,
          date: new Date(actTimestamp * 1000),
          streak: i - maxStreakStart + 1,
          dayNumber: i - maxStreakStart + 1
        });
      });
    }
    
    // Sort by timestamp to ensure proper ordering
    streakData.sort((a, b) => a.timestamp - b.timestamp);
    
    return { 
      data: streakData, 
      maxStreak,
      streakStart: sortedDays[maxStreakStart]?.date,
      streakEnd: sortedDays[maxStreakEnd]?.date
    };
  };
  
  const { data: streakData, maxStreak, streakStart, streakEnd } = calculateStreakOverTime();

  const formatXAxis = (hours) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    if (days > 0) {
      return `Day ${days + 1}`;
    }
    return `${remainingHours}h`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          padding: '8px 12px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#fff' }}>
            {data.date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold', color: tokens.colors.accentPrimary }}>
            Streak: {data.streak} days
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Longest activity streak</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {maxStreak} consecutive days
        {streakStart && streakEnd && (
          <span style={{ display: 'block', fontSize: '9px', marginTop: '2px', opacity: 0.7 }}>
            {streakStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {streakEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </p>
      
      {streakData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={streakData}>
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tokens.colors.accentPrimary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={tokens.colors.accentPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hoursFromStart" 
                tickFormatter={formatXAxis}
                stroke={tokens.colors.textSecondary}
                style={{ fontSize: '10px' }}
                tick={{ fill: tokens.colors.textSecondary }}
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                stroke={tokens.colors.textSecondary}
                style={{ fontSize: '10px' }}
                tick={{ fill: tokens.colors.textSecondary }}
                label={{ 
                  value: 'Streak (days)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '10px', fill: tokens.colors.textSecondary }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="streak"
                stroke={tokens.colors.accentPrimary}
                strokeWidth={2}
                fill="url(#streakGradient)"
                dot={false}
                activeDot={{ r: 4, fill: tokens.colors.accentPrimary }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100px',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '11px' }}>No activity data</p>
        </div>
      )}
    </div>
  );
}
