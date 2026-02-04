import TopContentList from '../components/TopContentList';

export default function TopWorstContent({ userData, style }) {
  const comments = userData?.comments || [];
  const posts = userData?.posts || [];
  
  if (!comments.length && !posts.length) return null;
  
  const hasComments = comments.length > 0;
  const hasPosts = posts.length > 0;
  const hasAll = hasComments && hasPosts;
  
  const getKarma = (item) => item.karma ?? item.score ?? 0;
  
  const topComments = hasComments ? [...comments].sort((a, b) => getKarma(b) - getKarma(a)) : [];
  const topPosts = hasPosts ? [...posts].sort((a, b) => getKarma(b) - getKarma(a)) : [];
  const worstComments = hasComments ? [...comments].sort((a, b) => getKarma(a) - getKarma(b)) : [];
  const worstPosts = hasPosts ? [...posts].sort((a, b) => getKarma(a) - getKarma(b)) : [];

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '0 16px',
    flex: hasAll ? 1 : 2, // Double width when only one content type
  };

  const dividerStyle = {
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.15) 80%, transparent)',
    alignSelf: 'stretch',
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', padding: '16px 0', ...style }}>
      <div style={{ 
        display: 'flex', 
        height: '100%',
        gap: '0',
      }}>
        {hasComments && (
          <>
            <div style={{ ...sectionStyle, paddingLeft: '16px' }}>
              <h3 style={{ color: '#4ade80', marginBottom: '8px' }}>Top Comments</h3>
              <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '11px' }}>
                Highest rated comments
              </p>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <TopContentList items={topComments} type="comments" />
              </div>
            </div>
            
            {hasPosts && <div style={dividerStyle} />}
          </>
        )}
        
        {hasPosts && (
          <>
            <div style={sectionStyle}>
              <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Top Posts</h3>
              <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '11px' }}>
                Highest rated posts
              </p>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <TopContentList items={topPosts} type="posts" />
              </div>
            </div>
            
            {hasComments && <div style={dividerStyle} />}
          </>
        )}
        
        {hasComments && (
          <>
            <div style={sectionStyle}>
              <h3 style={{ color: '#f87171', marginBottom: '8px' }}>Worst Comments</h3>
              <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '11px' }}>
                Lowest rated comments
              </p>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <TopContentList items={worstComments} type="comments" />
              </div>
            </div>
            
            {hasPosts && <div style={dividerStyle} />}
          </>
        )}
        
        {hasPosts && (
          <div style={{ ...sectionStyle, paddingRight: '16px' }}>
            <h3 style={{ color: '#fb923c', marginBottom: '8px' }}>Worst Posts</h3>
            <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '11px' }}>
              Lowest rated posts
            </p>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <TopContentList items={worstPosts} type="posts" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
