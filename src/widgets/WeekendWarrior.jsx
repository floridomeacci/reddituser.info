import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

// Reddit average day-of-week distribution (%)
const REDDIT_DOW_AVG = [12.5, 15.2, 15.8, 15.5, 15.0, 14.5, 11.5]; // Sun-Sat

export default function WeekendWarrior({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 20) return null;

    const dayCounts = new Array(7).fill(0);
    allItems.forEach(i => {
      if (!i.created_utc) return;
      dayCounts[new Date(i.created_utc * 1000).getDay()]++;
    });
    const total = dayCounts.reduce((s, c) => s + c, 0) || 1;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames.map((name, i) => ({
      name,
      you: Math.round((dayCounts[i] / total) * 1000) / 10,
      reddit: REDDIT_DOW_AVG[i],
      isWeekend: i === 0 || i === 6,
    }));
  }, [userData, globalStats]);

  if (!chartData || !globalStats) return null;

  const userWeekend = chartData.filter(d => d.isWeekend).reduce((s, d) => s + d.you, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.fill || p.color, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <span>{p.name}</span><span style={{ fontWeight: 600 }}>{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Weekly Pattern</h3>
      <p className="stat-meta">Your day-of-week vs Reddit · Weekend: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{userWeekend.toFixed(0)}%</span> (avg 24%)</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend iconType="square" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Bar dataKey="you" name="You" radius={[3, 3, 0, 0]} barSize={14}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={COLORS.ACCENT_PRIMARY} opacity={d.isWeekend ? 0.9 : 0.5} />
              ))}
            </Bar>
            <Bar dataKey="reddit" name="Reddit Avg" fill={COLORS.DATA_6} opacity={0.4} radius={[3, 3, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
