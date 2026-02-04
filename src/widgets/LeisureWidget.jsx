import { useMemo, useState } from 'react';
import { COLORS } from '../design-tokens';
import { getCategoryDistribution, LEISURE_CATEGORIES } from '../data/subredditCategories';

export default function LeisureWidget({ userData, style = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const leisureData = useMemo(() => {
    const distribution = getCategoryDistribution(userData, 'leisure');
    
    // Convert to array and sort by count
    const data = Object.entries(distribution)
      .map(([key, count]) => ({
        category: LEISURE_CATEGORIES[key].label,
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
  
  const topLeisure = leisureData[0];
  
  // Get content from specific category
  const getContentForCategory = (categoryKey) => {
    const categoryInfo = LEISURE_CATEGORIES[categoryKey];
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
      <h3>Leisure & Entertainment</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Free time activities • Click to see content
      </p>
      
      {!selectedCategory ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: 'calc(100% - 60px)', overflowY: 'auto', paddingRight: '4px' }}>
            {leisureData.map((item, index) => (
              <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  fontWeight: '600',
                  color: COLORS.TEXT_LIGHT_GREY
                }}>
                  <span>{item.category}</span>
                  <span style={{ color: COLORS.TEXT_MUTED }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                
                <div 
                  onClick={() => setSelectedCategory(item.key)}
                  style={{
                    position: 'relative',
                    height: '14px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${item.percentage}%`,
                    background: index === 0 ? COLORS.DATA_2 : 
                               `rgba(74, 222, 128, ${0.7 - (index * 0.1)})`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
          
          {leisureData.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: COLORS.TEXT_MUTED,
              fontSize: '11px'
            }}>
              No categorized leisure activity found
            </div>
          )}
        </>
      ) : (
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>
              {LEISURE_CATEGORIES[selectedCategory]?.label || selectedCategory} ({selectedContent.length})
            </h4>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'rgba(74, 222, 128, 0.2)',
                border: '1px solid ' + COLORS.DATA_2,
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
                  background: 'rgba(74, 222, 128, 0.1)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${COLORS.DATA_2}`
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
