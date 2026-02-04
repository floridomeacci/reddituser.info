import ScoreDistributionChart from '../components/ScoreDistributionChart';

export default function KarmaDistribution({ userData, style }) {
  if (!userData || !userData.comments?.length) return null;
  
  const scores = (userData?.comments || []).map(c => c.karma ?? c.score ?? 0);
  let stats = '';
  
  if (scores.length > 0) {
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const median = [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)];
    stats = ` • Average: ${avg} • Median: ${median}`;
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Karma Distribution</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Bell curve showing how comment karma is distributed{stats}
      </p>
      <ScoreDistributionChart comments={userData?.comments} />
    </div>
  );
}
