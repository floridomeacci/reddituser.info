import { useMemo } from 'react';
import { ComposedChart, Bar, ReferenceLine, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

export default function KarmaEfficiency({ userData, globalStats, style }) {

  const { chartData, userAvgPct, avgEfficiency, userAvg } = useMemo(() => {
    if (!userData || !globalStats) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

    const avgEff = globalStats.karma_per_item || 10;

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

    const data = sorted.map(([month, mData]) => {
      const raw = mData.totalKarma / mData.count;
      return {
        label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        pct: Math.round((raw / avgEff) * 100),
        raw: Math.round(raw * 10) / 10,
        count: mData.count,
      };
    });

    const uAvg = data.reduce((s, d) => s + d.raw, 0) / data.length;
    const uAvgPct = Math.round((uAvg / avgEff) * 100);

    return { chartData: data, userAvgPct: uAvgPct, avgEfficiency: avgEff, userAvg: uAvg };
  }, [userData, globalStats]);

  if (!chartData || !globalStats) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.raw} karma/post ({d.pct}%)</div>
        <div style={{ color: COLORS.DATA_6 }}>Users avg: {avgEfficiency.toFixed(1)} (100%)</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>{d.count} items</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Efficiency</h3>
      <p className="stat-meta">
        Your karma/post as % of <span style={{ color: COLORS.DATA_6 }}>average ({avgEfficiency.toFixed(1)})</span> · <span style={{ color: COLORS.ACCENT_PRIMARY }}>You: {userAvgPct}%</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ left: -5, right: 5, top: 5, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={100} stroke={COLORS.DATA_6} strokeWidth={2} strokeDasharray="6 3" label={{ value: 'Avg (100%)', position: 'insideTopLeft', fill: COLORS.DATA_6, fontSize: 9 }} />
            <Bar dataKey="pct" name="You" fill={COLORS.ACCENT_PRIMARY} barSize={8} radius={[3, 3, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.pct >= 100 ? '#4ade80' : COLORS.ACCENT_PRIMARY} opacity={0.8} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
