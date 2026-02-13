import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_WEEKEND = 30; // % of activity on weekends

export default function WeekendWarrior({ userData, style }) {
  const data = useMemo(() => {
    if (!userData) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return null;

    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    allItems.forEach(i => {
      const d = new Date((i.created_utc || 0) * 1000).getDay();
      dayCounts[d]++;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const total = allItems.length;
    
    return dayNames.map((name, i) => ({
      name,
      pct: Math.round((dayCounts[i] / total) * 1000) / 10,
      isWeekend: i === 0 || i === 6,
      count: dayCounts[i],
    }));
  }, [userData]);

  if (!data) return null;

  const weekendPct = data.filter(d => d.isWeekend).reduce((s, d) => s + d.pct, 0);
  const avgDaily = 100 / 7; // ~14.3% if perfectly even

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>{d.name}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>{d.pct}% ({d.count} items)</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Weekend Warrior</h3>
      <p className="stat-meta">
        Weekend: <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{weekendPct.toFixed(0)}%</span> 
        <span style={{ opacity: 0.5 }}> (avg {REDDIT_AVG_WEEKEND}%)</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <ReferenceLine y={avgDaily} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'even', fill: 'rgba(255,255,255,0.3)', fontSize: 8, position: 'right' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.isWeekend ? COLORS.ACCENT_PRIMARY : 'rgba(255,107,107,0.3)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
