import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

export default function KarmaOverTime({ userData, style }) {
  const { chartData, cumKarma, avgMonthlyKarma, redditMonthlyAvg } = useMemo(() => {
    if (!userData) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

    // Group by month
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { karma: 0, count: 0 };
      months[key].karma += i.score || 0;
      months[key].count++;
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 2) return {};

    let cumulative = 0;
    const chartData = sorted.map(([month, data]) => {
      cumulative += data.karma;
      return {
        month,
        label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        karma: data.karma,
        cumulative,
        count: data.count,
      };
    });

    const totalKarma = allItems.reduce((s, i) => s + (i.score || 0), 0);
    const avgMonthly = totalKarma / sorted.length;
    
    // Reddit average: ~10 karma/month for a typical user
    const redditAvg = 10;

    return { chartData, cumKarma: cumulative, avgMonthlyKarma: avgMonthly, redditMonthlyAvg: redditAvg };
  }, [userData]);

  if (!chartData) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>Karma: {d.karma > 0 ? '+' : ''}{d.karma}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Cumulative: {d.cumulative.toLocaleString()}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>{d.count} items</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Over Time</h3>
      <p className="stat-meta">
        Total: <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{cumKarma.toLocaleString()}</span>
        {' · '}
        Avg <span style={{ color: COLORS.ACCENT_PRIMARY }}>{Math.round(avgMonthlyKarma)}</span>/mo
        <span style={{ opacity: 0.5 }}> (Reddit avg ~{redditMonthlyAvg}/mo)</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="karmaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              interval={Math.max(Math.floor(chartData.length / 8), 0)}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <ReferenceLine
              y={redditMonthlyAvg}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="4 4"
              label={{ value: 'Reddit avg', fill: 'rgba(255,255,255,0.3)', fontSize: 8, position: 'right' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="karma"
              stroke={COLORS.ACCENT_PRIMARY}
              fill="url(#karmaGrad)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: COLORS.ACCENT_PRIMARY, stroke: '#fff', strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
