import { useMemo } from 'react';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_NIGHT = 15; // % between midnight-6am

export default function NightOwlScore({ userData, style }) {
  const { nightPct, ratio, label } = useMemo(() => {
    if (!userData) return {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    if (allItems.length < 10) return {};

    const nightCount = allItems.filter(i => {
      const h = new Date((i.created_utc || 0) * 1000).getHours();
      return h >= 0 && h < 6;
    }).length;
    const pct = (nightCount / allItems.length) * 100;
    const r = pct / REDDIT_AVG_NIGHT;
    
    let lbl = 'Average';
    if (r > 3) lbl = 'Extreme Night Owl';
    else if (r > 2) lbl = 'Night Owl';
    else if (r > 1.3) lbl = 'Slightly Nocturnal';
    else if (r > 0.7) lbl = 'Average';
    else lbl = 'Early Bird';

    return { nightPct: pct, ratio: r, label: lbl };
  }, [userData]);

  if (!nightPct && nightPct !== 0) return null;

  // Moon-themed radial gauge 
  const gaugeAngle = Math.min(nightPct / 50, 1) * 270; // 50% = full
  const radius = 55;
  const cx = 70, cy = 70;

  const describeArc = (startAngle, endAngle) => {
    const start = ((startAngle - 90) * Math.PI) / 180;
    const end = ((endAngle - 90) * Math.PI) / 180;
    const sx = cx + radius * Math.cos(start);
    const sy = cy + radius * Math.sin(start);
    const ex = cx + radius * Math.cos(end);
    const ey = cy + radius * Math.sin(end);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`;
  };

  // Average marker angle
  const avgAngle = (REDDIT_AVG_NIGHT / 50) * 270;

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Night Owl Score</h3>
      <p className="stat-meta">Activity between midnight - 6am</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Background arc */}
          <path d={describeArc(0, 270)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} strokeLinecap="round" />
          {/* Value arc */}
          {gaugeAngle > 0 && (
            <path d={describeArc(0, gaugeAngle)} fill="none" 
              stroke={nightPct > 25 ? '#a78bfa' : COLORS.ACCENT_PRIMARY} 
              strokeWidth={12} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${nightPct > 25 ? 'rgba(167,139,250,0.5)' : 'rgba(255,107,107,0.4)'})` }}
            />
          )}
          {/* Average marker */}
          {(() => {
            const a = ((avgAngle - 90) * Math.PI) / 180;
            const mx = cx + (radius + 12) * Math.cos(a);
            const my = cy + (radius + 12) * Math.sin(a);
            return (
              <>
                <circle cx={mx} cy={my} r={2.5} fill="rgba(255,255,255,0.4)" />
                <text x={mx + 6} y={my + 3} fill="rgba(255,255,255,0.35)" fontSize={7}>avg</text>
              </>
            );
          })()}
          {/* Center content */}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10}>🌙</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#fff" fontSize={22} fontWeight="700">{nightPct.toFixed(0)}%</text>
          <text x={cx} y={cy + 25} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8}>at night</text>
        </svg>
        <div style={{ 
          fontSize: 12, fontWeight: 600, 
          color: nightPct > 25 ? '#a78bfa' : COLORS.ACCENT_PRIMARY,
          marginTop: 2,
          padding: '2px 10px',
          background: nightPct > 25 ? 'rgba(167,139,250,0.1)' : 'rgba(255,107,107,0.1)',
          borderRadius: 12,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
