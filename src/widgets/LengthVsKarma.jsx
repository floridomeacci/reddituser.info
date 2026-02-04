import CommentScatter from '../components/CommentScatter';

export default function LengthVsKarma({ userData, style }) {
  if (!userData || !userData.comments?.length) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Length vs Karma</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Comment length vs karma score relationship</p>
      <CommentScatter comments={userData?.comments} />
    </div>
  );
}
