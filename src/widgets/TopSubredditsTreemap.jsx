import SubredditTreemap from '../components/SubredditTreemap';

export default function TopSubredditsTreemap({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  const subredditCounts = {};
  const subredditKarma = {};
  
  userData?.comments?.forEach((comment) => {
    const sub = comment.subreddit;
    subredditCounts[sub] = (subredditCounts[sub] || 0) + 1;
    subredditKarma[sub] = (subredditKarma[sub] || 0) + (comment.karma || 0);
  });
  
  userData?.posts?.forEach((post) => {
    const sub = post.subreddit;
    subredditCounts[sub] = (subredditCounts[sub] || 0) + 1;
    subredditKarma[sub] = (subredditKarma[sub] || 0) + (post.karma || 0);
  });

  const topSubreddits = Object.entries(subredditCounts)
    .map(([name, count]) => ({ name, count, karma: subredditKarma[name] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Top subreddits</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Activity distribution treemap</p>
      <div style={{ height: 'calc(100% - 60px)', width: '100%' }}>
        <SubredditTreemap subreddits={topSubreddits} />
      </div>
    </div>
  );
}
