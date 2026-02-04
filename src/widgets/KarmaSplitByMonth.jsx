export default function KarmaSplitByMonth({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  // Karma waffle chart by month - split by source (comments vs posts)
  const karmaByMonth = {};
  (userData?.comments || []).forEach(comment => {
    const ts = comment.timestamp || comment.created_utc;
    if (!ts) return;
    const date = new Date(ts * 1000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!karmaByMonth[monthKey]) karmaByMonth[monthKey] = { month: monthKey, commentKarma: 0, postKarma: 0 };
    karmaByMonth[monthKey].commentKarma += (comment.karma ?? comment.score ?? 0);
  });
  (userData?.posts || []).forEach(post => {
    const ts = post.timestamp || post.created_utc;
    if (!ts) return;
    const date = new Date(ts * 1000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!karmaByMonth[monthKey]) karmaByMonth[monthKey] = { month: monthKey, commentKarma: 0, postKarma: 0 };
    karmaByMonth[monthKey].postKarma += (post.karma ?? post.score ?? 0);
  });
  
  const karmaWaffleData = Object.entries(karmaByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: monthKey,
        label: `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`,
        commentKarma: data.commentKarma,
        postKarma: data.postKarma,
        totalKarma: data.commentKarma + data.postKarma
      };
    });

  // If more than 30 tiles (5x6), use smaller size to fit 10x12
  const tileCount = karmaWaffleData.length;
  const useSmallTiles = tileCount > 30;
  const minTileSize = useSmallTiles ? '14px' : '28px';
  const gapSize = useSmallTiles ? '2px' : '3px';

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Karma split by month</h3>
      <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '10px' }}>Each cube = 1 month. Opacity shows karma intensity</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(auto-fit, minmax(${minTileSize}, 1fr))`,
        gap: gapSize, 
        padding: '10px',
        height: 'calc(100% - 60px)',
        alignContent: 'start'
      }}>
        {karmaWaffleData.map((monthData, idx) => {
          const isCommentDominant = monthData.commentKarma > monthData.postKarma;
          const totalKarma = Math.abs(monthData.commentKarma) + Math.abs(monthData.postKarma);
          const dominance = totalKarma === 0 ? 0 : Math.abs(monthData.commentKarma - monthData.postKarma) / totalKarma;
          
          return (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                backgroundColor: isCommentDominant 
                  ? `rgba(255, 107, 107, ${0.3 + dominance * 0.7})` 
                  : `rgba(255, 107, 107, ${0.3 + dominance * 0.7})`,
                borderRadius: '2px',
                cursor: 'pointer'
              }}
              title={`${monthData.label}: Comments ${monthData.commentKarma} | Posts ${monthData.postKarma}`}
            />
          );
        })}
      </div>
    </div>
  );
}
