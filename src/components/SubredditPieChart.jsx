import { useState } from 'react';

export default function SubredditPieChart({ subreddits }) {
  const [hoveredSubreddit, setHoveredSubreddit] = useState(null);

  if (!subreddits || subreddits.length === 0) {
    return <div className="pie-empty">No data</div>;
  }

  const displayData = subreddits.slice(0, 8);
  const total = displayData.reduce((sum, sub) => sum + sub.count, 0);

  // Use same red shade system as activity heatmap
  const getRedShade = (index, total) => {
    const intensity = 1 - (index / total); // Inverted so first item is brightest
    // Red color from design system: #ff6b6b
    return `rgba(255, 107, 107, ${0.2 + intensity * 0.8})`;
  };

  let currentAngle = -90;

  const createPieSlice = (percentage, startAngle) => {
    if (percentage >= 99.9) {
      return {
        path: `M 100 100 m -90 0 a 90 90 0 1 0 180 0 a 90 90 0 1 0 -180 0`,
        endAngle: startAngle + 360
      };
    }

    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + 90 * Math.cos(startRad);
    const y1 = 100 + 90 * Math.sin(startRad);
    const x2 = 100 + 90 * Math.cos(endRad);
    const y2 = 100 + 90 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M 100 100`,
      `L ${x1} ${y1}`,
      `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');

    return { path, endAngle };
  };

  return (
    <div className="subreddit-pie-container">
      <svg viewBox="0 0 200 200" className="subreddit-pie-svg">
        {displayData.map((sub, idx) => {
          const percentage = (sub.count / total) * 100;
          const slice = createPieSlice(percentage, currentAngle);
          currentAngle = slice.endAngle;
          const color = getRedShade(idx, displayData.length);

          return (
            <path
              key={idx}
              d={slice.path}
              fill={color}
              stroke="var(--color-bg-card)"
              strokeWidth="1"
              className="subreddit-pie-slice"
              style={{ 
                cursor: 'pointer',
                opacity: hoveredSubreddit === null || hoveredSubreddit === idx ? 1 : 0.5,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={() => setHoveredSubreddit(idx)}
              onMouseLeave={() => setHoveredSubreddit(null)}
            >
              <title>{sub.name}: {sub.count} ({percentage.toFixed(1)}%)</title>
            </path>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', minHeight: '24px', marginTop: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
          r/{displayData[hoveredSubreddit !== null ? hoveredSubreddit : 0].name}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            <th style={{ paddingBottom: '8px', fontWeight: 'normal', textAlign: 'left' }}>Subreddit</th>
            <th style={{ paddingBottom: '8px', fontWeight: 'normal', textAlign: 'right' }}>Activity</th>
            <th style={{ paddingBottom: '8px', fontWeight: 'normal', textAlign: 'right' }}>Karma</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((sub, idx) => (
            <tr 
              key={idx}
              style={{ 
                opacity: hoveredSubreddit === null || hoveredSubreddit === idx ? 1 : 0.5,
                transition: 'opacity 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredSubreddit(idx)}
              onMouseLeave={() => setHoveredSubreddit(null)}
            >
              <td style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ backgroundColor: getRedShade(idx, displayData.length), width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '11px' }}>r/{sub.name}</span>
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: '11px', whiteSpace: 'nowrap' }}>{sub.count}</td>
              <td style={{ padding: '4px 0', textAlign: 'right', fontSize: '11px', whiteSpace: 'nowrap' }}>{sub.karma || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
