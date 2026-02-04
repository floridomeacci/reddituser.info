import TopContentList from '../components/TopContentList';

export default function TopPosts({ userData, style }) {
  const topPosts = [...(userData?.posts || [])]
    .sort((a, b) => (b.karma || 0) - (a.karma || 0));

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Top posts</h3>
      <TopContentList items={topPosts} type="posts" />
    </div>
  );
}
