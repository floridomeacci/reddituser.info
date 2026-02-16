import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Line } from 'recharts';
import { COLORS } from '../design-tokens';

export default function PostCommentRatio({ userData, style }) {
  const chartData = useMemo(() => {
    if (!userData) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    if (comments.length + posts.length < 10) return null;

    // Group by month
    const months = {};
    [...comments, ...posts].forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { comments: 0, posts: 0 };
      if (i.comment || i.body) months[key].comments++;
      else months[key].posts++;
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 2) return null;

    return sorted.map(([month, data]) => ({
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      comments: data.comments,
      posts: data.posts,
      ratio: data.posts > 0 ? Math.round((data.comments / data.posts) * 10) / 10 : data.comments,
    }));
  }, [userData]);

  if (!chartData) return null;

  const totalC = (userData.comments || []).length;
  const totalP = (userData.posts || []).length;
  const overallRatio = totalP > 0 ? (totalC / totalP).toFixed(1) : totalC;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>Comments: {d.comments}</div>
        <div style={{ color: COLORS.DATA_6 }}>Posts: {d.posts}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Ratio: {d.ratio}:1</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Posts vs Comments</h3>
      <p className="stat-meta">Your content mix over time · Ratio: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{overallRatio}:1</span></p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="commentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.DATA_6} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.DATA_6} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area type="monotone" dataKey="comments" name="Comments" stroke={COLORS.ACCENT_PRIMARY} fill="url(#commentGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="posts" name="Posts" stroke={COLORS.DATA_6} fill="url(#postGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
