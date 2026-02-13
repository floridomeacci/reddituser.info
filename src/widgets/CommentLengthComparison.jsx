import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_COMMENT_LENGTH = 75; // chars

export default function CommentLengthComparison({ userData, style }) {
  const { histogram, avgLen, medianLen, label } = useMemo(() => {
    if (!userData) return {};
    const comments = userData.comments || [];
    if (comments.length < 10) return {};

    const lengths = comments.map(c => (c.comment || c.body || '').length).filter(l => l > 0);
    if (lengths.length < 5) return {};

    lengths.sort((a, b) => a - b);
    const avg = lengths.reduce((s, l) => s + l, 0) / lengths.length;
    const median = lengths[Math.floor(lengths.length / 2)];

    let lbl = 'Average';
    if (avg > 300) lbl = 'Essay Writer';
    else if (avg > 150) lbl = 'Verbose';
    else if (avg > 90) lbl = 'Above Average';
    else if (avg > 60) lbl = 'Average';
    else if (avg > 30) lbl = 'Concise';
    else lbl = 'Very Brief';

    // Build histogram buckets
    const buckets = [
      { range: '0-25', min: 0, max: 25 },
      { range: '25-50', min: 25, max: 50 },
      { range: '50-100', min: 50, max: 100 },
      { range: '100-200', min: 100, max: 200 },
      { range: '200-500', min: 200, max: 500 },
      { range: '500+', min: 500, max: Infinity },
    ];

    const histogram = buckets.map(b => ({
      name: b.range,
      count: lengths.filter(l => l >= b.min && l < b.max).length,
      isUserAvg: avg >= b.min && avg < b.max,
    }));

    return { histogram, avgLen: avg, medianLen: median, label: lbl };
  }, [userData]);

  if (!histogram) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>{d.name} chars</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>{d.count} comments</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Comment Length</h3>
      <p className="stat-meta">
        Avg: <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{Math.round(avgLen)}</span> chars
        <span style={{ opacity: 0.5 }}> (Reddit avg ~{REDDIT_AVG_COMMENT_LENGTH})</span>
        {' · '}
        <span style={{ color: COLORS.ACCENT_PRIMARY }}>{label}</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={histogram} margin={{ left: -10, right: 5, top: 10, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} 
              axisLine={false} tickLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {histogram.map((d, i) => (
                <Cell 
                  key={i} 
                  fill={d.isUserAvg ? COLORS.ACCENT_PRIMARY : 'rgba(255,107,107,0.25)'}
                  style={d.isUserAvg ? { filter: 'drop-shadow(0 0 6px rgba(255,107,107,0.4))' } : {}}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
