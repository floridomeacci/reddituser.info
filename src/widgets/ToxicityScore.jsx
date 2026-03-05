import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COLORS } from '../design-tokens';
import { toxicityScore } from '../lib/browserML';

export default function ToxicityScore({ userData, style = {} }) {
  const { data, overall, grade, worstComments } = useMemo(() => {
    if (!userData?.comments?.length) return { data: [], overall: 0, grade: 'N/A', worstComments: [] };

    const months = {};
    const scored = [];

    for (const comment of userData.comments) {
      const body = comment.body || comment.comment || '';
      if (!body || !comment.created_utc) continue;
      const score = toxicityScore(body);
      scored.push({ score, body, created: comment.created_utc });

      const date = new Date(comment.created_utc * 1000);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { month: key, scores: [] };
      months[key].scores.push(score);
    }

    const timeline = Object.values(months)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({
        month: m.month,
        label: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        toxicity: Math.round(m.scores.reduce((s, v) => s + v, 0) / m.scores.length),
        max: Math.max(...m.scores)
      }));

    const avg = scored.length > 0
      ? Math.round(scored.reduce((s, v) => s + v.score, 0) / scored.length)
      : 0;

    const worst = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(c => c.score > 0);

    let g = 'Saint 😇';
    if (avg > 40) g = 'Toxic ☠️';
    else if (avg > 25) g = 'Edgy 🔥';
    else if (avg > 10) g = 'Mild 😤';
    else if (avg > 3) g = 'Clean 😊';

    return { data: timeline, overall: avg, grade: g, worstComments: worst };
  }, [userData]);

  if (!data.length) return null;

  const toxColor = overall > 25 ? '#ef4444' : overall > 10 ? '#f59e0b' : '#22c55e';

  return (
    <div className="cell" style={style}>
      <h3>TOXICITY SCORE</h3>
      <p className="stat-meta">
        Overall: <span style={{ color: toxColor, fontWeight: 700 }}>{overall}/100 · {grade}</span>
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: '120px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="toxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.TEXT_MUTED, fontSize: 10 }} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: `1px solid ${COLORS.BORDER_DEFAULT}`, borderRadius: 8, fontSize: 11 }}
                formatter={(v, name) => [v, name === 'toxicity' ? 'Avg Toxicity' : 'Peak Toxicity']}
              />
              <ReferenceLine y={10} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Clean', fill: '#22c55e', fontSize: 9, position: 'left' }} />
              <Area type="monotone" dataKey="max" stroke="transparent" fill="rgba(239,68,68,0.1)" dot={false} />
              <Area type="monotone" dataKey="toxicity" stroke="#ef4444" fill="url(#toxGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {worstComments.length > 0 && (
          <div style={{ marginTop: 8, fontSize: '10px', color: COLORS.TEXT_MUTED }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#ef4444' }}>Spiciest moments:</div>
            {worstComments.map((c, i) => (
              <div key={i} style={{
                padding: '4px 6px',
                marginBottom: 2,
                background: 'rgba(239,68,68,0.05)',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                🌶️ {c.body.slice(0, 100)}{c.body.length > 100 ? '...' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
