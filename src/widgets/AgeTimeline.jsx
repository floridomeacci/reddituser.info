import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_CONFIG, getDesignTokens } from '../design-tokens';

export default function AgeTimeline({ ageGenderPredictions, ageGenderLoading, ageGenderError, style }) {
  const tokens = getDesignTokens();

  const ageTimelineData = (() => {
    if (!ageGenderPredictions || ageGenderPredictions.length === 0) return [];
    const byMonth = new Map();
    ageGenderPredictions.forEach(p => {
      const ts = p.timestamp || 0;
      if (!ts) return;
      const d = new Date(ts * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = byMonth.get(key) || { month: key, under20: 0, age21_30: 0, age30_plus: 0, total: 0 };
      const age = p.age;
      if (age === '<20') entry.under20 += 1; else if (age === '21-30') entry.age21_30 += 1; else if (age === '30+') entry.age30_plus += 1;
      entry.total += 1;
      byMonth.set(key, entry);
    });
    return Array.from(byMonth.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(e => ({
        month: e.month,
        under20: e.total ? +(e.under20 / e.total * 100).toFixed(1) : 0,
        age21_30: e.total ? +(e.age21_30 / e.total * 100).toFixed(1) : 0,
        age30_plus: e.total ? +(e.age30_plus / e.total * 100).toFixed(1) : 0
      }));
  })();

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Age analysis over time</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Monthly age distribution (≤300 comments)</p>
      {ageGenderLoading && <p style={{ fontSize: '11px' }}>Loading age predictions…</p>}
      {ageGenderError && <p style={{ fontSize: '11px', color: '#ff6666' }}>Error: {ageGenderError}</p>}
      {!ageGenderLoading && !ageGenderError && ageTimelineData.length === 0 && (
        <p style={{ fontSize: '11px', color: '#888' }}>No age data available</p>
      )}
      {ageTimelineData.length > 0 && (
        <div className="chart-container" style={{ height: 'calc(100% - 60px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ageTimelineData} margin={{ top: 5, right: 10, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.chart.grid} />
              <XAxis dataKey="month" stroke={tokens.chart.axis} tick={{ ...CHART_CONFIG.axis.tick, fontSize: 9 }} />
              <YAxis domain={[0, 100]} unit="%" stroke={tokens.chart.axis} tick={{ ...CHART_CONFIG.axis.tick, fontSize: 9 }} />
              <Tooltip 
                formatter={(v) => [`${v}%`, '']} 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="under20" stroke="#ffbf47" strokeWidth={2} dot={false} name="<20 %" />
              <Line type="monotone" dataKey="age21_30" stroke="#9dff6e" strokeWidth={2} dot={false} name="21-30 %" />
              <Line type="monotone" dataKey="age30_plus" stroke="#ffa07a" strokeWidth={2} dot={false} name="30+ %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
