import HourlyHeatmap from '../components/HourlyHeatmap';

export default function ActivityHeatmap({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Activity heatmap</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Activity by day of week and hour of day</p>
      <HourlyHeatmap comments={userData?.comments} posts={userData?.posts} />
    </div>
  );
}
