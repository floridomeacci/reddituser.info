import { COLORS } from '../design-tokens.js';

export default function CommentLengthDistributionChart({ comments }) {
  if (!comments || comments.length === 0) {
    return <div className="distribution-empty">No data</div>;
  }

  const lengths = comments
    .map(c => (c.comment || '').length)
    .filter(l => typeof l === 'number' && !isNaN(l));

  if (lengths.length === 0) {
    return <div className="distribution-empty">No length data</div>;
  }

  // Create bins for histogram
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  const avgLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
  const sortedLengths = [...lengths].sort((a, b) => a - b);
  const medianLength = sortedLengths[Math.floor(sortedLengths.length / 2)];
  
  const binCount = 20;
  const binSize = (maxLength - minLength) / binCount || 1;

  const bins = Array(binCount).fill(0);
  lengths.forEach(length => {
    const binIndex = Math.min(Math.floor((length - minLength) / binSize), binCount - 1);
    bins[binIndex]++;
  });

  const maxBinCount = Math.max(...bins, 1);

  return (
    <div className="distribution-chart">
      <div className="distribution-bars">
        {bins.map((count, index) => {
          const heightPercent = (count / maxBinCount) * 100;
          const binStart = minLength + (index * binSize);
          const binEnd = binStart + binSize;
          return (
            <div 
              key={index} 
              className="distribution-bar-container"
              title={`Length range: ${binStart.toFixed(0)} to ${binEnd.toFixed(0)} chars\n${count} comments (${((count / lengths.length) * 100).toFixed(1)}%)`}
            >
              <div 
                className="distribution-bar"
                style={{ 
                  height: `${heightPercent}%`,
                  backgroundColor: COLORS.ACCENT_SECONDARY,
                  position: 'relative'
                }}
              >
                {count > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-16px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '10px', 
                    color: COLORS.TEXT_GREY_LIGHT,
                    whiteSpace: 'nowrap'
                  }}>
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="distribution-labels">
        <span style={{ fontSize: '11px', color: COLORS.TEXT_GREY_LIGHT }}>Min: {minLength} chars</span>
        <span style={{ fontSize: '11px', color: COLORS.TEXT_GREY_LIGHT }}>Avg: {Math.round(avgLength)} | Median: {medianLength}</span>
        <span style={{ fontSize: '11px', color: COLORS.TEXT_GREY_LIGHT }}>Max: {maxLength} chars</span>
      </div>
    </div>
  );
}
