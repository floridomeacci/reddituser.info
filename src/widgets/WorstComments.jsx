import TopContentList from '../components/TopContentList';

export default function WorstComments({ userData, style }) {
  const worstComments = [...(userData?.comments || [])]
    .sort((a, b) => (a.karma || 0) - (b.karma || 0));

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Worst comments</h3>
      <TopContentList items={worstComments} type="comments" isWorst={true} />
    </div>
  );
}
