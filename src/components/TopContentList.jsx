export default function TopContentList({ items, type = 'comments' }) {
  if (!items || items.length === 0) {
    return <div className="content-list-empty">No {type} found</div>;
  }

  const getMedalIcon = (rank) => {
    return `${rank}`;
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayItems = items.slice(0, 10);

  return (
    <div className="top-content-list">
      {displayItems.map((item, index) => {
        // For mixed type, determine if it's a comment or post
        let title;
        if (type === 'mixed') {
          title = item.comment || item.body || item.title || item.post || '';
        } else if (type === 'comments') {
          title = item.body || item.comment || '';
        } else {
          title = item.title || item.post || '';
        }
        
        const score = item.score || item.karma || 0;
        const subreddit = item.subreddit || 'unknown';
        const icon = getMedalIcon(index + 1);
        const url = item.url || item.link;

        const handleClick = (e) => {
          if (url) {
            e.stopPropagation();
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        };

        return (
          <div 
            key={index} 
            className="content-list-item"
            onClick={handleClick}
            style={{ cursor: url ? 'pointer' : 'default' }}
          >
            <span className="content-rank">{icon}</span>
            <span className="content-text">{truncateText(title)}</span>
            <span className="content-sub">{type === 'mixed' ? '' : `r/${subreddit}`}</span>
            <span 
              className="content-score"
              style={{ color: score < 0 ? '#ff6b6b' : '#00ff7f' }}
            >
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
