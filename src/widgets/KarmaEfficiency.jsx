import { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

// Reddit average karma per content by month-of-year
const REDDIT_AVG_KARMA_BY_MONTH = [8, 7.5, 9, 10, 9, 8, 7, 7.5, 9, 10, 8.5, 7];

export default function KarmaEfficiency({ userData, style }) {
  const chartData = useMemo(() => {
    if (!userData) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return null;

    // Group by month
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { totalKarma: 0, count: 0, monthIdx: d.getMonth() };
      months[key].totalKarma += i.score || 0;
      months[key].count++;
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 2) return null;

    return sorted.map(([month, data]) => ({
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      efficiency: Math.round((data.totalKarma / data.count) * 10) / 10,
      redditAvg: REDDIT_AVG_KARMA_BY_MONTH[data.monthIdx],
      count: data.count,
    }));
  }, [userData]);

  if (!chartData) return null;

  const userAvg = chartData.reduce((s, d) => s + d.efficiency, 0) / chartData.length;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>Your avg: {d.efficiency} karma/post</div>
        <div style={{ color: COLORS.DATA_6 }}>Reddit avg: {d.redditAvg}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>{d.count} items</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Efficiency</h3>
      <p className="stat-meta">Avg karma per post over time · You: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{userAvg.toFixed(1)}</span> vs Reddit: ~8.5</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <ReferenceLine y={8.5} stroke={COLORS.DATA_6} strokeWidth={2} strokeDasharray="6 3" label={{ value: 'Reddit Avg: ~8.5', position: 'insideTopRight', fill: COLORS.DATA_6, fontSize: 9 }} />
            <Bar dataKey="efficiency" name="You" fill={COLORS.ACCENT_PRIMARY} opacity={0.5} barSize={6} radius={[2, 2, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.efficiency >= 8.5 ? COLORS.DATA_2 : COLORS.ACCENT_PRIMARY} opacity={0.6} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
