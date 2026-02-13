import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Line } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_HOURS = {
  0: 3.2, 1: 2.4, 2: 1.8, 3: 1.5, 4: 1.3, 5: 1.5,
  6: 2.5, 7: 3.8, 8: 5.2, 9: 6.0, 10: 6.2, 11: 6.0,
  12: 5.8, 13: 5.5, 14: 5.5, 15: 5.6, 16: 5.5, 17: 5.2,
  18: 5.3, 19: 5.0, 20: 5.0, 21: 4.8, 22: 4.5, 23: 3.8,
};

export default function NightOwlScore({ userData, style }) {
  const chartData = useMemo(() => {
    if (!userData) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 20) return null;

    const hours = Array(24).fill(0);
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const h = new Date(i.created_utc * 1000).getHours();
      hours[h]++;
    });

    const total = hours.reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, '0')}:00`,
      you: Math.round((hours[h] / total) * 1000) / 10,
      reddit: REDDIT_HOURS[h],
      isNight: h >= 22 || h <= 5,
    }));
  }, [userData]);

  if (!chartData) return null;

  // Calculate night owl %
  const nightHours = chartData.filter(d => d.isNight);
  const nightPct = nightHours.reduce((s, d) => s + d.you, 0);
  const redditNightPct = nightHours.reduce((s, d) => s + d.reddit, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.hour} {d.isNight ? '🌙' : '☀️'}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.you}%</div>
        <div style={{ color: COLORS.DATA_4 }}>Reddit: {d.reddit}%</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Night Owl Score</h3>
      <p className="stat-meta">Your 24h activity distribution · Night activity: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{nightPct.toFixed(1)}%</span> (Reddit avg: {redditNightPct.toFixed(1)}%)</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="nightYouGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="nightRedditGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.DATA_4} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.DATA_4} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={2} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Area type="monotone" dataKey="you" name="You" stroke={COLORS.ACCENT_PRIMARY} fill="url(#nightYouGrad)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="reddit" name="Reddit Avg" stroke={COLORS.DATA_4} fill="url(#nightRedditGrad)" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
