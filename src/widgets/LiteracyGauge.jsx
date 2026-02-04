export default function LiteracyGauge({ grammarMistakes, grammarLoading, style }) {
  // Show loading state
  if (grammarLoading) {
    return (
      <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
        <h3>Literacy</h3>
        <p className="stat-meta" style={{ marginBottom: '8px' }}>Analyzing grammar...</p>
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '10px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Analyzing grammar...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uniqueCommentsWithErrors = grammarMistakes?.length > 0 
    ? Object.keys(grammarMistakes.reduce((acc, m) => { 
        const key = `${m.url || ''}_${m.timestamp}`;
        acc[key] = true; 
        return acc; 
      }, {})).length 
    : 0;
  const totalComments = 111;
  const errorRate = (uniqueCommentsWithErrors / totalComments) * 100;
  const literacyScore = 100 - errorRate;
  
  const getColor = (score) => {
    if (score < 50) return '#ff4444';
    if (score < 85) return '#ff6b6b';
    return '#ff9999';
  };
  
  const fillColor = getColor(literacyScore);
  
  // Calculate arc paths
  const startAngle = -90;
  const endAngle = 90;
  const radius = 80;
  const innerRadius = radius * 0.6;
  const cx = 100;
  const cy = 120;
  
  const polarToCartesian = (centerX, centerY, r, angleDeg) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: centerX + (r * Math.cos(angleRad)),
      y: centerY + (r * Math.sin(angleRad))
    };
  };
  
  const bgOuterStart = polarToCartesian(cx, cy, radius, startAngle);
  const bgOuterEnd = polarToCartesian(cx, cy, radius, endAngle);
  const bgInnerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const bgInnerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  
  const backgroundPath = [
    `M ${bgOuterStart.x} ${bgOuterStart.y}`,
    `A ${radius} ${radius} 0 0 1 ${bgOuterEnd.x} ${bgOuterEnd.y}`,
    `L ${bgInnerStart.x} ${bgInnerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${bgInnerEnd.x} ${bgInnerEnd.y}`,
    'Z'
  ].join(' ');
  
  const fillAngle = startAngle + (literacyScore / 100) * (endAngle - startAngle);
  const fillOuterStart = polarToCartesian(cx, cy, radius, startAngle);
  const fillOuterEnd = polarToCartesian(cx, cy, radius, fillAngle);
  const fillInnerStart = polarToCartesian(cx, cy, innerRadius, fillAngle);
  const fillInnerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  
  const largeArc = (fillAngle - startAngle) > 180 ? 1 : 0;
  
  const fillPath = literacyScore > 0 ? [
    `M ${fillOuterStart.x} ${fillOuterStart.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${fillOuterEnd.x} ${fillOuterEnd.y}`,
    `L ${fillInnerStart.x} ${fillInnerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${fillInnerEnd.x} ${fillInnerEnd.y}`,
    'Z'
  ].join(' ') : '';

  const totalMistakes = grammarMistakes?.length || 0;
  const ratio = totalMistakes / totalComments;
  const simplifiedComments = 10;
  const simplifiedMistakes = Math.round(ratio * 10);

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Literacy</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {grammarMistakes?.length === 0 
          ? 'No data' 
          : `For every ${simplifiedComments} comments you write you make ${simplifiedMistakes} mistakes`}
      </p>
      <div style={{ height: 'calc(100% - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '10px'
        }}>
          <svg viewBox="0 0 200 160" style={{ width: '100%', maxHeight: '100%' }}>
            <defs>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ff4444', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff9999', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            <path
              d={backgroundPath}
              fill="rgba(200, 200, 200, 0.15)"
              stroke="none"
            />
            
            {literacyScore > 0 && (
              <path
                d={fillPath}
                fill={fillColor}
                stroke="none"
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
            )}
            
            <text
              x={cx}
              y={cy + 15}
              textAnchor="middle"
              style={{
                fontSize: '42px',
                fontWeight: '700',
                fill: fillColor,
                letterSpacing: '0.5px'
              }}
            >
              {Math.round(literacyScore)}
            </text>
            <text
              x={cx}
              y={cy + 35}
              textAnchor="middle"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                fill: 'rgba(255, 255, 255, 0.4)'
              }}
            >
              Literacy
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
