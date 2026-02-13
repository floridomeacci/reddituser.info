import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_DISTRIBUTION = [
  { range: '0-20', reddit: 15 },
  { range: '21-50', reddit: 28 },
  { range: '51-100', reddit: 25 },
  { range: '101-200', reddit: 18 },
  { range: '201-400', reddit: 9 },
  { range: '401-800', reddit: 4 },
  { range: '800+', reddit: 1 },
];

const BUCKETS = [
  { label: '0-20', min: 0, max: 20 },
  { label: '21-50', min: 21, max: 50 },
  { label: '51-100', min: 51, max: 100 },
  { label: '101-200', min: 101, max: 200 },
  { label: '201-400', min: 201, max: 400 },
  { label: '401-800', min: 401, max: 800 },
  { label: '800+', min: 801, max: Infinity },
];

export default function CommentLengthComparison({ userData, style }) {
  const chartData = useMemo(() => {
    if (!userData) return null;
    const comments = userData.comments || [];
    if (comments.length < 10) return null;

    const bucketCounts = BUCKETS.map(b => ({ ...b, count: 0 }));
    comments.forEach(c => {
      const len = (c.body || '').length;
      const idx = BUCKETS.findIndex(b => len >= b.min && len <= b.max);
      if (idx >= 0) bucketCounts[idx].count++;
    });

    const total = comments.length;
    return bucketCounts.map((b, i) => ({
      range: b.label,
      you: Math.round((b.count / total) * 1000) / 10,
      reddit: REDDIT_AVG_DISTRIBUTION[i].reddit,
    }));
  }, [userData]);

  if (!chartData) return null;

  const comments = userData.comments || [];
  const avgLength = comments.length > 0
    ? Math.round(comments.reduce((s, c) => s + (c.body || '').length, 0) / comments.length)
    : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.range} chars</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.you}%</div>
        <div style={{ color: COLORS.DATA_3 }}>Reddit: {d.reddit}%</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Comment Length Distribution</h3>
      <p className="stat-meta">Your comment lengths vs Reddit average · Your avg: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{avgLength}</span> chars</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="clcYouGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="clcRedditGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.DATA_3} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.DATA_3} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="range" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area type="monotone" dataKey="you" name="You" stroke={COLORS.ACCENT_PRIMARY} fill="url(#clcYouGrad)" strokeWidth={2.5} dot={{ r: 3, fill: COLORS.ACCENT_PRIMARY }} />
            <Area type="monotone" dataKey="reddit" name="Reddit Avg" stroke={COLORS.DATA_3} fill="url(#clcRedditGrad)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 2, fill: COLORS.DATA_3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
