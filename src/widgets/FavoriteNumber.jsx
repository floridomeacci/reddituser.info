import { getDesignTokens } from '../design-tokens';

export default function FavoriteNumber({ userData, style }) {
  const tokens = getDesignTokens();

  // Extract numbers from comments and posts
  const extractNumbers = () => {
    const numberCounts = {};
    const allItems = [...(userData?.comments || []), ...(userData?.posts || [])];
    
    allItems.forEach(item => {
      const text = item.comment || item.post || '';
      // Match standalone numbers (not part of URLs or dates)
      const numberMatches = text.match(/\b(\d{1,4})\b/g);
      
      if (numberMatches) {
        numberMatches.forEach(num => {
          const number = parseInt(num, 10);
          // Filter out years and very common meaningless numbers
          if (number > 0 && number < 10000 && number !== 2020 && number !== 2021 && number !== 2022 && number !== 2023 && number !== 2024 && number !== 2025) {
            numberCounts[number] = (numberCounts[number] || 0) + 1;
          }
        });
      }
    });
    
    return numberCounts;
  };

  const numberCounts = extractNumbers();
  
  // Sort by frequency and get top 3
  const topNumbers = Object.entries(numberCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Hide widget if no numbers found
  if (topNumbers.length === 0) return null;

  // Olympic podium configuration: [2nd, 1st, 3rd]
  const podiumOrder = topNumbers.length >= 3 
    ? [topNumbers[1], topNumbers[0], topNumbers[2]]
    : topNumbers.length === 2
    ? [topNumbers[1], topNumbers[0], null]
    : topNumbers.length === 1
    ? [null, topNumbers[0], null]
    : [null, null, null];

  const podiumHeights = ['120px', '160px', '90px']; // 2nd, 1st, 3rd
  const podiumColors = [
    '#ff9999', // 2nd - lighter red
    '#ff6b6b', // 1st - main red  
    '#888888'  // 3rd - grey
  ];
  const medals = ['🥈', '🥇', '🥉'];

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Favorite numbers</h3>
      <p className="stat-meta" style={{ marginBottom: '16px' }}>
        Most frequently mentioned numbers
      </p>
      
      {topNumbers.length > 0 ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '12px',
          flex: 1,
          paddingBottom: '20px'
        }}>
          {podiumOrder.map((entry, idx) => (
            <div 
              key={idx}
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: entry ? 1 : 0.2,
                minWidth: '80px'
              }}
            >
              {/* Medal and number */}
              <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {medals[idx]}
                </div>
                <div style={{ 
                  fontSize: entry ? '42px' : '32px', 
                  fontWeight: 'bold',
                  color: entry ? podiumColors[idx] : '#333',
                  lineHeight: 1
                }}>
                  {entry ? entry[0] : '?'}
                </div>
              </div>
              
              {/* Podium base */}
              <div style={{
                width: '100%',
                height: podiumHeights[idx],
                background: `linear-gradient(to bottom, ${podiumColors[idx]}40, ${podiumColors[idx]}20)`,
                border: `2px solid ${podiumColors[idx]}60`,
                borderRadius: '4px 4px 0 0',
                opacity: entry ? 1 : 0.3
              }}>
              </div>
              
              {/* Count below podium */}
              <div style={{ 
                fontSize: '9px', 
                opacity: 0.6,
                marginTop: '4px'
              }}>
                {entry ? `${entry[1]}×` : '—'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1,
          opacity: 0.5
        }}>
          <p style={{ fontSize: '11px' }}>No numbers found</p>
        </div>
      )}
    </div>
  );
}
