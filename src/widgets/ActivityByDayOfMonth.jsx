export default function ActivityByDayOfMonth({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  const calculateDayOfMonthActivity = () => {
    const dayOfMonthCounts = Array(31).fill(0);
    const allItems = [...(userData?.comments || []), ...(userData?.posts || [])];
    
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const date = new Date(timestamp * 1000);
        const dayOfMonth = date.getDate();
        dayOfMonthCounts[dayOfMonth - 1]++;
      }
    });
    
    return Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      count: dayOfMonthCounts[i]
    }));
  };

  const activityByDayOfMonth = calculateDayOfMonthActivity();
  const maxDayCount = Math.max(...activityByDayOfMonth.map(d => d.count), 1);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Activity by day of month</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Which days of the month are you most active? (1-31)</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px', 
        padding: '10px',
        height: 'calc(100% - 60px)'
      }}>
        {activityByDayOfMonth.map((dayData, idx) => {
          const isTopDay = dayData.count === maxDayCount && dayData.count > 0;
          const ratio = dayData.count === 0 ? 0 : dayData.count / maxDayCount;
          let bgColor;
          let textColor;
          
          if (isTopDay) {
            bgColor = 'rgba(0, 255, 127, 0.8)';
            textColor = '#000';
          } else if (dayData.count === 0) {
            bgColor = 'rgba(50, 50, 50, 0.3)';
            textColor = 'rgba(255, 255, 255, 0.5)';
          } else {
            const opacity = 0.3 + (ratio * 0.7);
            bgColor = `rgba(255, 107, 107, ${opacity})`;
            textColor = ratio > 0.5 ? '#000' : '#fff';
          }
          
          return (
            <div
              key={idx}
              style={{
                background: bgColor,
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                fontSize: '11px',
                color: textColor,
                fontWeight: dayData.count > 0 ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isTopDay ? '2px solid #00ff7f' : 'none'
              }}
              title={`Day ${dayData.day}: ${dayData.count} activities${isTopDay ? ' (Most active!)' : ''}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              <div style={{ fontSize: '10px', opacity: 0.7 }}>Day {dayData.day}</div>
              {dayData.count > 0 && <div style={{ fontWeight: 'bold' }}>{dayData.count}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
