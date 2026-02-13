import { useMemo } from 'react';
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_MONTHLY_AVG_KARMA = 10;

export default function KarmaOverTime({ userData, style }) {
  const { chartData, totalKarma } = useMemo(() => {
    if (!userData) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

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

    let userCum = 0, avgCum = 0;
    const chartData = sorted.map(([month, data]) => {
      userCum += data.karma;
      avgCum += REDDIT_MONTHLY_AVG_KARMA;
      return {
        label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        monthly: data.karma,
        cumulative: userCum,
        avgCumulative: avgCum,
      };
    });

    return { chartData, totalKarma: userCum };
  }, [userData]);

  if (!chartData) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>Monthly: {d.monthly > 0 ? '+' : ''}{d.monthly.toLocaleString()}</div>
        <div style={{ color: COLORS.DATA_2 }}>Your Total: {d.cumulative.toLocaleString()}</div>
        <div style={{ color: COLORS.DATA_6 }}>Avg User: {d.avgCumulative.toLocaleString()}</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Karma Trajectory</h3>
      <p className="stat-meta">Cumulative karma growth vs average Redditor · Total: <span style={{ color: COLORS.ACCENT_PRIMARY }}>{totalKarma.toLocaleString()}</span></p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ left: -5, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="karmaGradU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.DATA_2} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.DATA_2} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 8), 0)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Bar dataKey="monthly" name="Monthly ±" fill={COLORS.ACCENT_PRIMARY} opacity={0.25} barSize={4} />
            <Area type="monotone" dataKey="cumulative" name="You" stroke={COLORS.DATA_2} fill="url(#karmaGradU)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="avgCumulative" name="Avg Redditor" stroke={COLORS.DATA_6} strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
