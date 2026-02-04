import { useState, useEffect } from 'react';
import nsfwSubreddits from '../data/nsfwSubreddits';

export default function RecentActivity({ userData, style }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNSFW, setShowNSFW] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // Get all posts with media - API provides 'media' field for media URLs
  const allMediaItems = (userData?.posts || [])
    .filter(post => post.media)
    .map((post, originalIndex) => ({
      url: post.media,
      subreddit: post.subreddit,
      title: (post.title || post.post || '').slice(0, 100) || 'Untitled',
      postUrl: post.url || (post.permalink ? `https://reddit.com${post.permalink}` : null),
      timestamp: post.timestamp || post.created_utc,
      originalIndex,
      isNSFW: post.over_18 || nsfwSubreddits.some(nsfw => 
        post.subreddit?.toLowerCase() === nsfw.toLowerCase().replace('/r/', '')
      ),
      isBroken: false
    }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const mediaItems = allMediaItems.map((item, index) => ({
    ...item,
    isBroken: brokenImages.has(index)
  }));

  const handleImageError = (index) => {
    setBrokenImages(prev => new Set([...prev, index]));
  };

  if (mediaItems.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 2', ...style }}>
        <h3>Media Gallery</h3>
        <p className="stat-meta">No media posts found</p>
      </div>
    );
  }

  const currentItem = mediaItems[currentIndex];
  const isVideo = currentItem.url?.includes('v.redd.it') || false;

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 2', ...style }}>
      <h3>Media Gallery</h3>
      <p className="stat-meta" style={{ marginBottom: '12px' }}>
        {currentIndex + 1} / {mediaItems.length} posts
        {currentItem.isNSFW && <span style={{ marginLeft: '8px', color: '#ff4444' }}>🔞 NSFW</span>}
      </p>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'calc(100% - 100px)',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer'
      }}>
        {/* Media Content */}
        <a 
          href={currentItem.postUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}
        >
          {currentItem.isBroken ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1a1a1a',
              position: 'relative'
            }}>
              {/* Broken media overlay - same style as NSFW */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '16px 24px',
                borderRadius: '8px',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚫</div>
                <div style={{ color: '#fff', fontWeight: 500 }}>Media no longer available</div>
              </div>
            </div>
          ) : isVideo ? (
            <video
              src={currentItem.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: currentItem.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
              }}
              muted
              loop
              autoPlay
              playsInline
              onError={() => handleImageError(currentIndex)}
            />
          ) : (
            <img
              src={currentItem.url}
              alt={currentItem.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: currentItem.isNSFW && !showNSFW ? 'blur(20px)' : 'none'
              }}
              onError={() => handleImageError(currentIndex)}
            />
          )}

          {/* NSFW Overlay */}
          {currentItem.isNSFW && !showNSFW && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '16px 24px',
              borderRadius: '8px',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔞</div>
              <div style={{ color: '#fff', fontWeight: 500 }}>NSFW Content</div>
              <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
                Click to view
              </div>
            </div>
          )}
        </a>

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
              }}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(prev => (prev + 1) % mediaItems.length);
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Post Info */}
      <div style={{ marginTop: '12px', fontSize: '13px' }}>
        <div style={{ 
          color: '#ddd', 
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {currentItem.title}
        </div>
        <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
          r/{currentItem.subreddit}
        </div>
      </div>

      {/* NSFW Toggle */}
      {mediaItems.some(item => item.isNSFW) && (
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginTop: '12px',
          fontSize: '12px',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={showNSFW}
            onChange={(e) => setShowNSFW(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Show NSFW content
        </label>
      )}
    </div>
  );
}
