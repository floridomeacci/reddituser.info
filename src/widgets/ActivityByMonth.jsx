export default function ActivityByMonth({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const allActivity = [...(userData?.comments || []), ...(userData?.posts || [])];
  const activityByMonth = Array(12).fill(0);
  
  allActivity.forEach(item => {
    const date = new Date((item.timestamp || item.created_utc) * 1000);
    const month = date.getMonth();
    activityByMonth[month]++;
  });
  
  const maxActivity = Math.max(...activityByMonth, 1);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Activity by month</h3>
      <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '10px' }}>Posts & comments per month</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '4px',
        height: 'calc(100% - 50px)'
      }}>
        {monthNames.map((month, idx) => {
          const count = activityByMonth[idx];
          const intensity = count / maxActivity;
          const bgColor = count === 0 
            ? 'rgba(255, 255, 255, 0.05)' 
            : `rgba(255, 107, 107, ${0.15 + intensity * 0.85})`;
          
          return (
            <div
              key={month}
              style={{
                background: bgColor,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                color: count > maxActivity * 0.5 ? '#000' : '#fff',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              title={`${month}: ${count} items`}
            >
              <div style={{ fontSize: '9px', opacity: 0.8 }}>{month}</div>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
