import TopContentList from '../components/TopContentList';

export default function TopComments({ userData, style }) {
  const topComments = [...(userData?.comments || [])]
    .sort((a, b) => (b.karma || 0) - (a.karma || 0));

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Top comments</h3>
      <TopContentList items={topComments} type="comments" />
    </div>
  );
}
