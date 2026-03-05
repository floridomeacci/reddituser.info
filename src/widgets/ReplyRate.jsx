import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

export default function ReplyRate({ userData, globalStats, style }) {
  const metrics = useMemo(() => {
    if (!userData) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    if (comments.length + posts.length < 5) return null;

    // Avg comment score (proxy for engagement/replies)
    const avgCommentScore = comments.length > 0
      ? comments.reduce((s, c) => s + (c.score || 0), 0) / comments.length
      : 0;

    // Avg post score
    const avgPostScore = posts.length > 0
      ? posts.reduce((s, p) => s + (p.score || 0), 0) / posts.length
      : 0;

    // Avg post comment count (num_comments field)
    const postsWithReplies = posts.filter(p => p.num_comments != null);
    const avgRepliesPerPost = postsWithReplies.length > 0
      ? postsWithReplies.reduce((s, p) => s + (p.num_comments || 0), 0) / postsWithReplies.length
      : 0;

    // Score per character (efficiency)
    const totalChars = comments.reduce((s, c) => s + (c.body || '').length, 0) +
                       posts.reduce((s, p) => s + (p.selftext || '').length + (p.title || '').length, 0);
    const totalScore = comments.reduce((s, c) => s + (c.score || 0), 0) +
                       posts.reduce((s, p) => s + (p.score || 0), 0);
    const scorePerChar = totalChars > 0 ? totalScore / (totalChars / 100) : 0;

    // Upvote ratio on posts
    const postsWithRatio = posts.filter(p => p.upvote_ratio != null && p.upvote_ratio > 0);
    const avgUpvoteRatio = postsWithRatio.length > 0
      ? postsWithRatio.reduce((s, p) => s + p.upvote_ratio, 0) / postsWithRatio.length
      : 0;

    return { avgCommentScore, avgPostScore, avgRepliesPerPost, scorePerChar, avgUpvoteRatio };
  }, [userData]);

  if (!metrics) return null;

  const globalAvg = globalStats || {};
  const gAvgCommentScore = globalAvg.avgCommentScore ?? 8;
  const gAvgPostScore = globalAvg.avgPostScore ?? 15;
  const gAvgReplies = globalAvg.avgRepliesPerPost ?? 5;
  const gUpvoteRatio = globalAvg.avgUpvoteRatio ?? 0.75;

  const data = [
    {
      label: 'Comment Score',
      user: Math.round(metrics.avgCommentScore * 10) / 10,
      global: Math.round(gAvgCommentScore * 10) / 10,
    },
    {
      label: 'Post Score',
      user: Math.round(metrics.avgPostScore * 10) / 10,
      global: Math.round(gAvgPostScore * 10) / 10,
    },
    {
      label: 'Replies/Post',
      user: Math.round(metrics.avgRepliesPerPost * 10) / 10,
      global: Math.round(gAvgReplies * 10) / 10,
    },
    {
      label: 'Upvote %',
      user: Math.round(metrics.avgUpvoteRatio * 100),
      global: Math.round(gUpvoteRatio * 100),
    },
  ];

  // Overall engagement level
  const engagementScore = (
    (metrics.avgCommentScore / Math.max(gAvgCommentScore, 1)) * 0.3 +
    (metrics.avgPostScore / Math.max(gAvgPostScore, 1)) * 0.3 +
    (metrics.avgRepliesPerPost / Math.max(gAvgReplies, 1)) * 0.2 +
    (metrics.avgUpvoteRatio / Math.max(gUpvoteRatio, 0.01)) * 0.2
  );

  const engagementLabel = engagementScore > 1.5 ? 'High' : engagementScore > 0.8 ? 'Average' : 'Low';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.fill || p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Engagement Level</h3>
      <p className="stat-meta">
        How <span style={{ color: COLORS.ACCENT_PRIMARY }}>your content</span> performs vs <span style={{ color: COLORS.DATA_6 }}>average</span> · <span style={{ color: COLORS.ACCENT_PRIMARY }}>{engagementLabel}</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10, right: 5, top: 5, bottom: 0 }} barCategoryGap="20%">
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="user" name="You" fill={COLORS.ACCENT_PRIMARY} radius={[4, 4, 0, 0]} />
            <Bar dataKey="global" name="Global Avg" fill={COLORS.DATA_6} radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
