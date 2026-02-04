import { COLORS, CHART_CONFIG, getDesignTokens } from '../design-tokens';

export default function RemovedComments({ userData, style }) {
  const tokens = getDesignTokens();
  
  // Detect removed content from posts and comments
  // Check for: responding === '[deleted]', body === '[deleted]', body === '[removed]', 
  // selftext === '[removed]', removed_by_category field
  
  // Comments where user replied to deleted accounts or where the comment was removed
  const deletedAccountReplies = (userData?.comments || []).filter(c => {
    return c.responding === '[deleted]' || 
           (c.body || c.comment) === '[deleted]' ||
           (c.body || c.comment) === '[removed]';
  });
  
  // Posts that were removed (check removed_by_category or selftext === '[removed]')
  const removedPosts = (userData?.posts || []).filter(p => {
    return p.removed_by_category || 
           p.selftext === '[removed]' ||
           p.selftext === '[deleted]';
  });
  
  // Combine and group by subreddit
  const allRemovedContent = [
    ...deletedAccountReplies.map(c => ({ ...c, type: 'comment' })),
    ...removedPosts.map(p => ({ ...p, type: 'post' }))
  ];
  
  const contentBySubreddit = allRemovedContent.reduce((acc, item) => {
    const sub = (item.subreddit || 'unknown').toLowerCase().trim();
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(item);
    return acc;
  }, {});
  
  // Sort subreddits by content count and take top 8
  const topSubreddits = Object.entries(contentBySubreddit)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 8);
  
  const handleClick = (item) => {
    const url = item.url || (item.permalink ? `https://reddit.com${item.permalink}` : null);
    if (url) window.open(url, '_blank');
  };

  const totalRemoved = allRemovedContent.length;

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Removed Content</h3>
      <p className="stat-meta" style={{ marginBottom: '2px', fontSize: '8px' }}>
        {totalRemoved > 0 
          ? `${deletedAccountReplies.length} deleted replies, ${removedPosts.length} removed posts`
          : 'Includes posts/comments removed by mods and replies to deleted accounts'}
      </p>
      {topSubreddits.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px', height: 'calc(100% - 45px)', justifyContent: 'space-evenly' }}>
          {topSubreddits.map(([subreddit, items]) => (
            <div key={subreddit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '5px', color: tokens.text?.primary || COLORS.TEXT_PRIMARY, minWidth: '85px', textAlign: 'right' }}>
                r/{subreddit}
              </span>
              <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleClick(item)}
                    style={{
                      height: '6px',
                      flex: 1,
                      backgroundColor: item.type === 'post' ? '#e63946' : '#666666',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                    title={`${item.type === 'post' ? 'Post' : 'Comment'}: ${item.karma ?? item.score ?? 0} karma - Click to view`}
                  />
                ))}
              </div>
              <span style={{ fontSize: '5px', color: tokens.text?.secondary || COLORS.TEXT_GREY, minWidth: '12px' }}>
                {items.length}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '11px', color: COLORS.TEXT_GREY_LIGHT, marginTop: '20px' }}>No removed content detected</p>
      )}
    </div>
  );
}
