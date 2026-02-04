import { useState, useMemo } from 'react';
import WordCloud from '../components/WordCloud';

export default function TopWords({ userData, style }) {
  const [selectedWord, setSelectedWord] = useState(null);
  
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  // Use comments if available, otherwise posts
  const hasComments = userData.comments?.length > 0;
  const hasPosts = userData.posts?.length > 0;
  const contentSource = hasComments ? userData.comments : userData.posts;
  const contentType = hasComments ? 'comments' : 'posts';
  
  // Check if there's any text content to analyze
  const hasTextContent = useMemo(() => {
    return contentSource.some(item => {
      const text = hasComments 
        ? (item.comment || item.body || '') 
        : (item.title || item.selftext || item.body || '');
      return text.trim().length > 0;
    });
  }, [contentSource, hasComments]);
  
  if (!hasTextContent) return null;
  
  const selectedComments = selectedWord ? contentSource.filter(c => {
    const text = hasComments ? (c.comment || c.body || '') : (c.title || c.selftext || c.body || '');
    return text.toLowerCase().includes(selectedWord.toLowerCase());
  }).slice(0, 50).map(c => ({ 
    ...c, 
    text: hasComments ? (c.comment || c.body) : (c.title || c.selftext || c.body)
  })) : [];
  
  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Top words {!hasComments && hasPosts ? '(from posts)' : ''}</h3>
      {!selectedWord ? (
        <>
          {hasComments ? (
            <WordCloud comments={userData?.comments} onWordClick={setSelectedWord} />
          ) : (
            <WordCloud posts={userData?.posts} onWordClick={setSelectedWord} />
          )}
        </>
      ) : (
        <div style={{ height: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Contains "{selectedWord}" ({selectedComments.length})</h4>
            <button 
              onClick={() => setSelectedWord(null)}
              style={{
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                padding: '4px 12px',
                color: '#ff6b6b',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedComments.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  borderLeft: '3px solid #ff6b6b'
                }}
              >
                <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>
                  r/{item.subreddit} • {item.karma || 0} karma
                </div>
                <div style={{ fontSize: '11px', color: '#fff', lineHeight: '1.4' }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
