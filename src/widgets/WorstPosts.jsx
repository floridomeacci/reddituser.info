import TopContentList from '../components/TopContentList';

export default function WorstPosts({ userData, style }) {
  const worstPosts = [...(userData?.posts || [])]
    .sort((a, b) => (a.karma ?? a.score ?? 0) - (b.karma ?? b.score ?? 0));

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Worst posts</h3>
      <TopContentList items={worstPosts} type="posts" isWorst={true} />
    </div>
  );
}
