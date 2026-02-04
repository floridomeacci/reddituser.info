import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

export default function EditFrequency({ userData, style = {} }) {
  const editData = useMemo(() => {
    if (!userData) return null;

    const allContent = [
      ...(userData.comments || []).map(c => ({
        type: 'comment',
        edited: c.edited || false,
        created: c.created_utc || c.timestamp,
        subreddit: c.subreddit
      })),
      ...(userData.posts || []).map(p => ({
        type: 'post',
        edited: p.edited || false,
        created: p.created_utc || p.timestamp,
        subreddit: p.subreddit
      }))
    ];

    const totalComments = allContent.filter(c => c.type === 'comment').length;
    const totalPosts = allContent.filter(c => c.type === 'post').length;
    const editedComments = allContent.filter(c => c.type === 'comment' && c.edited).length;
    const editedPosts = allContent.filter(c => c.type === 'post' && c.edited).length;

    const commentEditRate = totalComments > 0 ? (editedComments / totalComments) * 100 : 0;
    const postEditRate = totalPosts > 0 ? (editedPosts / totalPosts) * 100 : 0;
    const overallEditRate = allContent.length > 0 ? ((editedComments + editedPosts) / allContent.length) * 100 : 0;

    // Group by subreddit
    const subredditEdits = {};
    allContent.forEach(item => {
      if (!item.subreddit) return;
      if (!subredditEdits[item.subreddit]) {
        subredditEdits[item.subreddit] = { total: 0, edited: 0 };
      }
      subredditEdits[item.subreddit].total++;
      if (item.edited) subredditEdits[item.subreddit].edited++;
    });

    const topEditedSubreddits = Object.entries(subredditEdits)
      .map(([sub, data]) => ({
        subreddit: sub,
        editRate: (data.edited / data.total) * 100,
        edited: data.edited,
        total: data.total
      }))
      .filter(s => s.total >= 3) // Only show subs with at least 3 items
      .sort((a, b) => b.editRate - a.editRate)
      .slice(0, 8);

    // Interpretation
    let interpretation = '';
    let color = '';
    if (overallEditRate < 5) {
      interpretation = 'Impulsive poster';
      color = '#4ade80'; // green
    } else if (overallEditRate < 15) {
      interpretation = 'Occasional editor';
      color = '#fbbf24'; // yellow
    } else if (overallEditRate < 30) {
      interpretation = 'Frequent editor';
      color = '#fb923c'; // orange
    } else {
      interpretation = 'Perfectionist';
      color = '#ef4444'; // red
    }

    return {
      totalComments,
      totalPosts,
      editedComments,
      editedPosts,
      commentEditRate,
      postEditRate,
      overallEditRate,
      topEditedSubreddits,
      interpretation,
      color
    };
  }, [userData]);

  if (!userData || !editData) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Edit Frequency</h3>
        <p className="stat-meta">Loading...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Comments', rate: editData.commentEditRate, edited: editData.editedComments, total: editData.totalComments },
    { name: 'Posts', rate: editData.postEditRate, edited: editData.editedPosts, total: editData.totalPosts }
  ];

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Edit Frequency</h3>
      <p className="stat-meta">How often content gets edited after posting</p>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ResponsiveContainer width="100%" height="50%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              stroke={COLORS.TEXT_MUTED}
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke={COLORS.TEXT_MUTED}
              style={{ fontSize: '10px' }}
              label={{ value: 'Edit Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: COLORS.TEXT_MUTED } }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0, 0, 0, 0.9)', 
                border: `1px solid ${COLORS.ACCENT_PRIMARY}`,
                borderRadius: '4px',
                fontSize: '11px'
              }}
              formatter={(value, name, props) => [
                `${value.toFixed(1)}% (${props.payload.edited}/${props.payload.total})`,
                'Edit Rate'
              ]}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.ACCENT_PRIMARY} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Most edited subreddits chart */}
        {editData.topEditedSubreddits.length > 0 && (
          <ResponsiveContainer width="100%" height="50%">
            <BarChart 
              data={editData.topEditedSubreddits.slice(0, 8)} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis 
                type="number"
                stroke={COLORS.TEXT_MUTED}
                style={{ fontSize: '9px' }}
                label={{ value: 'Edit Rate (%)', position: 'insideBottom', offset: -5, style: { fontSize: '9px', fill: COLORS.TEXT_MUTED } }}
              />
              <YAxis 
                type="category"
                dataKey="subreddit"
                stroke={COLORS.TEXT_MUTED}
                style={{ fontSize: '9px' }}
                tickFormatter={(value) => `r/${value}`}
                width={75}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0, 0, 0, 0.9)', 
                  border: `1px solid ${COLORS.ACCENT_PRIMARY}`,
                  borderRadius: '4px',
                  fontSize: '10px'
                }}
                formatter={(value, name, props) => [
                  `${value.toFixed(1)}% (${props.payload.edited}/${props.payload.total})`,
                  'Edit Rate'
                ]}
                labelFormatter={(value) => `r/${value}`}
              />
              <Bar dataKey="editRate" radius={[0, 4, 4, 0]}>
                {editData.topEditedSubreddits.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.ACCENT_PRIMARY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
