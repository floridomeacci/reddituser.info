import CommentLengthDistributionChart from '../components/CommentLengthDistributionChart';

export default function CommentLengthDist({ userData, style }) {
  if (!userData || !userData.comments?.length) return null;
  
  const lengths = (userData?.comments || []).map(c => (c.comment || '').length);
  let stats = 'No data';
  
  if (lengths.length > 0) {
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    const sorted = [...lengths].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    stats = `${lengths.length} comments • Avg: ${avg} chars • Median: ${median} chars • Range: ${min}-${max} chars`;
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Comment length distribution</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>{stats}</p>
      <CommentLengthDistributionChart comments={userData?.comments} />
    </div>
  );
}
