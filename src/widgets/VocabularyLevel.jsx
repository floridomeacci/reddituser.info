import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

export default function VocabularyLevel({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats) return null;
    const comments = userData.comments || [];
    if (comments.length < 20) return null;

    // Sort by time
    const sorted = [...comments].filter(c => c.created_utc).sort((a, b) => a.created_utc - b.created_utc);

    // Calculate TTR in rolling windows of 50 comments
    const windowSize = Math.min(50, Math.floor(sorted.length / 4));
    if (windowSize < 10) return null;

    const data = [];
    for (let i = 0; i <= sorted.length - windowSize; i += Math.max(Math.floor(windowSize / 3), 1)) {
      const window = sorted.slice(i, i + windowSize);
      const text = window.map(c => c.comment || c.body || '').join(' ').toLowerCase();
      const words = text.split(/\s+/).filter(w => w.length > 2 && /^[a-z]+$/.test(w));
      if (words.length < 30) continue;

      const sample = words.slice(0, 500);
      const unique = new Set(sample).size;
      const ttr = (unique / sample.length) * 100;

      const avgTime = window.reduce((s, c) => s + c.created_utc, 0) / window.length;
      data.push({
        time: avgTime,
        label: new Date(avgTime * 1000).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        ttr: Math.round(ttr * 10) / 10,
        avgLen: Math.round(words.length / window.length),
      });
    }

    return data.length >= 3 ? data : null;
  }, [userData]);

  if (!chartData || !globalStats) return null;

  const overallTTR = chartData.reduce((s, d) => s + d.ttr, 0) / chartData.length;
  const avgTTR = globalStats.ttr;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
        <div style={{ color: COLORS.DATA_5 }}>Your TTR: {d.ttr}%</div>
        <div style={{ color: COLORS.DATA_6 }}>Users avg: {avgTTR.toFixed(0)}%</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Vocabulary Richness</h3>
      <p className="stat-meta">Unique word ratio over time · You: <span style={{ color: COLORS.DATA_5 }}>{overallTTR.toFixed(0)}%</span> vs Users: {avgTTR.toFixed(0)}%</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={Math.max(Math.floor(chartData.length / 7), 0)} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <ReferenceLine y={avgTTR} stroke={COLORS.DATA_6} strokeWidth={2} strokeDasharray="6 3" label={{ value: `Avg: ${avgTTR.toFixed(0)}%`, position: 'insideBottomRight', fill: COLORS.DATA_6, fontSize: 9 }} />
            <Line type="monotone" dataKey="ttr" name="You" stroke={COLORS.DATA_5} strokeWidth={2.5} dot={{ r: 2, fill: COLORS.DATA_5 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
