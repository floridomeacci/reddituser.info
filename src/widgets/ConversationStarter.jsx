import { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../design-tokens';

export default function ConversationStarter({ userData, globalStats, style }) {
  const metrics = useMemo(() => {
    if (!userData || !globalStats) return null;
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    if (comments.length < 5 && posts.length < 5) return null;

    // 1. Avg words per comment (verbosity)
    const avgWordsUser = comments.length > 0
      ? comments.reduce((s, c) => s + (c.body || '').split(/\s+/).length, 0) / comments.length
      : 0;
    const avgWordsGlobal = globalStats.comment_length ? globalStats.comment_length / 5 : 15;

    // 2. Question asking rate (posts with ? in title)
    const questionPosts = posts.filter(p => (p.title || '').includes('?')).length;
    const questionRate = posts.length > 0 ? (questionPosts / posts.length) * 100 : 0;
    const globalQuestionRate = 18; // ~18% of Reddit posts are questions

    // 3. Unique subreddits (diversity)
    const userSubs = new Set([...comments.map(c => c.subreddit), ...posts.map(p => p.subreddit)].filter(Boolean));
    const subCount = userSubs.size;
    const globalSubCount = globalStats.subreddit_count || 6;

    // 4. Reply rate - how often they reply (comments vs posts ratio)
    const replyRatio = posts.length > 0 ? comments.length / posts.length : comments.length;
    const globalReplyRatio = 4; // avg Reddit user comments 4x more than posts

    // 5. Consistency - how many distinct days active
    const activeDays = new Set(
      [...comments, ...posts]
        .filter(i => i.created_utc)
        .map(i => new Date(i.created_utc * 1000).toISOString().slice(0, 10))
    );
    const totalDays = activeDays.size;
    const accountAgeDays = userData.account_age_days || 365;
    const consistencyUser = Math.min((totalDays / accountAgeDays) * 100, 100);
    const consistencyGlobal = 8; // avg user active ~8% of days

    // 6. Engagement score (avg score per item)
    const allItems = [...comments, ...posts];
    const avgScore = allItems.length > 0
      ? allItems.reduce((s, i) => s + (i.score || 0), 0) / allItems.length
      : 0;
    const globalAvgScore = globalStats.karma_per_item || 10;

    // Normalize: 50 = exactly average, scale linearly with amplification
    // so small differences are visible (2x avg = 85, 0.5x avg = 25)
    const normalize = (user, global) => {
      if (global <= 0) return 50;
      const ratio = user / global;
      // Amplify differences: use sqrt-based scaling centered at 50
      const score = 50 * Math.sqrt(ratio);
      return Math.max(5, Math.min(Math.round(score), 100));
    };

    return [
      { metric: 'Verbosity', user: normalize(avgWordsUser, avgWordsGlobal), global: 50, rawUser: avgWordsUser.toFixed(0) + ' wds', rawGlobal: avgWordsGlobal.toFixed(0) + ' wds' },
      { metric: 'Questions', user: normalize(questionRate, globalQuestionRate), global: 50, rawUser: questionRate.toFixed(0) + '%', rawGlobal: globalQuestionRate + '%' },
      { metric: 'Diversity', user: normalize(subCount, globalSubCount), global: 50, rawUser: subCount + ' subs', rawGlobal: globalSubCount + ' subs' },
      { metric: 'Replies', user: normalize(replyRatio, globalReplyRatio), global: 50, rawUser: replyRatio.toFixed(1) + 'x', rawGlobal: globalReplyRatio + 'x' },
      { metric: 'Consistency', user: normalize(consistencyUser, consistencyGlobal), global: 50, rawUser: consistencyUser.toFixed(0) + '%', rawGlobal: consistencyGlobal + '%' },
      { metric: 'Impact', user: normalize(avgScore, globalAvgScore), global: 50, rawUser: avgScore.toFixed(1), rawGlobal: globalAvgScore.toFixed(1) },
    ];
  }, [userData, globalStats]);

  if (!metrics) return null;

  const overallUser = Math.round(metrics.reduce((s, m) => s + m.user, 0) / metrics.length);
  const label = overallUser >= 70 ? 'Conversation Leader' : overallUser >= 45 ? 'Active Contributor' : 'Quiet Observer';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.metric}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.rawUser}</div>
        <div style={{ color: COLORS.DATA_6 }}>Avg: {d.rawGlobal}</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Conversation Starter</h3>
      <p className="stat-meta">
        Your discussion footprint vs <span style={{ color: COLORS.DATA_6 }}>average</span> · <span style={{ color: COLORS.ACCENT_PRIMARY }}>{label}</span>
      </p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <RadarChart data={metrics} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar name="Users Avg" dataKey="global" stroke={COLORS.DATA_6} fill={COLORS.DATA_6} fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 3" />
            <Radar name="You" dataKey="user" stroke={COLORS.ACCENT_PRIMARY} fill={COLORS.ACCENT_PRIMARY} fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
