import { useMemo, useState } from 'react';
import { COLORS } from '../design-tokens';
import { getCategoryDistribution, NSFW_CATEGORIES } from '../data/subredditCategories';

export default function KinkWidget({ userData, style = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const kinkData = useMemo(() => {
    const distribution = getCategoryDistribution(userData, 'nsfw');
    
    // Convert to array and sort by count
    const data = Object.entries(distribution)
      .map(([key, count]) => ({
        category: NSFW_CATEGORIES[key].label,
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
  
  const hasNsfwActivity = kinkData.length > 0;
  const totalNsfwActivity = kinkData.reduce((sum, d) => sum + d.count, 0);
  
  // Get content from specific category
  const getContentForCategory = (categoryKey) => {
    const categoryInfo = NSFW_CATEGORIES[categoryKey];
    if (!categoryInfo) {
      console.log('No category info found for:', categoryKey);
      return [];
    }
    
    const allContent = [
      ...(userData?.comments || []).map(c => ({ 
        ...c, 
        type: 'comment', 
        text: c.comment || c.body, 
        subreddit: c.subreddit 
      })),
      ...(userData?.posts || []).map(p => ({ 
        ...p, 
        type: 'post', 
        text: p.post || p.title, 
        subreddit: p.subreddit 
      }))
    ];
    
    // Filter content using stricter matching to avoid false positives
    const filtered = allContent.filter(item => {
      if (!item.subreddit) return false;
      const sub = item.subreddit.toLowerCase().trim();
      
      // Use exact match or prefix match only (not bidirectional contains)
      return categoryInfo.subs.some(catSub => {
        const catSubLower = catSub.toLowerCase().trim();
        // Exact match or user's subreddit starts with category subreddit
        return sub === catSubLower || sub.startsWith(catSubLower + '_') || sub.startsWith(catSubLower);
      });
    });
    
    return filtered.slice(0, 50);
  };

  const selectedContent = selectedCategory ? getContentForCategory(selectedCategory) : [];
  
  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Adult Content</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        NSFW subreddit activity • Click to see content
      </p>
      
      {hasNsfwActivity ? (
        !selectedCategory ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: 'calc(100% - 60px)', overflowY: 'auto', paddingRight: '4px' }}>
            {kinkData.map((item, index) => (
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
                    background: index === 0 ? COLORS.DATA_5 : 
                               `rgba(167, 139, 250, ${0.7 - (index * 0.15)})`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>
                {NSFW_CATEGORIES[selectedCategory]?.label || selectedCategory} ({selectedContent.length})
              </h4>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: 'rgba(167, 139, 250, 0.2)',
                  border: '1px solid ' + COLORS.DATA_5,
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
                    background: 'rgba(167, 139, 250, 0.1)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${COLORS.DATA_5}`
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
        )
      ) : (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: COLORS.TEXT_MUTED,
          fontSize: '11px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>
            🔒
          </div>
          <div>No NSFW activity detected</div>
        </div>
      )}
    </div>
  );
}
