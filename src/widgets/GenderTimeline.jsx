import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_CONFIG, getDesignTokens } from '../design-tokens';

export default function GenderTimeline({ ageGenderPredictions, ageGenderLoading, ageGenderError, style }) {
  const tokens = getDesignTokens();

  const genderTimelineData = (() => {
    if (!ageGenderPredictions || ageGenderPredictions.length === 0) return [];
    const byMonth = new Map();
    ageGenderPredictions.forEach(p => {
      const ts = p.timestamp || 0;
      if (!ts) return;
      const d = new Date(ts * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = byMonth.get(key) || { month: key, male: 0, female: 0, total: 0 };
      const g = p.gender;
      if (g === 'male') entry.male += 1; else if (g === 'female') entry.female += 1;
      entry.total += 1;
      byMonth.set(key, entry);
    });
    return Array.from(byMonth.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(e => ({ month: e.month, male: e.total ? +(e.male / e.total * 100).toFixed(1) : 0, female: e.total ? +(e.female / e.total * 100).toFixed(1) : 0 }));
  })();

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Gender analysis over time</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Monthly gender distribution (≤300 comments)</p>
      {ageGenderLoading && <p style={{ fontSize: '11px' }}>Loading gender predictions…</p>}
      {ageGenderError && <p style={{ fontSize: '11px', color: '#ff6666' }}>Error: {ageGenderError}</p>}
      {!ageGenderLoading && !ageGenderError && genderTimelineData.length === 0 && (
        <p style={{ fontSize: '11px', color: '#888' }}>No gender data available</p>
      )}
      {genderTimelineData.length > 0 && (
        <div className="chart-container" style={{ height: 'calc(100% - 60px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={genderTimelineData} margin={{ top: 5, right: 10, left: -5, bottom: 5 }}>
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
              <Line type="monotone" dataKey="female" stroke="#ff6ec7" strokeWidth={2} dot={false} name="Female %" />
              <Line type="monotone" dataKey="male" stroke="#4dc9ff" strokeWidth={2} dot={false} name="Male %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
