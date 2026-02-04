import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../design-tokens';
import { INTEREST_CATEGORIES, LEISURE_CATEGORIES, NSFW_CATEGORIES } from '../data/subredditCategories';

export default function SubredditActivityWidget({ userData, style = {} }) {
  // Helper function to categorize a subreddit
  const categorizeSubreddit = (subreddit) => {
    if (!subreddit) return null;
    const sub = subreddit.toLowerCase().trim();
    
    // Check all categories
    const allCats = {
      ...INTEREST_CATEGORIES,
      ...LEISURE_CATEGORIES,
      ...NSFW_CATEGORIES
    };
    
    for (const [key, info] of Object.entries(allCats)) {
      if (info.subs.some(catSub => {
        const catSubLower = catSub.toLowerCase().trim();
        return sub === catSubLower || sub.startsWith(catSubLower);
      })) {
        return { key, label: info.label };
      }
    }
    return null;
  };

  // Build time series data
  const timeSeriesData = useMemo(() => {
    if (!userData) {
      console.log('SubredditActivityWidget: No userData');
      return [];
    }

    const allContent = [
      ...(userData?.comments || []).map(c => ({ 
        subreddit: c.subreddit,
        timestamp: c.timestamp || c.created_utc || c.created,
        type: 'comment'
      })),
      ...(userData?.posts || []).map(p => ({ 
        subreddit: p.subreddit,
        timestamp: p.timestamp || p.created_utc || p.created,
        type: 'post'
      }))
    ].filter(item => item.timestamp && item.subreddit);

    console.log('SubredditActivityWidget: allContent length', allContent.length);
    console.log('SubredditActivityWidget: sample content', allContent.slice(0, 3));

    // Sort by date
    allContent.sort((a, b) => a.timestamp - b.timestamp);

    if (allContent.length === 0) {
      console.log('SubredditActivityWidget: No content with timestamp and subreddit');
      return [];
    }

    // Group by month
    const monthlyData = {};
    let categorizedCount = 0;
    let uncategorizedCount = 0;
    const uncategorizedSubs = new Set();
    
    allContent.forEach(item => {
      const date = new Date(item.timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          categories: {}
        };
      }
      
      const category = categorizeSubreddit(item.subreddit);
      if (category) {
        categorizedCount++;
        if (!monthlyData[monthKey].categories[category.key]) {
          monthlyData[monthKey].categories[category.key] = {
            label: category.label,
            count: 0
          };
        }
        monthlyData[monthKey].categories[category.key].count++;
      } else {
        uncategorizedCount++;
        uncategorizedSubs.add(item.subreddit);
      }
    });

    console.log('SubredditActivityWidget: categorized', categorizedCount, 'uncategorized', uncategorizedCount);
    console.log('SubredditActivityWidget: sample uncategorized subs', Array.from(uncategorizedSubs).slice(0, 10));
    console.log('SubredditActivityWidget: monthlyData keys', Object.keys(monthlyData));

    // Get all unique categories and their total counts
    const categoryCounts = {};
    Object.values(monthlyData).forEach(month => {
      Object.values(month.categories).forEach(cat => {
        categoryCounts[cat.label] = (categoryCounts[cat.label] || 0) + cat.count;
      });
    });

    // Calculate total and percentages
    const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    
    // Sort categories by count (largest to smallest)
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));

    console.log('SubredditActivityWidget: sortedCategories', sortedCategories);

    return sortedCategories;
  }, [userData]);

  // Color palette - primary red with reduced opacity (biggest = most opaque)
  const getColorForCategory = (index, total) => {
    // Calculate opacity from 1.0 (biggest) to 0.3 (smallest)
    const opacity = 1.0 - (index / Math.max(total - 1, 1)) * 0.7;
    return `rgba(255, 107, 107, ${opacity})`;
  };

  if (!userData) {
    return (
      <div className="cell" style={{ gridColumn: 'span 6', gridRow: 'span 2', ...style }}>
        <h3>Interests</h3>
        <p className="stat-meta">Loading...</p>
      </div>
    );
  }

  if (timeSeriesData.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 6', gridRow: 'span 2', ...style }}>
        <h3>Interests</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 6', gridRow: 'span 2', ...style, display: 'flex', flexDirection: 'column' }}>
      <h3>Interests</h3>
      
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0 5px 0'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '90%',
          height: '100%',
          overflow: 'visible',
        }}>
          {timeSeriesData.map((cat, index) => {
            // Find the max percentage
            const maxPercentage = Math.max(...timeSeriesData.map(c => c.percentage));
            // Scale width between 40% and 100% based on percentage relative to max
            const widthPercent = 40 + ((cat.percentage / maxPercentage) * 60);
            
            return (
              <div 
                key={cat.label}
                style={{
                  flex: Math.max(cat.percentage, 1.5),
                  backgroundColor: getColorForCategory(index, timeSeriesData.length),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '22px',
                  width: `${widthPercent}%`,
                  marginLeft: 'auto',
                  padding: '2px 12px'
                }}
              >
                <span style={{ 
                  color: 'white', 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {cat.label}
                </span>
                <span style={{ 
                  color: 'white', 
                  fontSize: '11px',
                  fontWeight: '500',
                  opacity: 0.8,
                  marginLeft: '8px',
                  flexShrink: 0,
                }}>
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="stat-meta" style={{ marginTop: '0', marginBottom: '5px', textAlign: 'left' }}>
        Activity distribution by category
      </p>
    </div>
  );
}
