import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

export default function HourlyActivityComparison({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 20) return null;

    const hourCounts = new Array(24).fill(0);
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const h = new Date(i.created_utc * 1000).getHours();
      hourCounts[h]++;
    });
    const total = hourCounts.reduce((s, c) => s + c, 0) || 1;

    // Estimate hourly distribution from night_pct
    const nightPct = globalStats.night_pct / 100;
    const dayPct = (100 - globalStats.night_pct) / 100;
    const nightHourlyAvg = (nightPct / 8) * 100;
    const dayHourlyAvg = (dayPct / 16) * 100;

    return Array.from({ length: 24 }, (_, h) => {
      const isNight = h >= 22 || h <= 5;
      return {
        hour: `${h.toString().padStart(2, '0')}:00`,
        you: Math.round((hourCounts[h] / total) * 1000) / 10,
        avg: Math.round((isNight ? nightHourlyAvg : dayHourlyAvg) * 10) / 10,
      };
    });
  }, [userData, globalStats]);

  if (!chartData || !globalStats) return null;

  const peakHour = chartData.reduce((max, d) => d.you > max.you ? d : max, chartData[0]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <span>{p.name}</span>
            <span style={{ fontWeight: 600 }}>{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Hourly Activity</h3>
      <p className="stat-meta">Your hourly activity pattern vs users · Peak: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{peakHour.hour}</span> ({peakHour.you}%)</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyYou" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="hourlyAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.DATA_6} stopOpacity={0.2} />
                <stop offset="100%" stopColor={COLORS.DATA_6} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={3} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area type="monotone" dataKey="avg" name="Users Avg" stroke={COLORS.DATA_6} fill="url(#hourlyAvg)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <Area type="monotone" dataKey="you" name="You" stroke={COLORS.ACCENT_PRIMARY} fill="url(#hourlyYou)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: COLORS.ACCENT_PRIMARY }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
