import { useMemo } from 'react';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_RATIO = 10; // avg user has ~10 comments per 1 post

export default function PostCommentRatio({ userData, style }) {
  const { commentPct, postPct, ratio, label } = useMemo(() => {
    if (!userData) return {};
    const comments = (userData.comments || []).length;
    const posts = (userData.posts || []).length;
    const total = comments + posts;
    if (total < 3) return {};

    const cPct = Math.round((comments / total) * 1000) / 10;
    const pPct = Math.round((posts / total) * 1000) / 10;
    const r = posts > 0 ? comments / posts : comments;
    
    let lbl = 'Balanced';
    if (r > 50) lbl = 'Pure Commenter';
    else if (r > 15) lbl = 'Heavy Commenter';
    else if (r > 8) lbl = 'Commenter-leaning';
    else if (r > 3) lbl = 'Balanced';
    else if (r > 1) lbl = 'Creator-leaning';
    else lbl = 'Content Creator';

    return { commentPct: cPct, postPct: pPct, ratio: r, label: lbl };
  }, [userData]);

  if (!commentPct && commentPct !== 0) return null;

  const commentsLen = (userData.comments || []).length;
  const postsLen = (userData.posts || []).length;

  // Donut chart via SVG
  const radius = 50;
  const cx = 65, cy = 65;
  const circumference = 2 * Math.PI * radius;
  const commentArc = (commentPct / 100) * circumference;
  const postArc = circumference - commentArc;

  // Reddit average line
  const avgCommentPct = (REDDIT_AVG_RATIO / (REDDIT_AVG_RATIO + 1)) * 100;

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Post vs Comment</h3>
      <p className="stat-meta">Content type ratio vs avg (~{Math.round(avgCommentPct)}% comments)</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          {/* Comments arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke={COLORS.ACCENT_PRIMARY}
            strokeWidth={16}
            strokeDasharray={`${commentArc} ${postArc}`}
            strokeDashoffset={circumference / 4}
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,107,107,0.3))' }}
          />
          {/* Posts arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke={COLORS.DATA_6}
            strokeWidth={16}
            strokeDasharray={`${postArc} ${commentArc}`}
            strokeDashoffset={circumference / 4 - commentArc}
          />
          {/* Center text */}
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="700">
            {ratio < 100 ? `${ratio.toFixed(1)}:1` : `${Math.round(ratio)}:1`}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8}>c/p ratio</text>
        </svg>
        <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.ACCENT_PRIMARY }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{commentsLen} comments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.DATA_6 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{postsLen} posts</span>
          </div>
        </div>
        <div style={{ 
          fontSize: 11, fontWeight: 600, 
          color: COLORS.ACCENT_PRIMARY,
          marginTop: 4,
          padding: '2px 10px',
          background: 'rgba(255,107,107,0.1)',
          borderRadius: 12,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
