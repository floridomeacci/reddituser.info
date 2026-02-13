import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

export default function SubredditDiversity({ userData, style }) {
  const chartData = useMemo(() => {
    if (!userData) return null;
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 20) return null;

    // Find top 5 subreddits
    const subCounts = {};
    allItems.forEach(i => { if (i.subreddit) subCounts[i.subreddit] = (subCounts[i.subreddit] || 0) + 1; });
    const topSubs = Object.entries(subCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);

    // Group by month
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc || !i.subreddit) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { total: 0 };
      months[key].total++;
      topSubs.forEach(s => { if (!months[key][s]) months[key][s] = 0; });
      if (topSubs.includes(i.subreddit)) months[key][i.subreddit]++;
      else {
        if (!months[key]._other) months[key]._other = 0;
        months[key]._other++;
      }
    });

    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 3) return null;

    return sorted.map(([month, data]) => {
      const entry = {
        label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      };
      topSubs.forEach(s => { entry[s] = data[s] || 0; });
      entry['Other'] = data._other || 0;
      return entry;
    });
  }, [userData]);

  if (!chartData) return null;

  // Get the subreddit names (keys minus 'label' and 'Other')
  const allKeys = Object.keys(chartData[0]).filter(k => k !== 'label');
  const colors = [COLORS.ACCENT_PRIMARY, COLORS.DATA_2, COLORS.DATA_3, COLORS.DATA_4, COLORS.DATA_5, 'rgba(255,255,255,0.15)'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.filter(p => p.value > 0).map((p, i) => (
          <div key={i} style={{ color: p.color, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <span>r/{p.name}</span><span style={{ fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Subreddit Evolution</h3>
      <p className="stat-meta">How your community spread has changed over time</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }} stackOffset="expand">
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v * 100)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="square" wrapperStyle={{ fontSize: 9, opacity: 0.7 }} />
            {allKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} name={key} stackId="1" stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.7} strokeWidth={0} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
