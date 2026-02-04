import EmojiAnalysis from '../components/EmojiAnalysis';

export default function TopEmojis({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Top emojis</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Most frequently used emojis in posts & comments
      </p>
      <EmojiAnalysis comments={userData?.comments} posts={userData?.posts} />
    </div>
  );
}
