import WorldMap from '../components/WorldMap';

export default function WorldMapWidget({
  userData,
  activityByHour,
  peakWindow,
  onHighlightedCountriesChange,
  onConfidenceChange,
  style
}) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Estimated Location</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Based on mentioned locations, timezone, and language patterns
      </p>
      <WorldMap 
        comments={userData?.comments} 
        posts={userData?.posts}
        activityByHour={activityByHour}
        peakWindow={peakWindow}
        onHighlightedCountriesChange={onHighlightedCountriesChange}
        onConfidenceChange={onConfidenceChange}
      />
    </div>
  );
}
