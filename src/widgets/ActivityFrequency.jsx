import { useMemo } from 'react';
import { ComposedChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

export default function ActivityFrequency({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return null;

    // Group by week
    const weeks = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = 0;
      weeks[key]++;
    });

    const sorted = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 3) return null;

    // Calculate moving average (4-week)
    const avgDaily = globalStats.activity_per_day;
    return sorted.map(([week, count], idx) => {
      const perDay = count / 7;
      const windowStart = Math.max(0, idx - 3);
      const window = sorted.slice(windowStart, idx + 1);
      const movingAvg = window.reduce((s, [, c]) => s + c / 7, 0) / window.length;
      return {
        week,
        label: new Date(week).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' }),
        perDay: Math.round(perDay * 100) / 100,
        movingAvg: Math.round(movingAvg * 100) / 100,
        usersAvg: avgDaily,
      };
    });
  }, [userData]);

  if (!chartData || !globalStats) return null;

  const overallAvg = chartData.reduce((s, d) => s + d.perDay, 0) / chartData.length;
  const avgDaily = globalStats.activity_per_day;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>{d.perDay}/day this week</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>4-week avg: {d.movingAvg}/day</div>
        <div style={{ color: COLORS.DATA_6 }}>Users avg: {avgDaily.toFixed(1)}/day</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Activity Over Time</h3>
      <p className="stat-meta">Posts per day vs Reddit average · You: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{overallAvg.toFixed(1)}/day</span> vs Users: {avgDaily.toFixed(1)}/day</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 7), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area type="monotone" dataKey="perDay" name="Weekly Rate" stroke={COLORS.ACCENT_PRIMARY} fill="url(#actGrad)" strokeWidth={1} dot={false} opacity={0.6} />
            <Area type="monotone" dataKey="movingAvg" name="4-week Avg" stroke={COLORS.ACCENT_PRIMARY} fill="none" strokeWidth={2.5} dot={false} opacity={0.7} />
            <Area type="monotone" dataKey="usersAvg" name="Users Avg" stroke={COLORS.DATA_6} fill="none" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
