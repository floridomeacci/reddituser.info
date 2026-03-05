import { useMemo } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

export default function KarmaEfficiency({ userData, globalStats, style }) {

  const { chartData, userAvg, globalAvg, trend } = useMemo(() => {
    if (!userData || !globalStats) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

    const gAvg = globalStats.karma_per_item || 10;

    // Group by month
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { totalKarma: 0, count: 0 };
      months[key].totalKarma += i.score || 0;
      months[key].count++;
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 2) return {};

    const data = sorted.map(([month, mData]) => ({
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      you: Math.round((mData.totalKarma / mData.count) * 10) / 10,
      global: gAvg,
      count: mData.count,
    }));

    const uAvg = data.reduce((s, d) => s + d.you, 0) / data.length;

    // Trend: compare last 3 months avg vs first 3 months avg
    const recent = data.slice(-3).reduce((s, d) => s + d.you, 0) / Math.min(data.length, 3);
    const early = data.slice(0, 3).reduce((s, d) => s + d.you, 0) / Math.min(data.length, 3);
    const trendDir = recent > early * 1.15 ? 'Rising' : recent < early * 0.85 ? 'Declining' : 'Stable';

    return { chartData: data, userAvg: uAvg, globalAvg: gAvg, trend: trendDir };
  }, [userData, globalStats]);

  if (!chartData || !globalStats) return null;

  const trendColor = trend === 'Rising' ? '#4ade80' : trend === 'Declining' ? COLORS.ACCENT_PRIMARY : '#fb923c';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.you} karma/post</div>
        <div style={{ color: COLORS.DATA_6 }}>Median user: {d.global.toFixed(1)}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>{d.count} items</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Efficiency</h3>
      <p className="stat-meta">
        <span style={{ color: COLORS.ACCENT_PRIMARY }}>You: {userAvg.toFixed(1)}</span> vs <span style={{ color: COLORS.DATA_6 }}>median: {globalAvg.toFixed(1)}</span> karma/post · <span style={{ color: trendColor }}>{trend} ↗</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="karmaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="you" name="You" stroke={COLORS.ACCENT_PRIMARY} fill="url(#karmaGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="global" name="Median User" stroke={COLORS.DATA_6} strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
