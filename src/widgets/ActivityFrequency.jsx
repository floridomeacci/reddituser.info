import { useMemo } from 'react';
import { COLORS } from '../design-tokens';

const REDDIT_AVG_ACTIVITY = 0.5; // posts+comments per day

export default function ActivityFrequency({ userData, style }) {
  const { activityPerDay, ratio, label } = useMemo(() => {
    if (!userData) return {};
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    const allItems = [...comments, ...posts];
    if (allItems.length < 3) return {};

    const timestamps = allItems.map(i => i.created_utc || 0).filter(t => t > 0);
    if (timestamps.length < 2) return {};
    const minT = Math.min(...timestamps);
    const maxT = Math.max(...timestamps);
    const daySpan = Math.max((maxT - minT) / 86400, 1);
    const perDay = allItems.length / daySpan;
    const r = perDay / REDDIT_AVG_ACTIVITY;
    
    let lbl = 'Average';
    if (r > 5) lbl = 'Power User';
    else if (r > 2) lbl = 'Very Active';
    else if (r > 1.2) lbl = 'Above Average';
    else if (r > 0.8) lbl = 'Average';
    else if (r > 0.3) lbl = 'Below Average';
    else lbl = 'Casual';

    return { activityPerDay: perDay, ratio: r, label: lbl };
  }, [userData]);

  if (!activityPerDay) return null;

  // SVG gauge
  const angle = Math.min(ratio / 5, 1) * 180; // max 5x avg = full gauge
  const gaugeR = 70;
  const cx = 90, cy = 85;

  const polarToCart = (a, r) => ({
    x: cx + r * Math.cos((Math.PI / 180) * (180 - a)),
    y: cy - r * Math.sin((Math.PI / 180) * (180 - a)),
  });

  const startP = polarToCart(0, gaugeR);
  const endP = polarToCart(angle, gaugeR);
  const avgP = polarToCart(36, gaugeR + 8); // 1x = 36deg out of 180

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Activity Rate</h3>
      <p className="stat-meta">Posts + comments per day</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <svg viewBox="0 0 180 110" style={{ width: '100%', maxWidth: 200 }}>
          {/* Background arc */}
          <path
            d={`M ${polarToCart(0, gaugeR).x} ${polarToCart(0, gaugeR).y} A ${gaugeR} ${gaugeR} 0 0 1 ${polarToCart(180, gaugeR).x} ${polarToCart(180, gaugeR).y}`}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${startP.x} ${startP.y} A ${gaugeR} ${gaugeR} 0 ${angle > 90 ? 1 : 0} 1 ${endP.x} ${endP.y}`}
            fill="none" stroke={COLORS.ACCENT_PRIMARY} strokeWidth={14} strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,107,0.4))' }}
          />
          {/* Average marker */}
          <line x1={avgP.x} y1={avgP.y} x2={polarToCart(36, gaugeR - 8).x} y2={polarToCart(36, gaugeR - 8).y} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
          <text x={avgP.x} y={avgP.y - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={7}>avg</text>
          {/* Center value */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize={22} fontWeight="700">
            {activityPerDay.toFixed(1)}
          </text>
          <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8}>/day</text>
        </svg>
        <div style={{ 
          fontSize: 12, fontWeight: 600, 
          color: COLORS.ACCENT_PRIMARY,
          marginTop: 4,
          padding: '2px 10px',
          background: 'rgba(255,107,107,0.1)',
          borderRadius: 12,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
