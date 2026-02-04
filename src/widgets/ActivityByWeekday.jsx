import WeekdayBarChart from '../components/WeekdayBarChart';

export default function ActivityByWeekday({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Activity by weekday</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Total posts & comments per day of week</p>
      <WeekdayBarChart comments={userData?.comments} posts={userData?.posts} />
    </div>
  );
}
