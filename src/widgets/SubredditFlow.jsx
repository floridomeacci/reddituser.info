import SubredditChordDiagram from '../components/SubredditChordDiagram';

export default function SubredditFlow({ userData, style }) {
  if (!userData || !userData.comments?.length) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, padding: '0' }}>
      <SubredditChordDiagram comments={userData?.comments} />
    </div>
  );
}
