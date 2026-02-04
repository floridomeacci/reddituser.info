import { useState, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function ContentSearch({ comments = [], posts = [], style = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'comments', 'posts'
  const [sortBy, setSortBy] = useState('time'); // 'score', 'time', 'removed', 'controversial', 'nsfw', 'url'

  // Combine and search through content
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // Search comments
    if (selectedType === 'all' || selectedType === 'comments') {
      comments.forEach(comment => {
        const text = (comment.comment || comment.body || '');
        const textLower = text.toLowerCase();
        const isRemoved = text.includes('[removed]') || text.includes('[deleted]');
        
        // If query exists, check if it matches
        if (query && !textLower.includes(query)) return;
        
        results.push({
          type: 'comment',
          text: comment.comment || comment.body || '',
          subreddit: comment.subreddit,
          score: comment.karma || comment.score || 0,
          timestamp: comment.timestamp || comment.created_utc,
          url: comment.url || comment.permalink,
          isRemoved,
          isNsfw: comment.over_18 || false
        });
      });
    }

    // Search posts
    if (selectedType === 'all' || selectedType === 'posts') {
      posts.forEach(post => {
        const title = (post.title || '');
        const selftext = (post.selftext || post.text || post.post || '');
        const titleLower = title.toLowerCase();
        const selftextLower = selftext.toLowerCase();
        const isRemoved = selftext.includes('[removed]') || selftext.includes('[deleted]');
        
        // If query exists, check if it matches
        if (query && !titleLower.includes(query) && !selftextLower.includes(query)) return;
        
        results.push({
          type: 'post',
          text: post.title || '',
          selftext: post.selftext || post.text || post.post || '',
          subreddit: post.subreddit,
          score: post.score || post.karma || 0,
          timestamp: post.timestamp || post.created_utc,
          url: post.url || post.permalink,
          isRemoved,
          isNsfw: post.over_18 || false
        });
      });
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }, [searchQuery, selectedType, comments, posts]);

  // Apply sorting
  const sortedResults = useMemo(() => {
    if (sortBy === 'time') {
      return [...searchResults].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    if (sortBy === 'removed') {
      return [...searchResults].sort((a, b) => {
        // Removed items first, then by score
        if (a.isRemoved && !b.isRemoved) return -1;
        if (!a.isRemoved && b.isRemoved) return 1;
        return b.score - a.score;
      });
    }
    if (sortBy === 'controversial') {
      return [...searchResults].sort((a, b) => {
        // Sort by absolute value of score (closest to 0 = most controversial)
        const aControversy = Math.abs(a.score);
        const bControversy = Math.abs(b.score);
        return aControversy - bControversy;
      });
    }
    if (sortBy === 'nsfw') {
      return [...searchResults].sort((a, b) => {
        // NSFW items first, then by score
        if (a.isNsfw && !b.isNsfw) return -1;
        if (!a.isNsfw && b.isNsfw) return 1;
        return b.score - a.score;
      });
    }
    if (sortBy === 'url') {
      return [...searchResults].sort((a, b) => {
        // Sort alphabetically by URL
        const urlA = (a.url || '').toLowerCase();
        const urlB = (b.url || '').toLowerCase();
        return urlA.localeCompare(urlB);
      });
    }
    return searchResults; // sorted by score (karma)
  }, [searchResults, sortBy]);

  const highlightQuery = (text) => {
    if (!searchQuery.trim() || !text) return text;
    
    const query = searchQuery.trim();
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: COLORS.ACCENT_PRIMARY, color: '#000', fontWeight: '600' }}>
          {part}
        </span>
      ) : part
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="cell" style={{ ...style, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
      <h3>Content Search</h3>
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Left column: Search controls (1/3) */}
        <div style={{ width: '30%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="stat-meta" style={{ marginBottom: '8px' }}>Search through all posts and comments</p>
          <div style={{ flex: 1 }} />
          {/* Search input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts and comments..."
            style={{
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = COLORS.ACCENT_PRIMARY}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />

          {/* Type filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'comments', 'posts'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  background: selectedType === type ? COLORS.ACCENT_PRIMARY : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '4px',
                  color: selectedType === type ? '#000' : '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="stat-meta" style={{ margin: 0, fontSize: '11px' }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Right column: Results list (2/3) */}
        <div style={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          minHeight: 0,
          minWidth: 0
        }}>
          {/* Sort filters */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: '12px', marginRight: '4px' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 28px 6px 12px',
                background: '#ff6b6b',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '14px'
              }}
            >
              <option value="time" style={{ background: '#1a1a1a', color: '#fff' }}>Time</option>
              <option value="score" style={{ background: '#1a1a1a', color: '#fff' }}>Karma</option>
              <option value="removed" style={{ background: '#1a1a1a', color: '#fff' }}>Removed</option>
              <option value="controversial" style={{ background: '#1a1a1a', color: '#fff' }}>Controversial</option>
              <option value="nsfw" style={{ background: '#1a1a1a', color: '#fff' }}>NSFW</option>
              <option value="url" style={{ background: '#1a1a1a', color: '#fff' }}>URL</option>
            </select>
          </div>

          {/* Results */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            paddingRight: '8px',
            minHeight: 0
          }}>
        {searchResults.length > 0 ? (
            sortedResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  cursor: result.url ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onClick={() => result.url && window.open(result.url, '_blank')}
                onMouseEnter={(e) => {
                  if (result.url) {
                    e.currentTarget.style.borderColor = COLORS.ACCENT_PRIMARY;
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 6px',
                      background: result.type === 'comment' ? COLORS.DATA_1 : COLORS.DATA_2,
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      color: '#000'
                    }}>
                      {result.type}
                    </span>
                    <span style={{ fontSize: '10px', color: COLORS.TEXT_MUTED }}>
                      r/{result.subreddit}
                    </span>
                    <span style={{ fontSize: '10px', color: COLORS.TEXT_MUTED }}>
                      {formatTimestamp(result.timestamp)}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: result.score >= 0 ? COLORS.DATA_3 : COLORS.DATA_4
                  }}>
                    {result.score >= 0 ? '+' : ''}{result.score}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.5', 
                  color: '#fff',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {highlightQuery(
                    result.type === 'post' 
                      ? result.text 
                      : result.text.length > 200 
                        ? result.text.substring(0, 200) + '...' 
                        : result.text
                  )}
                </div>
                {result.type === 'post' && result.selftext && (
                  <div style={{ 
                    fontSize: '11px', 
                    lineHeight: '1.4', 
                    color: COLORS.TEXT_MUTED,
                    marginTop: '6px',
                    fontStyle: 'italic',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {highlightQuery(
                      result.selftext.length > 150 
                        ? result.selftext.substring(0, 150) + '...' 
                        : result.selftext
                    )}
                  </div>
                )}
              </div>
            ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: COLORS.TEXT_MUTED, 
            padding: '40px 20px',
            fontSize: '13px'
          }}>
            {searchQuery.trim() 
              ? `No results found for "${searchQuery}"`
              : 'No content available'}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
