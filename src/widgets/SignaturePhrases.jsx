import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { COLORS } from '../design-tokens';

export default function AwardAnalysis({ userData, style = {} }) {
  const awardData = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return null;
    }

    const allContent = [
      ...(userData.comments || []).map(c => ({ 
        ...c, 
        type: 'comment',
        awards: c.all_awardings || [],
        totalAwards: c.total_awards_received || 0,
        created: c.created_utc
      })),
      ...(userData.posts || []).map(p => ({ 
        ...p, 
        type: 'post',
        awards: p.all_awardings || [],
        totalAwards: p.total_awards_received || 0,
        created: p.created_utc
      }))
    ];

    // Calculate total awards
    const totalAwards = allContent.reduce((sum, item) => sum + item.totalAwards, 0);
    const awardedContent = allContent.filter(item => item.totalAwards > 0);

    if (awardedContent.length === 0) {
      return { noAwards: true };
    }

    // Award types analysis
    const awardTypeMap = new Map();
    let totalAwardValue = 0;

    awardedContent.forEach(item => {
      (item.awards || []).forEach(award => {
        const name = award.name || 'Unknown';
        const count = award.count || 1;
        const coinPrice = award.coin_price || 0;
        
        if (!awardTypeMap.has(name)) {
          awardTypeMap.set(name, { 
            count: 0, 
            value: coinPrice,
            items: []
          });
        }
        const entry = awardTypeMap.get(name);
        entry.count += count;
        entry.items.push(item);
        totalAwardValue += coinPrice * count;
      });
    });

    const topAwardTypes = Array.from(awardTypeMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
        totalValue: data.value * data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Awards by subreddit
    const subredditAwards = new Map();
    awardedContent.forEach(item => {
      const sub = item.subreddit || 'unknown';
      if (!subredditAwards.has(sub)) {
        subredditAwards.set(sub, { count: 0, karma: item.score || 0 });
      }
      const entry = subredditAwards.get(sub);
      entry.count += item.totalAwards;
      entry.karma += item.score || 0;
    });

    const topSubreddits = Array.from(subredditAwards.entries())
      .map(([subreddit, data]) => ({
        subreddit,
        count: data.count,
        karma: data.karma
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Awards over time
    const awardsByMonth = new Map();
    awardedContent.forEach(item => {
      const date = new Date(item.created * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!awardsByMonth.has(monthKey)) {
        awardsByMonth.set(monthKey, 0);
      }
      awardsByMonth.set(monthKey, awardsByMonth.get(monthKey) + item.totalAwards);
    });

    const awardsTimeline = Array.from(awardsByMonth.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Award-to-karma ratio
    const totalKarma = allContent.reduce((sum, item) => sum + (item.score || 0), 0);
    const awardToKarmaRatio = totalKarma > 0 ? (totalAwards / totalKarma) * 1000 : 0;

    // Reddit Premium value (rough estimate: 500 coins = $1.99)
    const premiumValue = (totalAwardValue / 500) * 1.99;

    // Interpretation
    let interpretation = '';
    let color = COLORS.DATA_5;

    if (awardToKarmaRatio > 10) {
      interpretation = 'Highly awarded content';
      color = COLORS.ACCENT_PRIMARY;
    } else if (awardToKarmaRatio > 5) {
      interpretation = 'Quality content';
      color = COLORS.DATA_3;
    } else if (awardToKarmaRatio > 1) {
      interpretation = 'Occasionally awarded';
      color = COLORS.DATA_5;
    } else {
      interpretation = 'Rarely awarded';
      color = COLORS.TEXT_MUTED;
    }

    return {
      totalAwards,
      awardedContent: awardedContent.length,
      topAwardTypes,
      topSubreddits,
      awardsTimeline,
      awardToKarmaRatio,
      premiumValue,
      totalAwardValue,
      interpretation,
      color
    };
  }, [userData]);

  if (!awardData) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Award Analysis</h3>
        <p className="stat-meta">No content available for analysis</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '200px',
          color: COLORS.TEXT_MUTED,
          fontSize: '12px'
        }}>
          No content to analyze
        </div>
      </div>
    );
  }

  if (awardData.noAwards) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Award Analysis</h3>
        <p className="stat-meta">No awards received yet</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '200px',
          color: COLORS.TEXT_MUTED,
          fontSize: '12px'
        }}>
          No awards found on content
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Award Analysis</h3>
      <p className="stat-meta">
        {awardData.totalAwards} awards • ${awardData.premiumValue.toFixed(2)} value • {awardData.interpretation}
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top subreddits giving awards */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={awardData.topSubreddits} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis 
              type="number"
              stroke={COLORS.TEXT_MUTED}
              style={{ fontSize: '9px' }}
              label={{ value: 'Awards Received', position: 'insideBottom', offset: -5, style: { fontSize: '9px', fill: COLORS.TEXT_MUTED } }}
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
                `${value} awards (${props.payload.karma} karma)`,
                'Received'
              ]}
              labelFormatter={(value) => `r/${value}`}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {awardData.topSubreddits.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.ACCENT_PRIMARY} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
