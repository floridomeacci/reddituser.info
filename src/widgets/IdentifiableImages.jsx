import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';
import nsfwSubreddits from '../data/nsfwSubreddits';

export default function IdentifiableImages({ userData, style = {} }) {
  const [identifiableData, setIdentifiableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNSFW, setShowNSFW] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? identifiableWithData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === identifiableWithData.length - 1 ? 0 : prev + 1));
  };

  const currentItem = identifiableWithData[currentIndex];
  const isVideo = currentItem?.post?.media?.includes('v.redd.it') || false;
  const isBroken = currentItem ? brokenImages.has(currentItem.id) : false;

  return (
    <div className="cell" style={style}>
      <h3>⚠️ Identifiable Images</h3>
      
      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '16px',
        height: 'calc(100% - 40px)',
        marginTop: '12px'
      }}>
        {/* Left Column - Text Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          paddingRight: '8px'
        }}>
          <p className="stat-meta" style={{ margin: 0 }}>
            Found {identifiableWithData.length} potentially identifiable post{identifiableWithData.length !== 1 ? 's' : ''}
          </p>

          {identifiableWithData.length > 0 && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 68, 68, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#ff6b6b',
              fontWeight: 500
            }}>
              Privacy Risk Detected
            </div>
          )}

          {identifiableData.summary && (
            <div style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 170, 0, 0.1)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#ffaa00',
              lineHeight: '1.5',
              border: '1px solid rgba(255, 170, 0, 0.3)'
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
              color: '#2ed573',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontSize: '13px' }}>No obviously identifiable images detected</div>
            </div>
          ) : currentItem && (
            <>
              {/* Current Item Details */}
              <div style={{
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                border: `2px solid ${riskColors[currentItem.risk] || '#666'}`,
                marginTop: '8px'
              }}>
                {/* Risk Badge */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: riskColors[currentItem.risk] || '#666',
                  color: '#000',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  {currentItem.risk} Risk
                </div>

                {/* Category */}
                <div style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#aaa',
                  marginBottom: '10px'
                }}>
                  {currentItem.category}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: '13px',
                  color: '#fff',
                  marginBottom: '10px',
                  lineHeight: '1.4',
                  fontWeight: 500
                }}>
                  {currentItem.post.title}
                </div>

                {/* Reason */}
                <div style={{
                  fontSize: '11px',
                  color: '#999',
                  lineHeight: '1.4',
                  fontStyle: 'italic',
                  marginBottom: '10px'
                }}>
                  "{currentItem.reason}"
                </div>

                {/* Subreddit */}
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>r/{currentItem.post.subreddit}</span>
                  {currentItem.post.isNSFW && (
                    <span style={{ color: '#ff4444', fontSize: '10px' }}>🔞 NSFW</span>
                  )}
                </div>
              </div>

              {/* Carousel Counter */}
              <div style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#888',
                marginTop: '8px'
              }}>
                {currentIndex + 1} / {identifiableWithData.length}
              </div>
            </>
          )}
        </div>

        {/* Right Column - Carousel */}
        <div style={{
          position: 'relative',
          backgroundColor: '#0a0a0a',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #2a2a2a'
        }}>
          {identifiableWithData.length === 0 ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              No identifiable images
            </div>
          ) : currentItem && (
            <>
              {/* Image/Video */}
              <a 
                href={currentItem.post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  height: '100%',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
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
                      fontSize: '48px'
                    }}>
                      🚫
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        Media no longer available
                      </div>
                    </div>
                  ) : isVideo ? (
                    <video
                      src={currentItem.post.media}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: currentItem.post.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
                      }}
                      muted
                      loop
                      autoPlay
                      playsInline
                      onError={() => handleImageError(currentItem.id)}
                    />
                  ) : (
                    <img
                      src={currentItem.post.media}
                      alt={currentItem.post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: currentItem.post.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
                      }}
                      onError={() => handleImageError(currentItem.id)}
                    />
                  )}

                  {/* NSFW Overlay */}
                  {currentItem.post.isNSFW && !showNSFW && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: '20px 30px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowNSFW(true);
                      }}
                    >
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔞</div>
                      <div style={{ color: '#fff', fontWeight: 500, marginBottom: '4px' }}>NSFW Content</div>
                      <div style={{ color: '#aaa', fontSize: '12px' }}>
                        Click to view
                      </div>
                    </div>
                  )}
                </div>
              </a>

              {/* Navigation Arrows */}
              {identifiableWithData.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      color: '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ‹
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      color: '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
