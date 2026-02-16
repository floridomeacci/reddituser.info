import { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

export default function ControversyIndex({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 20) return null;

    // Group by month
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { total: 0, controversial: 0, totalScore: 0 };
      months[key].total++;
      months[key].totalScore += i.score || 0;
      if ((i.score || 0) <= 0) months[key].controversial++;
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 3) return null;

    const avgControversy = globalStats.controversy_pct;
    return sorted.map(([month, data]) => ({
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      rate: Math.round((data.controversial / data.total) * 1000) / 10,
      avgScore: Math.round(data.totalScore / data.total),
      usersAvg: avgControversy,
      count: data.total,
    }));
  }, [userData]);

  if (!chartData || !globalStats) return null;

  const overallRate = chartData.reduce((s, d) => s + d.rate, 0) / chartData.length;
  const avgControversy = globalStats.controversy_pct;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>Controversy: {d.rate}%</div>
        <div style={{ color: COLORS.DATA_2 }}>Avg Score: {d.avgScore}</div>
        <div style={{ color: COLORS.DATA_6 }}>Users avg: {avgControversy.toFixed(1)}%</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>{d.count} items</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Controversy Timeline</h3>
      <p className="stat-meta">% of downvoted content over time · You: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{overallRate.toFixed(1)}%</span> vs Users: {avgControversy.toFixed(1)}%</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="controvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 7), 0)} />
            <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area yAxisId="left" type="monotone" dataKey="rate" name="Controversy %" stroke={COLORS.ACCENT_PRIMARY} fill="url(#controvGrad)" strokeWidth={2.5} dot={false} />
            <Area yAxisId="left" type="monotone" dataKey="usersAvg" name="Users Avg" stroke={COLORS.DATA_6} fill="none" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Avg Score" stroke={COLORS.DATA_2} strokeWidth={1.5} dot={false} opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
