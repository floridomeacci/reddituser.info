import React from 'react';

/**
 * Reusable modal component for displaying a list of comments
 * @param {Object} props
 * @param {Array} props.comments - Array of comment objects to display
 * @param {Function} props.onClose - Callback to close the modal
 * @param {string} props.title - Title for the modal
 * @param {string} props.accentColor - Color for the border accent (default: '#ff6b6b')
 */
export default function CommentListModal({ comments, onClose, title, accentColor = '#ff6b6b' }) {
  if (!comments || comments.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {comments.map((comment, idx) => (
            <div 
              key={idx}
              style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#2a2a2a',
                borderRadius: '8px',
                borderLeft: `3px solid ${accentColor}`
              }}
            >
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  {comment.subreddit && `r/${comment.subreddit}`}
                  {comment.responding && ` • Replying to: ${comment.responding}`}
                </span>
                {comment.url && (
                  <a 
                    href={comment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: accentColor,
                      fontSize: '12px',
                      textDecoration: 'none'
                    }}
                  >
                    View on Reddit →
                  </a>
                )}
              </div>
              <div style={{ 
                color: '#fff', 
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {comment.comment || comment.text || comment.post || 'No content'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
