import { COLORS, getDataColor } from '../design-tokens.js';

export default function EmojiAnalysis({ comments, posts }) {
  const extractEmojis = (text) => {
    if (!text) return [];
    // eslint-disable-next-line no-misleading-character-class
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu;
    return text.match(emojiRegex) || [];
  };

  const countEmojis = () => {
    const emojiMap = new Map();

    (comments || []).forEach(comment => {
      const text = comment.body || comment.comment;
      if (text) {
        const emojis = extractEmojis(text);
        emojis.forEach(emoji => {
          emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1);
        });
      }
    });

    (posts || []).forEach(post => {
      const text = post.title || post.post;
      if (text) {
        const emojis = extractEmojis(text);
        emojis.forEach(emoji => {
          emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1);
        });
      }
    });

    return Array.from(emojiMap.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  const emojiCounts = countEmojis();
  if (emojiCounts.length === 0) return <div className="emoji-empty">No emojis found</div>;

  const maxCount = Math.max(...emojiCounts.map(e => e.count));

  return (
    <div className="emoji-compact-grid">
      {emojiCounts.map((item, index) => {
        const heightPercent = (item.count / maxCount) * 100;
        return (
          <div key={index} className="emoji-compact-item">
            <span className="emoji-compact-char">{item.emoji}</span>
            <span className="emoji-compact-count">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}
