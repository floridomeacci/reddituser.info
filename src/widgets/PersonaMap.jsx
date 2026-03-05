import { useState, useMemo } from 'react';
import { COLORS } from '../design-tokens';
import { extractMonthlyFeatures, gruEncode, pca, tsne, hasWebGPU } from '../lib/neuralUtils';

export default function PersonaMap({ userData, style = {} }) {
  const [method, setMethod] = useState('PCA');
  const [hovered, setHovered] = useState(null);

  // 1. Extract 12 features per month
  const monthlyData = useMemo(() => {
    if (!userData?.comments?.length) return null;
    const features = extractMonthlyFeatures(userData);
    return features.length >= 4 ? features : null;
  }, [userData]);

  // 2. GRU encode → dimensionality reduction
  const { points, xRange, yRange } = useMemo(() => {
    if (!monthlyData) return { points: [], xRange: [0, 1], yRange: [0, 1] };

    const normalized = monthlyData.map(m => m.normalized);
    const inputSize = normalized[0].length;   // 12
    const hiddenSize = 8;

    // Reservoir computing: fixed-weight GRU → hidden states carry temporal memory
    const hiddenStates = gruEncode(normalized, inputSize, hiddenSize);

    // Project to 2D
    let projected;
    if (method === 'PCA') {
      projected = pca(hiddenStates, 2);
    } else {
      const perp = Math.min(10, Math.max(2, Math.floor(hiddenStates.length / 4)));
      projected = tsne(hiddenStates, 2, perp, 300, 50);
    }

    // Compute ranges with padding
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const [x, y] of projected) {
      if (x < xMin) xMin = x; if (x > xMax) xMax = x;
      if (y < yMin) yMin = y; if (y > yMax) yMax = y;
    }
    const xPad = (xMax - xMin) * 0.12 || 1;
    const yPad = (yMax - yMin) * 0.12 || 1;
    xMin -= xPad; xMax += xPad;
    yMin -= yPad; yMax += yPad;

    const pts = projected.map(([x, y], i) => ({
      x, y,
      month: monthlyData[i].month,
      label: new Date(monthlyData[i].month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      meta: monthlyData[i].meta,
      idx: i,
    }));

    return { points: pts, xRange: [xMin, xMax], yRange: [yMin, yMax] };
  }, [monthlyData, method]);

  if (!monthlyData || points.length < 4) return null;

  // SVG layout
  const margin = { top: 16, right: 16, bottom: 26, left: 32 };
  const W = 320, H = 260;
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const sx = (v) => margin.left + ((v - xRange[0]) / (xRange[1] - xRange[0])) * plotW;
  const sy = (v) => margin.top + plotH - ((v - yRange[0]) / (yRange[1] - yRange[0])) * plotH;

  // Path
  const pathD = 'M ' + points.map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' L ');

  // Mid-point arrow
  const midIdx = Math.floor(points.length / 2);
  const arrowAngle = points.length > 2
    ? Math.atan2(
        sy(points[midIdx].y) - sy(points[midIdx - 1].y),
        sx(points[midIdx].x) - sx(points[midIdx - 1].x)
      ) * 180 / Math.PI
    : 0;

  const dimLabel = method === 'PCA' ? ['PC1', 'PC2'] : ['Dim 1', 'Dim 2'];
  const gpuReady = hasWebGPU();

  return (
    <div className="cell" style={style}>
      <h3>PERSONA MAP</h3>
      <p className="stat-meta">
        {monthlyData.length} months · GRU(8) →{' '}
        <span
          style={{
            cursor: 'pointer',
            color: COLORS.ACCENT_PRIMARY,
            fontWeight: 600,
            borderBottom: `1px dashed ${COLORS.ACCENT_PRIMARY}`,
          }}
          onClick={() => setMethod(m => (m === 'PCA' ? 't-SNE' : 'PCA'))}
          title="Click to toggle projection method"
        >
          {method}
        </span>
        {gpuReady && (
          <span style={{ color: COLORS.DATA_2, marginLeft: 6, fontSize: '9px' }}>WebGPU ✓</span>
        )}
      </p>

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient along trajectory: translucent → solid red */}
            <linearGradient
              id="personaTrailGrad"
              gradientUnits="userSpaceOnUse"
              x1={sx(points[0].x)} y1={sy(points[0].y)}
              x2={sx(points[points.length - 1].x)} y2={sy(points[points.length - 1].y)}
            >
              <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity="0.15" />
              <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity="0.9" />
            </linearGradient>

            {/* Glow filter for hovered dot */}
            <filter id="pmGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => {
            const gx = margin.left + plotW * frac;
            const gy = margin.top + plotH * frac;
            return (
              <g key={frac}>
                <line x1={gx} y1={margin.top} x2={gx} y2={margin.top + plotH}
                  stroke={COLORS.BORDER_DEFAULT} strokeWidth="0.5" strokeDasharray="2 4" />
                <line x1={margin.left} y1={gy} x2={margin.left + plotW} y2={gy}
                  stroke={COLORS.BORDER_DEFAULT} strokeWidth="0.5" strokeDasharray="2 4" />
              </g>
            );
          })}

          {/* Axes */}
          <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH}
            stroke={COLORS.BORDER_DEFAULT} strokeWidth="1" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH}
            stroke={COLORS.BORDER_DEFAULT} strokeWidth="1" />

          {/* Axis labels */}
          <text x={margin.left + plotW / 2} y={H - 3} fill={COLORS.TEXT_MUTED} fontSize="8" textAnchor="middle" fontFamily="monospace">
            {dimLabel[0]} →
          </text>
          <text x={10} y={margin.top + plotH / 2} fill={COLORS.TEXT_MUTED} fontSize="8" textAnchor="middle" fontFamily="monospace"
            transform={`rotate(-90, 10, ${margin.top + plotH / 2})`}>
            {dimLabel[1]} →
          </text>

          {/* Trajectory path */}
          <path d={pathD} fill="none" stroke="url(#personaTrailGrad)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Direction arrow at midpoint */}
          {points.length > 2 && (
            <polygon
              points="-5,-3.5 5,0 -5,3.5"
              fill={COLORS.ACCENT_PRIMARY}
              fillOpacity="0.65"
              transform={`translate(${sx(points[midIdx].x).toFixed(1)},${sy(points[midIdx].y).toFixed(1)}) rotate(${arrowAngle.toFixed(1)})`}
            />
          )}

          {/* Data points */}
          {points.map((p, i) => {
            const opacity = 0.15 + 0.85 * (i / (points.length - 1));
            const baseR = 2.5 + (p.meta.total > 50 ? 2 : p.meta.total > 20 ? 1 : 0);
            const isH = hovered === i;
            const cx = sx(p.x), cy = sy(p.y);
            return (
              <g key={i}>
                <circle
                  cx={cx} cy={cy}
                  r={isH ? baseR + 3 : baseR}
                  fill={COLORS.ACCENT_PRIMARY}
                  fillOpacity={isH ? 1 : opacity}
                  stroke={isH ? '#fff' : COLORS.ACCENT_PRIMARY}
                  strokeWidth={isH ? 1.5 : 0.5}
                  filter={isH ? 'url(#pmGlow)' : undefined}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* "START" label on first point */}
                {i === 0 && (
                  <text x={cx} y={cy - 9} fill={COLORS.TEXT_MUTED} fontSize="7" textAnchor="middle" fontWeight="500">
                    START
                  </text>
                )}
                {/* "NOW" label on last point */}
                {i === points.length - 1 && (
                  <text x={cx} y={cy - 9} fill={COLORS.ACCENT_PRIMARY} fontSize="7.5" textAnchor="middle" fontWeight="700">
                    NOW
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip (fixed top-right) */}
        {hovered !== null && (
          <div style={{
            position: 'absolute',
            top: 6, right: 6,
            background: 'rgba(10,10,20,0.92)',
            border: `1px solid ${COLORS.BORDER_DEFAULT}`,
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: '9px',
            color: COLORS.TEXT_LIGHT_GREY,
            pointerEvents: 'none',
            minWidth: 110,
            zIndex: 5,
            lineHeight: 1.5,
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: COLORS.ACCENT_PRIMARY, marginBottom: 3 }}>
              {points[hovered].label}
            </div>
            <div>📝 {points[hovered].meta.comments} comments · {points[hovered].meta.posts} posts</div>
            <div>⭐ Avg karma: {points[hovered].meta.avgScore}</div>
            <div>🗂 {points[hovered].meta.subreddits} subreddits</div>
            <div>💬 Sentiment: {points[hovered].meta.sentiment}</div>
            <div>🌶️ Toxicity: {points[hovered].meta.toxicity}</div>
          </div>
        )}
      </div>
    </div>
  );
}
