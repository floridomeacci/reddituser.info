import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../design-tokens';
import { getCategoryDistribution, INTEREST_CATEGORIES } from '../data/subredditCategories';

export default function InterestWidget({ userData, style = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const interestData = useMemo(() => {
    const distribution = getCategoryDistribution(userData, 'interest');
    
    // Convert to array and sort by count
    const data = Object.entries(distribution)
      .map(([key, count]) => ({
        category: INTEREST_CATEGORIES[key].label,
        count,
        key
      }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
    
    const total = data.reduce((sum, d) => sum + d.count, 0);
    
    // Add percentages
    return data.map(d => ({
      ...d,
      percentage: total > 0 ? ((d.count / total) * 100).toFixed(1) : 0
    }));
  }, [userData]);
  
  const topInterest = interestData[0];
  
  // Get content from specific category
  const getContentForCategory = (categoryKey) => {
    const categoryInfo = INTEREST_CATEGORIES[categoryKey];
    if (!categoryInfo) return [];
    
    const allContent = [
      ...(userData?.comments || []).map(c => ({ ...c, type: 'comment', text: c.comment || c.body })),
      ...(userData?.posts || []).map(p => ({ ...p, type: 'post', text: p.post || p.title }))
    ];
    
    return allContent.filter(item => {
      if (!item.subreddit) return false;
      const sub = item.subreddit.toLowerCase().trim();
      return categoryInfo.subs.some(catSub => {
        const catSubLower = catSub.toLowerCase().trim();
        // Exact match or user's subreddit starts with category subreddit
        return sub === catSubLower || sub.startsWith(catSubLower + '_') || sub.startsWith(catSubLower);
      });
    }).slice(0, 50);
  };

  const selectedContent = selectedCategory ? getContentForCategory(selectedCategory) : [];
  
  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Interests</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Activity by topic area • Click to see content
      </p>
      
      {!selectedCategory ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: 'calc(100% - 60px)', overflowY: 'auto', paddingRight: '4px' }}>
            {interestData.slice(0, 15).map((item, index) => (
              <div 
                key={item.key} 
                onClick={() => setSelectedCategory(item.key)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '10px',
                  height: '20px',
                  minHeight: '20px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: 'rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              >
                {/* Fixed-width bar container */}
                <div style={{
                  width: '60px',
                  height: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: `${Math.max(parseFloat(item.percentage), 5)}%`,
                    height: '100%',
                    background: index === 0 ? COLORS.ACCENT_PRIMARY : 
                               `rgba(255, 107, 107, ${Math.max(0.4, 0.9 - (index * 0.06))})`,
                    borderRadius: '2px',
                  }} />
                </div>
                
                {/* Label */}
                <span style={{ 
                  flex: 1, 
                  fontSize: '11px', 
                  fontWeight: '500',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1',
                }}>
                  {item.category}
                </span>
                
                {/* Count */}
                <span style={{ 
                  fontSize: '10px', 
                  color: COLORS.TEXT_MUTED,
                  flexShrink: 0,
                  lineHeight: '1',
                }}>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
          
          {interestData.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: COLORS.TEXT_MUTED,
              fontSize: '11px'
            }}>
              No categorized interest activity found
            </div>
          )}
        </>
      ) : (
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>
              {INTEREST_CATEGORIES[selectedCategory]?.label || selectedCategory} ({selectedContent.length})
            </h4>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid ' + COLORS.ACCENT_PRIMARY,
                borderRadius: '4px',
                padding: '4px 12px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer'
              }}>
              ← Back
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {selectedContent.length > 0 ? (
              selectedContent.map((item, idx) => (
                <div key={idx} style={{
                  marginBottom: '12px',
                  padding: '10px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${COLORS.ACCENT_PRIMARY}`
                }}>
                  <div style={{ fontSize: '10px', color: COLORS.TEXT_SECONDARY, marginBottom: '6px' }}>
                    r/{item.subreddit} • {item.type === 'comment' ? 'Comment' : 'Post'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff', lineHeight: '1.4' }}>
                    {item.text?.slice(0, 200)}{item.text?.length > 200 ? '...' : ''}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: COLORS.TEXT_MUTED,
                fontSize: '11px'
              }}>
                No content found for this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
