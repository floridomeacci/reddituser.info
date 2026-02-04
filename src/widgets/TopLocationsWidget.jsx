import TopLocations from '../components/TopLocations';

export default function TopLocationsWidget({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={style}>
      <h3>Top Locations</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Most mentioned places</p>
      <TopLocations comments={userData?.comments} posts={userData?.posts} />
    </div>
  );
}
