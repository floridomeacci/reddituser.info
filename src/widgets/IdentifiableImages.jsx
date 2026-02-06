import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';
import nsfwSubreddits from '../data/nsfwSubreddits';

export default function IdentifiableImages({ userData, style = {} }) {
  const [identifiableData, setIdentifiableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNSFW, setShowNSFW] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // Extract post titles from media posts
  const mediaPosts = useMemo(() => {
    if (!userData || !userData.posts?.length) {
      return [];
    }

    return (userData.posts || [])
      .filter(post => post.media) // Only posts with images/videos
      .map((post, index) => ({
        id: index,
        title: post.title || post.post || '',
        media: post.media,
        subreddit: post.subreddit,
        url: post.url || (post.permalink ? `https://reddit.com${post.permalink}` : null),
        timestamp: post.timestamp || post.created_utc,
        isNSFW: post.over_18 || nsfwSubreddits.some(nsfw => 
          post.subreddit?.toLowerCase() === nsfw.toLowerCase().replace('/r/', '')
        )
      }))
      .filter(post => post.title.length > 5); // Only meaningful titles
  }, [userData]);

  // Query AI endpoint
  useEffect(() => {
    if (mediaPosts.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;
        
        // Build the query with all post titles
        const titlesText = mediaPosts.map((p, idx) => `[${idx}] ${p.title}`).join('\n');
        
        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Analyze these Reddit post titles from image/video posts. Identify which posts might contain identifiable images of the person (selfies, appearance, body parts, face, hair, clothing, tattoos, personal items, home interior, etc.). Return JSON with this structure: {"identifiable": [{"id": 0, "reason": "suggests appearance/identity", "risk": "high/medium/low", "category": "selfie/appearance/location/other"}], "summary": "brief overview"}. Post titles:\n${titlesText}`,
            sessionId: sessionId
          })
        });

        if (!response.ok) throw new Error('AI query failed');
        
        const raw = await response.json();
        // n8n returns [{"output": "JSON string"}] - unwrap it
        let parsed = raw;
        if (Array.isArray(raw) && raw[0]?.output) {
          try { parsed = JSON.parse(raw[0].output); } catch (e) { parsed = raw[0].output; }
        } else if (typeof raw === 'string') {
          try { parsed = JSON.parse(raw); } catch (e) { /* keep as-is */ }
        }
        
        setIdentifiableData(parsed);
      } catch (err) {
        setError(err.message);
        console.error('Identifiable Images AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [mediaPosts, userData]);

  const handleImageError = (index) => {
    setBrokenImages(prev => new Set([...prev, index]));
  };

  if (!userData || !userData.posts?.length) {
    return (
      <div className="cell" style={style}>
        <h3>⚠️ Identifiable Images</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (mediaPosts.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>⚠️ Identifiable Images</h3>
        <p className="stat-meta">No media posts found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cell" style={style}>
        <h3>⚠️ Identifiable Images</h3>
        <p className="stat-meta">
          <span style={{ display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }}>
            Analyzing {mediaPosts.length} media posts...
          </span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cell" style={style}>
        <h3>⚠️ Identifiable Images</h3>
        <p className="stat-meta" style={{ color: COLORS.error }}>Error: {error}</p>
      </div>
    );
  }

  if (!identifiableData) {
    return (
      <div className="cell" style={style}>
        <h3>⚠️ Identifiable Images</h3>
        <p className="stat-meta">Waiting for analysis...</p>
      </div>
    );
  }

  const identifiableItems = identifiableData.identifiable || [];
  const identifiableWithData = identifiableItems
    .map(item => ({
      ...item,
      post: mediaPosts[item.id]
    }))
    .filter(item => item.post); // Filter out items where post doesn't exist

  const riskColors = {
    high: '#ff4444',
    medium: '#ffaa00',
    low: '#ffdd44'
  };

  return (
    <div className="cell" style={style}>
      <h3>⚠️ Identifiable Images</h3>
      <p className="stat-meta" style={{ marginBottom: '12px' }}>
        Found {identifiableWithData.length} potentially identifiable post{identifiableWithData.length !== 1 ? 's' : ''}
        {identifiableWithData.length > 0 && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 68, 68, 0.2)',
            color: '#ff6b6b'
          }}>
            Privacy Risk
          </span>
        )}
      </p>

      {identifiableData.summary && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 170, 0, 0.1)',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#ffaa00',
          lineHeight: '1.4'
        }}>
          {identifiableData.summary}
        </div>
      )}

      {identifiableWithData.length === 0 ? (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(46, 213, 115, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#2ed573'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
          <div>No obviously identifiable images detected</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          maxHeight: 'calc(100% - 100px)',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {identifiableWithData.map((item, index) => {
            const isVideo = item.post.media?.includes('v.redd.it') || false;
            const isBroken = brokenImages.has(item.id);

            return (
              <div
                key={index}
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `2px solid ${riskColors[item.risk] || '#666'}`,
                  position: 'relative'
                }}
              >
                {/* Risk Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: riskColors[item.risk] || '#666',
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  zIndex: 2
                }}>
                  {item.risk} Risk
                </div>

                {/* Image Preview */}
                <a 
                  href={item.post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', position: 'relative' }}
                >
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundColor: '#0a0a0a',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {isBroken ? (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '32px'
                      }}>
                        🚫
                      </div>
                    ) : isVideo ? (
                      <video
                        src={item.post.media}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: item.post.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
                        }}
                        muted
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <img
                        src={item.post.media}
                        alt={item.post.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: item.post.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
                        }}
                        onError={() => handleImageError(item.id)}
                      />
                    )}

                    {/* NSFW Overlay */}
                    {item.post.isNSFW && !showNSFW && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '20px'
                      }}>
                        🔞
                      </div>
                    )}
                  </div>
                </a>

                {/* Post Details */}
                <div style={{ padding: '12px' }}>
                  {/* Category Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    marginBottom: '6px',
                    color: '#aaa'
                  }}>
                    {item.category}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: '11px',
                    color: '#fff',
                    marginBottom: '6px',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.post.title}
                  </div>

                  {/* Reason */}
                  <div style={{
                    fontSize: '10px',
                    color: '#888',
                    lineHeight: '1.3',
                    fontStyle: 'italic'
                  }}>
                    {item.reason}
                  </div>

                  {/* Subreddit */}
                  <div style={{
                    marginTop: '6px',
                    fontSize: '10px',
                    color: '#666'
                  }}>
                    r/{item.post.subreddit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {identifiableWithData.some(item => item.post.isNSFW) && !showNSFW && (
        <button
          onClick={() => setShowNSFW(true)}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            padding: '6px 12px',
            backgroundColor: 'rgba(255, 68, 68, 0.2)',
            border: '1px solid #ff4444',
            borderRadius: '6px',
            color: '#ff6b6b',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Show NSFW ({identifiableWithData.filter(item => item.post.isNSFW).length})
        </button>
      )}
    </div>
  );
}
