import WorldMap from '../components/WorldMap';

export default function WorldMapWidget({
  userData,
  activityByHour,
  peakWindow,
  aiLocation,
  onHighlightedCountriesChange,
  onConfidenceChange,
  style
}) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Estimated Location</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Based on AI analysis, mentioned locations, timezone, and language
      </p>
      <WorldMap 
        comments={userData?.comments} 
        posts={userData?.posts}
        activityByHour={activityByHour}
        peakWindow={peakWindow}
        aiLocation={aiLocation}
        onHighlightedCountriesChange={onHighlightedCountriesChange}
        onConfidenceChange={onConfidenceChange}
      />
    </div>
  );
}
