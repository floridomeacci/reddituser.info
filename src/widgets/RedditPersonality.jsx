import { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

/* Scale both user & global values to 0-100 using their combined peak.
   This gives BOTH lines a distinct shape instead of a flat circle for avg. */
function normPair(userVal, globalVal) {
  const peak = Math.max(Math.abs(userVal), Math.abs(globalVal), 0.001) * 1.3;
  return {
    you: Math.max(5, Math.min(Math.round((Math.abs(userVal) / peak) * 100), 100)),
    avg: Math.max(5, Math.min(Math.round((Math.abs(globalVal) / peak) * 100), 100)),
  };
}

export default function RedditPersonality({ userData, globalStats, style }) {

  const metrics = useMemo(() => {
    if (!userData || !globalStats) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    const all = [...comments, ...posts];
    if (all.length < 5) return null;

    const totalKarma = all.reduce((s, i) => s + (i.score || 0), 0);
    const karmaPerItem = all.length > 0 ? totalKarma / all.length : 0;

    const ts = all.map(i => i.created_utc || 0).filter(t => t > 0);
    const daySpan = ts.length >= 2 ? Math.max((Math.max(...ts) - Math.min(...ts)) / 86400, 1) : 1;
    const perDay = all.length / daySpan;

    const avgLen = comments.length > 0 ? comments.reduce((s, c) => s + (c.comment || c.body || '').length, 0) / comments.length : 0;
    const uniqueSubs = new Set(all.map(i => i.subreddit).filter(Boolean)).size;

    const nightCount = all.filter(i => { const h = new Date((i.created_utc || 0) * 1000).getHours(); return h >= 0 && h < 6; }).length;
    const nightPct = (nightCount / all.length) * 100;

    const weekendCount = all.filter(i => { const d = new Date((i.created_utc || 0) * 1000).getDay(); return d === 0 || d === 6; }).length;
    const weekendPct = (weekendCount / all.length) * 100;

    const controvCount = all.filter(i => (i.score || 0) <= 0).length;
    const controvPct = (controvCount / all.length) * 100;

    const words = all.map(i => i.comment || i.body || i.title || '').join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const ttr = words.length > 0 ? (new Set(words.slice(0, 2000)).size / Math.min(words.length, 2000)) * 100 : 0;

    const raw = [
      { metric: 'Karma',       user: karmaPerItem, global: globalStats.karma_per_item },
      { metric: 'Activity',    user: perDay,        global: globalStats.activity_per_day },
      { metric: 'Verbosity',   user: avgLen,        global: globalStats.comment_length },
      { metric: 'Diversity',   user: uniqueSubs,    global: globalStats.subreddit_count },
      { metric: 'Night Owl',   user: nightPct,      global: globalStats.night_pct },
      { metric: 'Weekend',     user: weekendPct,    global: globalStats.weekend_pct },
      { metric: 'Controversy', user: controvPct,    global: globalStats.controversy_pct },
      { metric: 'Vocabulary',  user: ttr,           global: globalStats.ttr },
    ];

    return raw.map(r => {
      const { you, avg } = normPair(r.user, r.global);
      return { metric: r.metric, you, avg };
    });
  }, [userData, globalStats]);

  if (!metrics || !globalStats) return null;

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Reddit Personality</h3>
      <p className="stat-meta">Your profile shape vs the median Redditor</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <RadarChart data={metrics} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="rgba(255,107,107,0.12)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }} />
            <Radar name="Avg User" dataKey="avg" stroke={COLORS.DATA_6} fill={COLORS.DATA_6} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
            <Radar name="You" dataKey="you" stroke={COLORS.ACCENT_PRIMARY} fill={COLORS.ACCENT_PRIMARY} fillOpacity={0.2} strokeWidth={2} dot={{ fill: COLORS.ACCENT_PRIMARY, r: 3 }} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
