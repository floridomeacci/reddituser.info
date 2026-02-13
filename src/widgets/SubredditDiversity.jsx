import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_SUBS = 6;

export default function SubredditDiversity({ userData, style }) {
  const { pieData, uniqueCount, topSubs, shannonIndex, label } = useMemo(() => {
    if (!userData) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 5) return {};

    // Count per subreddit
    const subCounts = {};
    allItems.forEach(i => {
      const s = i.subreddit;
      if (s) subCounts[s] = (subCounts[s] || 0) + 1;
    });

    const entries = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);
    const uniqueCount = entries.length;
    if (uniqueCount === 0) return {};

    // Shannon diversity index
    const total = allItems.length;
    let H = 0;
    entries.forEach(([, count]) => {
      const p = count / total;
      if (p > 0) H -= p * Math.log(p);
    });
    const maxH = Math.log(uniqueCount);
    const evenness = maxH > 0 ? H / maxH : 0; // 0-1, how evenly spread

    let lbl = 'Focused';
    if (uniqueCount > 20 && evenness > 0.7) lbl = 'Explorer';
    else if (uniqueCount > 10 && evenness > 0.5) lbl = 'Diverse';
    else if (uniqueCount > 5) lbl = 'Moderate';
    else lbl = 'Focused';

    // Pie data: top 8 + "Others"
    const topN = entries.slice(0, 8);
    const othersCount = entries.slice(8).reduce((s, [, c]) => s + c, 0);
    
    const colors = [COLORS.DATA_1, COLORS.DATA_2, COLORS.DATA_3, COLORS.DATA_4, COLORS.DATA_5, COLORS.DATA_6, COLORS.DATA_7, COLORS.DATA_8];
    const pieData = topN.map(([name, count], i) => ({
      name,
      value: count,
      pct: Math.round((count / total) * 1000) / 10,
      fill: colors[i % colors.length],
    }));
    if (othersCount > 0) {
      pieData.push({
        name: `Others (${entries.length - 8})`,
        value: othersCount,
        pct: Math.round((othersCount / total) * 1000) / 10,
        fill: 'rgba(255,255,255,0.15)',
      });
    }

    return { pieData, uniqueCount, topSubs: topN.slice(0, 3), shannonIndex: evenness, label: lbl };
  }, [userData]);

  if (!pieData) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>r/{d.name}</div>
        <div style={{ color: d.fill }}>{d.pct}% ({d.value} items)</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Subreddit Diversity</h3>
      <p className="stat-meta">
        <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{uniqueCount}</span> subreddits
        <span style={{ opacity: 0.5 }}> (avg ~{REDDIT_AVG_SUBS})</span>
        {' · '}
        <span style={{ color: COLORS.ACCENT_PRIMARY }}>{label}</span>
      </p>
      <div style={{ display: 'flex', height: 'calc(100% - 50px)', gap: 8 }}>
        <div style={{ flex: '0 0 55%' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius="45%"
                outerRadius="80%"
                dataKey="value"
                stroke="none"
                paddingAngle={2}
              >
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          {/* Evenness bar */}
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Evenness</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{ width: `${shannonIndex * 100}%`, height: '100%', background: COLORS.ACCENT_PRIMARY, borderRadius: 3, transition: 'width 1s' }} />
            </div>
          </div>
          {/* Top subs list */}
          <div style={{ fontSize: 10 }}>
            {topSubs.map(([name, count], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>r/{name}</span>
                <span style={{ color: COLORS.ACCENT_PRIMARY, fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
