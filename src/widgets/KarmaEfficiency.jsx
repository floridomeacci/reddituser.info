import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_COMMENT_KARMA = 7;
const REDDIT_AVG_POST_KARMA = 15;

export default function KarmaEfficiency({ userData, style }) {
  const data = useMemo(() => {
    if (!userData) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    if (comments.length + posts.length < 3) return null;

    const avgCommentKarma = comments.length > 0
      ? comments.reduce((s, c) => s + (c.score || 0), 0) / comments.length
      : 0;
    const avgPostKarma = posts.length > 0
      ? posts.reduce((s, p) => s + (p.score || 0), 0) / posts.length
      : 0;

    return [
      { name: 'Comment Karma', you: Math.round(avgCommentKarma * 10) / 10, avg: REDDIT_AVG_COMMENT_KARMA },
      { name: 'Post Karma', you: Math.round(avgPostKarma * 10) / 10, avg: REDDIT_AVG_POST_KARMA },
    ];
  }, [userData]);

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Efficiency</h3>
      <p className="stat-meta">Avg karma per content vs Reddit average</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.15)' }} />
            <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} width={90} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="you" name="You" fill={COLORS.ACCENT_PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
            <Bar dataKey="avg" name="Reddit Avg" fill="rgba(255,255,255,0.15)" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
