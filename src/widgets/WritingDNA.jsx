import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';
import { writingFingerprint, readabilityScore } from '../lib/browserML';

export default function WritingDNA({ userData, style = {} }) {
  const { chartData, archetype } = useMemo(() => {
    if (!userData?.comments?.length) return { chartData: [], archetype: null };

    const texts = (userData.comments || []).map(c => c.body || c.comment || '').filter(Boolean);
    const fp = writingFingerprint(texts);
    if (!fp) return { chartData: [], archetype: null };

    const readScores = texts.slice(0, 200).map(readabilityScore).filter(s => s !== null);
    const avgRead = readScores.length > 0 ? readScores.reduce((a, b) => a + b, 0) / readScores.length : 50;

    const normalize = (val, max) => Math.min(100, Math.round((val / max) * 100));

    const data = [
      { axis: 'Verbosity', value: normalize(fp.avgSentenceLength, 30), avg: 50 },
      { axis: 'Questions', value: normalize(fp.questionRate, 50), avg: 50 },
      { axis: 'Excitement', value: normalize(fp.exclamationRate, 30), avg: 50 },
      { axis: 'CAPS Usage', value: normalize(fp.capsRate, 10), avg: 50 },
      { axis: 'Emoji Use', value: normalize(fp.emojiRate, 20), avg: 50 },
      { axis: 'Readability', value: normalize(avgRead, 100), avg: 50 }
    ];

    let arch = 'Balanced Writer ✍️';
    if (fp.questionRate > 25) arch = 'Socratic Questioner ❓';
    else if (fp.exclamationRate > 15) arch = 'Enthusiast! 🔥';
    else if (fp.capsRate > 5) arch = 'SHOUTER 📢';
    else if (fp.emojiRate > 10) arch = 'Emoji Artist 🎨';
    else if (fp.avgSentenceLength > 20) arch = 'Academic 📚';
    else if (fp.avgSentenceLength < 8) arch = 'Minimalist 🎯';
    else if (avgRead > 70) arch = 'Crystal Clear 💎';
    else if (avgRead < 30) arch = 'Dense Thinker 🧠';

    return { chartData: data, archetype: arch };
  }, [userData]);

  if (!chartData.length) return null;

  return (
    <div className="cell" style={style}>
      <h3>WRITING DNA</h3>
      <p className="stat-meta">
        Style: <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 700 }}>{archetype}</span>
        <span style={{ marginLeft: 8, fontSize: '9px', color: COLORS.TEXT_MUTED }}>⚡ Browser ML</span>
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={COLORS.BORDER_DEFAULT} />
            <PolarAngleAxis dataKey="axis" tick={{ fill: COLORS.TEXT_LIGHT_GREY, fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: `1px solid ${COLORS.BORDER_DEFAULT}`, borderRadius: 8, fontSize: 11 }}
            />
            <Radar
              name="Avg"
              dataKey="avg"
              stroke={COLORS.DATA_6}
              fill={COLORS.DATA_6}
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Radar
              name="You"
              dataKey="value"
              stroke={COLORS.ACCENT_PRIMARY}
              fill={COLORS.ACCENT_PRIMARY}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS.ACCENT_PRIMARY }}
            />
            <Legend
              verticalAlign="bottom"
              formatter={(value) => (
                <span style={{ color: value === 'Avg' ? COLORS.DATA_6 : COLORS.ACCENT_PRIMARY, fontSize: 10 }}>
                  {value}
                </span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
