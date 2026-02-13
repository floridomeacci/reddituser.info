import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine, ReferenceArea } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_CONTROVERSY = 8; // % of content at 0 or below

export default function ControversyIndex({ userData, style }) {
  const { scatterData, controversyPct, label, monthlyData } = useMemo(() => {
    if (!userData) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

    const controversialCount = allItems.filter(i => (i.score || 0) <= 0).length;
    const pct = (controversialCount / allItems.length) * 100;

    let lbl = 'Average';
    if (pct > 30) lbl = 'Very Controversial';
    else if (pct > 15) lbl = 'Controversial';
    else if (pct > 10) lbl = 'Slightly Edgy';
    else if (pct > 5) lbl = 'Average';
    else lbl = 'Non-controversial';

    // Scatter: each item as a dot (score vs time)
    // Sample max 300 for performance
    const sampled = allItems.length > 300
      ? allItems.filter((_, i) => i % Math.ceil(allItems.length / 300) === 0)
      : allItems;

    const scatterData = sampled
      .filter(i => i.created_utc)
      .map(i => ({
        x: i.created_utc,
        y: Math.max(Math.min(i.score || 0, 100), -50),
        score: i.score || 0,
        isControversial: (i.score || 0) <= 0,
        sub: i.subreddit || '',
      }));

    // Monthly controversy rate
    const months = {};
    allItems.forEach(i => {
      if (!i.created_utc) return;
      const d = new Date(i.created_utc * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { total: 0, controversial: 0 };
      months[key].total++;
      if ((i.score || 0) <= 0) months[key].controversial++;
    });

    const monthlyData = Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        rate: Math.round((data.controversial / data.total) * 1000) / 10,
      }));

    return { scatterData, controversyPct: pct, label: lbl, monthlyData };
  }, [userData]);

  if (!scatterData) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>Score: {d.score}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>r/{d.sub}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>{new Date(d.x * 1000).toLocaleDateString()}</div>
      </div>
    );
  };

  const minT = scatterData.length > 0 ? Math.min(...scatterData.map(d => d.x)) : 0;
  const maxT = scatterData.length > 0 ? Math.max(...scatterData.map(d => d.x)) : 0;

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Controversy Index</h3>
      <p className="stat-meta">
        <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{controversyPct.toFixed(1)}%</span> controversial
        <span style={{ opacity: 0.5 }}> (avg {REDDIT_AVG_CONTROVERSY}%)</span>
        {' · '}
        <span style={{ color: COLORS.ACCENT_PRIMARY }}>{label}</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
            {/* Controversial zone highlight */}
            <ReferenceArea y1={-50} y2={0} fill="rgba(255,107,107,0.06)" />
            <XAxis
              dataKey="x" type="number" domain={[minT, maxT]}
              tickFormatter={t => new Date(t * 1000).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              dataKey="y" type="number"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
              axisLine={false} tickLine={false}
              label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
            />
            <ReferenceLine y={0} stroke="rgba(255,107,107,0.3)" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={scatterData} isAnimationActive={false}>
              {scatterData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.isControversial ? COLORS.ACCENT_PRIMARY : 'rgba(74,222,128,0.4)'}
                  r={d.isControversial ? 4 : 2.5}
                  opacity={d.isControversial ? 0.8 : 0.3}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
