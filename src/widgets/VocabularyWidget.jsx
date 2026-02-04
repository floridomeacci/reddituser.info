import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function VocabularyWidget({ userData, style }) {
  // Helper to collect text
  const collectArrays = (ud) => {
    const arrs = [];
    if (!ud) return arrs;
    if (Array.isArray(ud.comments)) arrs.push(...ud.comments);
    if (Array.isArray(ud.posts)) arrs.push(...ud.posts);
    if (Array.isArray(ud.items)) arrs.push(...ud.items);
    if (Array.isArray(ud.data?.comments)) arrs.push(...ud.data.comments);
    if (Array.isArray(ud.data?.posts)) arrs.push(...ud.data.posts);
    if (Array.isArray(ud.children)) arrs.push(...ud.children);
    return arrs;
  };

  const contentItems = collectArrays(userData);

  const textFromItem = (it) => {
    if (!it) return '';
    if (typeof it === 'string') return it;
    return (
      (it.text || it.body || it.selftext || it.title || it.comment || it.content || '') +
      ' ' + (it.summary || it.excerpt || '')
    ).trim();
  };

  const combinedText = contentItems.map(textFromItem).filter(Boolean).join(' ');
  const fallbackText = [
    ...(userData?.comments || []).map(c => c.text || c.body || ''),
    ...(userData?.posts || []).map(p => (p.title || '') + ' ' + (p.selftext || p.text || ''))
  ].join(' ');

  const textToUse = combinedText.length > 0 ? combinedText : fallbackText;

  // Morpheme counter
  const countMorphemes = (word) => {
    word = (word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (word.length === 0) return 0;
    let count = 1;
    let remaining = word;
    
    const prefixes = ['un','re','dis','in','im','il','ir','non','mis','de','anti','counter','fore','inter','mid','over','out','pre','post','sub','super','trans','under','en','em'];
    let foundPrefix = true;
    while (foundPrefix && remaining.length > 3) {
      foundPrefix = false;
      for (const p of prefixes) {
        if (remaining.startsWith(p) && remaining.length > p.length + 2) {
          count++;
          remaining = remaining.slice(p.length);
          foundPrefix = true;
          break;
        }
      }
    }
    
    const suffixes = ['tion','sion','ation','ition','ness','ment','ship','hood','dom','ence','ance','ency','ancy','ity','ty','er','or','ar','ist','ian','ant','ent','able','ible','ful','less','ous','eous','ious','ive','ative','itive','ic','ical','al','ial','ish','like','ly','ing','ed','en','est','s','es'];
    let foundSuffix = true;
    while (foundSuffix && remaining.length > 3) {
      foundSuffix = false;
      const sortedSuffixes = suffixes.sort((a, b) => b.length - a.length);
      for (const s of sortedSuffixes) {
        if (remaining.endsWith(s) && remaining.length > s.length + 2) {
          count++;
          remaining = remaining.slice(0, -s.length);
          foundSuffix = true;
          break;
        }
      }
    }
    
    return count;
  };

  const words = (textToUse || '').toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalWords = words.length;
  const totalMorphemes = words.reduce((sum, w) => sum + countMorphemes(w), 0);

  const morphemeCounts = {};
  words.forEach(w => {
    const c = countMorphemes(w);
    morphemeCounts[c] = (morphemeCounts[c] || 0) + 1;
  });

  const sortedCounts = Object.entries(morphemeCounts)
    .map(([count, num]) => ({ count: parseInt(count), words: num }))
    .sort((a,b) => a.count - b.count);

  const chartData = sortedCounts.map(({ count, words }) => ({
    name: `${count} morpheme${count !== 1 ? 's' : ''}`,
    count,
    words,
    weight: words
  }));

  const redColors = ['#ff4444', '#ff6b6b', '#ff9999', '#ffb3b3', '#ffcccc'];

  if (!userData) {
    return (
      <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
        <h3>Vocabulary</h3>
        <p className="stat-meta" style={{ marginBottom: '8px' }}>No data</p>
        <div className="chart-container" style={{ height: 'calc(100% - 60px)' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', padding: '20px', textAlign: 'center' }}>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Vocabulary</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {totalWords.toLocaleString()} words • {totalMorphemes.toLocaleString()} total morphemes
      </p>
      <div className="chart-container" style={{ height: 'calc(100% - 60px)' }}>
        {sortedCounts.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '20px' }}>No words found</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                label={{ value: 'Word Count', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.5)' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ 
                        background: 'rgba(0, 0, 0, 0.9)', 
                        border: '1px solid rgba(255, 68, 68, 0.5)',
                        borderRadius: '4px',
                        padding: '8px 12px'
                      }}>
                        <div style={{ color: '#ff6b6b', fontWeight: '600', marginBottom: '4px' }}>
                          {data.name}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
                          {data.words.toLocaleString()} words
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="words" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={redColors[index % redColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
