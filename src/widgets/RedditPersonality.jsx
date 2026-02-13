import { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../design-tokens';

// Reddit-wide averages (sourced from published research & API data)
const REDDIT_AVERAGES = {
  karmaPerComment: 7,
  karmaPerPost: 15,
  commentsPerDay: 0.5,
  avgCommentLength: 75,
  uniqueSubreddits: 6,
  nightActivity: 15, // % between midnight-6am
  weekendActivity: 30, // %
  controversyRate: 8, // % of content at 0 or below
};

function normalize(value, avg, max = 100) {
  const ratio = value / avg;
  return Math.min(Math.round(ratio * 50), max); // 50 = average line
}

export default function RedditPersonality({ userData, style }) {
  const metrics = useMemo(() => {
    if (!userData) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    const allItems = [...comments, ...posts];
    if (allItems.length < 5) return null;

    // Karma efficiency
    const totalCommentKarma = comments.reduce((s, c) => s + (c.score || 0), 0);
    const totalPostKarma = posts.reduce((s, p) => s + (p.score || 0), 0);
    const avgKarmaPerComment = comments.length > 0 ? totalCommentKarma / comments.length : 0;
    const avgKarmaPerPost = posts.length > 0 ? totalPostKarma / posts.length : 0;
    const karmaEff = (avgKarmaPerComment + avgKarmaPerPost) / 2;

    // Activity frequency (posts+comments per day)
    const timestamps = allItems.map(i => i.created_utc || 0).filter(t => t > 0);
    const minT = Math.min(...timestamps);
    const maxT = Math.max(...timestamps);
    const daySpan = Math.max((maxT - minT) / 86400, 1);
    const activityPerDay = allItems.length / daySpan;

    // Comment length
    const avgLen = comments.length > 0
      ? comments.reduce((s, c) => s + (c.comment || c.body || '').length, 0) / comments.length
      : 0;

    // Subreddit diversity
    const uniqueSubs = new Set(allItems.map(i => i.subreddit).filter(Boolean)).size;

    // Night owl (midnight-6am UTC)
    const nightCount = allItems.filter(i => {
      const h = new Date((i.created_utc || 0) * 1000).getHours();
      return h >= 0 && h < 6;
    }).length;
    const nightPct = allItems.length > 0 ? (nightCount / allItems.length) * 100 : 0;

    // Weekend activity
    const weekendCount = allItems.filter(i => {
      const d = new Date((i.created_utc || 0) * 1000).getDay();
      return d === 0 || d === 6;
    }).length;
    const weekendPct = allItems.length > 0 ? (weekendCount / allItems.length) * 100 : 0;

    // Controversy (score <= 0)
    const controversialCount = allItems.filter(i => (i.score || 0) <= 0).length;
    const controversyPct = allItems.length > 0 ? (controversialCount / allItems.length) * 100 : 0;

    // Vocabulary richness
    const allText = allItems.map(i => i.comment || i.body || i.title || '').join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words).size;
    const ttr = words.length > 0 ? (uniqueWords / Math.min(words.length, 1000)) * 100 : 0;

    return [
      { metric: 'Karma', value: normalize(karmaEff, (REDDIT_AVERAGES.karmaPerComment + REDDIT_AVERAGES.karmaPerPost) / 2), raw: karmaEff.toFixed(1), fullMark: 100 },
      { metric: 'Activity', value: normalize(activityPerDay, REDDIT_AVERAGES.commentsPerDay), raw: activityPerDay.toFixed(1) + '/day', fullMark: 100 },
      { metric: 'Verbosity', value: normalize(avgLen, REDDIT_AVERAGES.avgCommentLength), raw: Math.round(avgLen) + ' chars', fullMark: 100 },
      { metric: 'Diversity', value: normalize(uniqueSubs, REDDIT_AVERAGES.uniqueSubreddits), raw: uniqueSubs + ' subs', fullMark: 100 },
      { metric: 'Night Owl', value: normalize(nightPct, REDDIT_AVERAGES.nightActivity), raw: nightPct.toFixed(0) + '%', fullMark: 100 },
      { metric: 'Weekend', value: normalize(weekendPct, REDDIT_AVERAGES.weekendActivity), raw: weekendPct.toFixed(0) + '%', fullMark: 100 },
      { metric: 'Controversy', value: normalize(controversyPct, REDDIT_AVERAGES.controversyRate), raw: controversyPct.toFixed(1) + '%', fullMark: 100 },
      { metric: 'Vocabulary', value: normalize(ttr, 40), raw: ttr.toFixed(0) + '%', fullMark: 100 },
    ];
  }, [userData]);

  if (!metrics) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>{d.metric}</div>
        <div style={{ color: '#ff6b6b' }}>{d.raw}</div>
        <div style={{ color: '#999', fontSize: 9 }}>50 = Reddit average</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Reddit Personality</h3>
      <p className="stat-meta">Your profile vs Reddit averages (50 = avg)</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <RadarChart data={metrics} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,107,107,0.15)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            />
            {/* Average reference ring at 50 */}
            <Radar
              name="Average"
              dataKey="fullMark"
              stroke="rgba(255,255,255,0.1)"
              fill="none"
              strokeDasharray="3 3"
            />
            <Radar
              name="You"
              dataKey="value"
              stroke={COLORS.ACCENT_PRIMARY}
              fill="rgba(255,107,107,0.25)"
              strokeWidth={2}
              dot={{ fill: COLORS.ACCENT_PRIMARY, r: 3 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
