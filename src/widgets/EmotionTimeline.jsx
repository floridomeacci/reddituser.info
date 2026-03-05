import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { COLORS } from '../design-tokens';
import { emotionTimeline } from '../lib/browserML';

const EMOTION_COLORS = {
  joy: '#facc15',
  anger: '#ef4444',
  sadness: '#60a5fa',
  fear: '#a855f7',
  surprise: '#22d3ee'
};

const EMOTION_ICONS = {
  joy: '😊',
  anger: '😡',
  sadness: '😢',
  fear: '😨',
  surprise: '😲'
};

export default function EmotionTimeline({ userData, style = {} }) {
  const { data, dominant, stats } = useMemo(() => {
    if (!userData?.comments?.length) return { data: [], dominant: null, stats: null };

    const timeline = emotionTimeline(userData.comments);
    if (!timeline.length) return { data: [], dominant: null, stats: null };

    const totals = { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0 };
    for (const month of timeline) {
      for (const e of Object.keys(totals)) totals[e] += month[e];
    }
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    const dom = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];

    return {
      data: timeline.map(m => ({
        ...m,
        label: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })
      })),
      dominant: dom[0],
      stats: Object.fromEntries(
        Object.entries(totals).map(([k, v]) => [k, sum > 0 ? Math.round((v / sum) * 100) : 0])
      )
    };
  }, [userData]);

  if (!data.length) return null;

  return (
    <div className="cell" style={style}>
      <h3>EMOTION TIMELINE</h3>
      <p className="stat-meta">
        Dominant: {EMOTION_ICONS[dominant]}{' '}
        <span style={{ color: EMOTION_COLORS[dominant], fontWeight: 600 }}>
          {dominant} ({stats[dominant]}%)
        </span>
        <span style={{ marginLeft: 8, fontSize: '9px', color: COLORS.TEXT_MUTED }}>⚡ Browser ML</span>
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: `1px solid ${COLORS.BORDER_DEFAULT}`, borderRadius: 8, fontSize: 11 }}
              formatter={(value, name) => [`${value}%`, `${EMOTION_ICONS[name] || ''} ${name}`]}
            />
            {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
              <Area
                key={emotion}
                type="monotone"
                dataKey={emotion}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            ))}
            <Legend
              verticalAlign="bottom"
              height={30}
              formatter={(value) => (
                <span style={{ color: EMOTION_COLORS[value], fontSize: 10 }}>
                  {EMOTION_ICONS[value]} {value}
                </span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
