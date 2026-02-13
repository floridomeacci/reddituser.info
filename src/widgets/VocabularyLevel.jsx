import { useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function VocabularyLevel({ userData, style }) {
  const { ttr, wordCount, uniqueCount, label, pct } = useMemo(() => {
    if (!userData) return {};
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    const allItems = [...comments, ...posts];
    if (allItems.length < 5) return {};

    const allText = allItems.map(i => i.comment || i.body || i.title || i.selftext || '').join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(w => w.length > 2 && /^[a-z]+$/.test(w));
    if (words.length < 50) return {};
    
    // Use first 2000 words for fair comparison
    const sample = words.slice(0, 2000);
    const unique = new Set(sample).size;
    const ratio = (unique / sample.length) * 100;

    // Reddit average TTR is ~35-45% on a 2000-word sample
    const redditAvg = 40;
    let lbl = 'Average';
    if (ratio > 60) lbl = 'Exceptional';
    else if (ratio > 50) lbl = 'Very Rich';
    else if (ratio > 42) lbl = 'Above Average';
    else if (ratio > 35) lbl = 'Average';
    else lbl = 'Below Average';

    return { ttr: ratio, wordCount: sample.length, uniqueCount: unique, label: lbl, pct: Math.min(ratio / 70, 1) * 100 };
  }, [userData]);

  if (!ttr) return null;

  // Circular progress gauge
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  // Average marker
  const avgPct = (40 / 70) * 100;
  const avgAngle = (avgPct / 100) * 360 - 90;
  const avgRad = (avgAngle * Math.PI) / 180;
  const avgX = 70 + (radius + 10) * Math.cos(avgRad);
  const avgY = 70 + (radius + 10) * Math.sin(avgRad);

  return (
    <div className="cell" style={{ ...style }}>
      <h3>Vocabulary Level</h3>
      <p className="stat-meta">Unique word ratio vs Reddit avg (40%)</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Background circle */}
          <circle cx={70} cy={70} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
          {/* Progress */}
          <circle
            cx={70} cy={70} r={radius} fill="none"
            stroke={COLORS.ACCENT_PRIMARY}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,107,0.4))', transition: 'stroke-dashoffset 1s ease' }}
          />
          {/* Average marker dot */}
          <circle cx={avgX} cy={avgY} r={3} fill="rgba(255,255,255,0.5)" />
          <text x={avgX + 8} y={avgY + 3} fill="rgba(255,255,255,0.4)" fontSize={7}>avg</text>
          {/* Center */}
          <text x={70} y={64} textAnchor="middle" fill="#fff" fontSize={24} fontWeight="700">{ttr.toFixed(0)}%</text>
          <text x={70} y={80} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8}>{uniqueCount} unique</text>
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
