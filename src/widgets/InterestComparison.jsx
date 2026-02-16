import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { COLORS } from '../design-tokens';
import { getCategoryDistribution, INTEREST_CATEGORIES } from '../data/subredditCategories';

export default function InterestComparison({ userData, globalStats, style }) {

  const chartData = useMemo(() => {
    if (!userData || !globalStats?.interests) return null;
    
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return null;

    // Calculate user's interest distribution
    let userInterests = {};
    
    // Use backend-calculated interests if available
    if (userData.interests && Object.keys(userData.interests).length > 0) {
      userInterests = userData.interests;
    } else {
      // Fallback: calculate client-side
      const distribution = getCategoryDistribution(userData, 'interest');
      userInterests = Object.entries(distribution).reduce((acc, [key, count]) => {
        acc[key] = { count, percentage: 0 };
        return acc;
      }, {});
    }

    // Convert to percentages
    const userTotal = Object.values(userInterests).reduce((sum, val) => sum + val.count, 0);
    const userPct = Object.entries(userInterests).reduce((acc, [key, val]) => {
      acc[key] = userTotal > 0 ? (val.count / userTotal) * 100 : 0;
      return acc;
    }, {});

    // Get top 8 categories (by global average or user activity)
    const allCategories = new Set([
      ...Object.keys(userPct).filter(k => userPct[k] > 0),
      ...Object.keys(globalStats.interests || {})
    ]);

    const data = Array.from(allCategories)
      .map(key => ({
        category: INTEREST_CATEGORIES[key]?.label || key,
        you: Math.round(userPct[key] || 0),
        avg: Math.round(globalStats.interests[key] || 0),
        key
      }))
      .filter(d => d.you > 0 || d.avg > 0)
      .sort((a, b) => (b.you + b.avg) - (a.you + a.avg))
      .slice(0, 8);

    return data.length > 0 ? data : null;
  }, [userData, globalStats]);

  if (!chartData || !globalStats) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.category}</div>
        <div style={{ color: COLORS.ACCENT_PRIMARY }}>You: {d.you}%</div>
        <div style={{ color: COLORS.DATA_6 }}>Users avg: {d.avg}%</div>
      </div>
    );
  };

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Interest Comparison</h3>
      <p className="stat-meta">Your interests vs average users · Top categories by activity</p>
      <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }} barCategoryGap="15%">
            <XAxis 
              dataKey="category" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
              tickLine={false}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={v => `${v}%`} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend iconType="square" wrapperStyle={{ fontSize: 10, opacity: 0.7 }} />
            <Bar dataKey="you" name="You" fill={COLORS.ACCENT_PRIMARY} radius={[3, 3, 0, 0]} barSize={12} />
            <Bar dataKey="avg" name="Users Avg" fill={COLORS.DATA_6} opacity={0.6} radius={[3, 3, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
