import { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG = {
  karmaPerItem: 11, commentsPerDay: 0.5, avgCommentLen: 75,
  uniqueSubs: 6, nightPct: 15, weekendPct: 30, controversyPct: 8, ttr: 40,
};

function norm(val, avg) {
  if (avg === 0) return 50;
  const ratio = val / avg;
  // Log-based normalization: 1x avg = 50, 10x = 80, 100x = 95, 0.1x = 20
  if (ratio <= 0) return 5;
  const score = 50 + (Math.log10(ratio) * 25);
  return Math.max(5, Math.min(Math.round(score), 98));
}

export default function RedditPersonality({ userData, style }) {
  const metrics = useMemo(() => {
    if (!userData) return null;
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

    return [
      { metric: 'Karma', you: norm(karmaPerItem, REDDIT_AVG.karmaPerItem), avg: 50 },
      { metric: 'Activity', you: norm(perDay, REDDIT_AVG.commentsPerDay), avg: 50 },
      { metric: 'Verbosity', you: norm(avgLen, REDDIT_AVG.avgCommentLen), avg: 50 },
      { metric: 'Diversity', you: norm(uniqueSubs, REDDIT_AVG.uniqueSubs), avg: 50 },
      { metric: 'Night Owl', you: norm(nightPct, REDDIT_AVG.nightPct), avg: 50 },
      { metric: 'Weekend', you: norm(weekendPct, REDDIT_AVG.weekendPct), avg: 50 },
      { metric: 'Controversy', you: norm(controvPct, REDDIT_AVG.controversyPct), avg: 50 },
      { metric: 'Vocabulary', you: norm(ttr, REDDIT_AVG.ttr), avg: 50 },
    ];
  }, [userData]);

  if (!metrics) return null;

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Reddit Personality</h3>
      <p className="stat-meta">Your profile shape vs average Redditor (50 = average)</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <RadarChart data={metrics} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="rgba(255,107,107,0.12)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }} />
            <Radar name="Avg Redditor" dataKey="avg" stroke={COLORS.DATA_6} fill={COLORS.DATA_6} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
            <Radar name="You" dataKey="you" stroke={COLORS.ACCENT_PRIMARY} fill={COLORS.ACCENT_PRIMARY} fillOpacity={0.2} strokeWidth={2} dot={{ fill: COLORS.ACCENT_PRIMARY, r: 3 }} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
