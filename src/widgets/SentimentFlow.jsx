import { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';
import { sentimentTimeline } from '../lib/browserML';

export default function SentimentFlow({ userData, style = {} }) {
  const { data, overall, trend } = useMemo(() => {
    if (!userData?.comments?.length) return { data: [], overall: 0, trend: null };

    const timeline = sentimentTimeline(userData.comments);
    if (!timeline.length) return { data: [], overall: 0, trend: null };

    const avg = timeline.reduce((s, m) => s + m.avgScore, 0) / timeline.length;
    const half = Math.floor(timeline.length / 2);
    const firstHalf = timeline.slice(0, half).reduce((s, m) => s + m.avgScore, 0) / Math.max(half, 1);
    const secondHalf = timeline.slice(half).reduce((s, m) => s + m.avgScore, 0) / Math.max(timeline.length - half, 1);
    const t = secondHalf - firstHalf;

    return {
      data: timeline.map(m => ({
        ...m,
        label: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })
      })),
      overall: avg,
      trend: Math.abs(t) < 0.1 ? 'Stable →' : t > 0 ? 'Improving ↗' : 'Declining ↘'
    };
  }, [userData]);

  if (!data.length) return null;

  const sentColor = overall > 0.3 ? '#22c55e' : overall < -0.3 ? '#ef4444' : '#f59e0b';
  const sentLabel = overall > 0.3 ? 'Positive' : overall < -0.3 ? 'Negative' : 'Neutral';

  return (
    <div className="cell" style={style}>
      <h3>SENTIMENT FLOW</h3>
      <p className="stat-meta">
        AFINN word-list analysis · Overall:{' '}
        <span style={{ color: sentColor, fontWeight: 700 }}>{sentLabel} ({overall.toFixed(2)})</span>
        {' · '}<span style={{ color: COLORS.TEXT_MUTED }}>{trend}</span>
        <span style={{ marginLeft: 8, fontSize: '9px', color: COLORS.TEXT_MUTED }}>⚡ Browser ML</span>
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sentNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: `1px solid ${COLORS.BORDER_DEFAULT}`, borderRadius: 8, fontSize: 11 }}
              formatter={(v, name) => {
                if (name === 'avgScore') return [v.toFixed(2), 'Sentiment'];
                if (name === 'positive') return [`${v}%`, '😊 Positive'];
                if (name === 'negative') return [`${v}%`, '😤 Negative'];
                return [v, name];
              }}
            />
            <ReferenceLine y={0} stroke={COLORS.TEXT_MUTED} strokeDasharray="3 3" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="positive" stroke="transparent" fill="url(#sentPos)" />
            <Area type="monotone" dataKey="negative" stroke="transparent" fill="url(#sentNeg)" />
            <Line type="monotone" dataKey="avgScore" stroke={sentColor} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
