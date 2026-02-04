import { useMemo, useState } from 'react';

const fmt = (value) => value.toFixed(2);

function getISOWeekMeta(date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
  const weekStart = new Date(utcDate);
  weekStart.setUTCDate(utcDate.getUTCDate() - 3);
  weekStart.setUTCHours(0, 0, 0, 0);
  return { year: utcDate.getUTCFullYear(), week, start: weekStart };
}

function formatWeekLabel(meta) {
  const shortYear = String(meta.year).slice(-2);
  return `W${String(meta.week).padStart(2, '0')} '${shortYear}`;
}

function getWeekKey(meta) {
  return `${meta.year}-W${String(meta.week).padStart(2, '0')}`;
}

function createSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M${fmt(x)},${fmt(y)}`;
  }

  let path = `M${fmt(points[0][0])},${fmt(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    path += ` C${fmt(cp1x)},${fmt(cp1y)} ${fmt(cp2x)},${fmt(cp2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
  }
  return path;
}

export default function LifetimeActivity({ userData, style }) {
  const comments = userData?.comments || [];
  const posts = userData?.posts || [];
  const [timeRange, setTimeRange] = useState([0, 100]);

  const fullTimeline = useMemo(() => {
    if (!comments.length && !posts.length) return [];

    const weeks = new Map();

    const accumulate = (items, field) => {
      items.forEach((item) => {
        const ts = item.timestamp || item.created_utc;
        if (!ts) return;
        const meta = getISOWeekMeta(new Date(ts * 1000));
        const key = getWeekKey(meta);
        if (!weeks.has(key)) {
          weeks.set(key, {
            key,
            label: formatWeekLabel(meta),
            start: meta.start,
            comments: 0,
            posts: 0,
          });
        }
        weeks.get(key)[field]++;
      });
    };

    accumulate(comments, 'comments');
    accumulate(posts, 'posts');

    if (weeks.size === 0) return [];

    const sorted = Array.from(weeks.values()).sort((a, b) => a.start - b.start);
    const buckets = [];

    const cursor = new Date(sorted[0].start);
    const final = new Date(sorted[sorted.length - 1].start);

    while (cursor <= final) {
      const meta = getISOWeekMeta(new Date(cursor));
      const key = getWeekKey(meta);
      const existing = weeks.get(key);
      buckets.push(
        existing || {
          key,
          label: formatWeekLabel(meta),
          start: new Date(meta.start),
          comments: 0,
          posts: 0,
        }
      );
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    return buckets;
  }, [comments, posts]);

  const visibleTimeline = useMemo(() => {
    if (!fullTimeline.length) return [];
    if (fullTimeline.length === 1) return fullTimeline;

    const total = fullTimeline.length;
    const startIdx = Math.min(total - 1, Math.floor((timeRange[0] / 100) * (total - 1)));
    const rawEndIdx = Math.ceil((timeRange[1] / 100) * total);
    const endIdx = Math.min(total, Math.max(startIdx + 1, rawEndIdx));
    return fullTimeline.slice(startIdx, endIdx);
  }, [fullTimeline, timeRange]);

  if (!visibleTimeline.length) return null;

  const totals = visibleTimeline.reduce(
    (acc, bucket) => {
      acc.comments += bucket.comments;
      acc.posts += bucket.posts;
      return acc;
    },
    { comments: 0, posts: 0 }
  );

  const chartWidth = 900;
  const chartHeight = 220;
  const margin = { top: 24, right: 24, bottom: 48, left: 56 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const maxValue = Math.max(
    1,
    ...visibleTimeline.map((bucket) => Math.max(bucket.comments, bucket.posts))
  );

  const tickStep = Math.max(1, Math.ceil(maxValue / 4));
  const yTicks = [];
  for (let value = 0; value <= maxValue; value += tickStep) {
    yTicks.push(value);
  }
  if (yTicks[yTicks.length - 1] !== maxValue) {
    yTicks.push(maxValue);
  }

  const getX = (index) => {
    if (visibleTimeline.length === 1) {
      return margin.left + innerWidth / 2;
    }
    const ratio = index / (visibleTimeline.length - 1);
    return margin.left + ratio * innerWidth;
  };

  const getY = (value) => {
    const ratio = value / maxValue;
    return margin.top + (1 - ratio) * innerHeight;
  };

  const buildPath = (field) => {
    const points = visibleTimeline.map((bucket, idx) => [getX(idx), getY(bucket[field])]);
    return createSmoothPath(points);
  };

  const axisLabelIndexes = (() => {
    if (visibleTimeline.length <= 6) return visibleTimeline.map((_, idx) => idx);
    const quarters = [0, Math.round((visibleTimeline.length - 1) * 0.33), Math.round((visibleTimeline.length - 1) * 0.66), visibleTimeline.length - 1];
    return Array.from(new Set(quarters.map((idx) => Math.min(idx, visibleTimeline.length - 1))));
  })();

  const startLabel = visibleTimeline[0]?.label;
  const endLabel = visibleTimeline[visibleTimeline.length - 1]?.label;
  const selectedStartDate = visibleTimeline[0]?.start || null;
  const selectedEndDate = visibleTimeline[visibleTimeline.length - 1]?.start || null;
  const selectedEndDisplay = selectedEndDate ? new Date(selectedEndDate.getTime() + 6 * 86400000) : null;

  const selectedStartLabel = selectedStartDate ? selectedStartDate.toLocaleDateString() : '—';
  const selectedEndLabel = selectedEndDisplay ? selectedEndDisplay.toLocaleDateString() : '—';

  const handleLowerChange = (event) => {
    const nextLower = parseInt(event.target.value, 10);
    setTimeRange(([_, upper]) => [Math.min(nextLower, upper - 1), upper]);
  };

  const handleUpperChange = (event) => {
    const nextUpper = parseInt(event.target.value, 10);
    setTimeRange(([lower]) => [lower, Math.max(nextUpper, lower + 1)]);
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 4', gridRow: 'span 2', position: 'relative', ...style }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 44,
          width: '210px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
          zIndex: 2,
        }}
      >
        <span style={{ color: 'rgba(255, 255, 255, 0.58)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Timeline
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)' }}>
            <span>{selectedStartLabel}</span>
            <span>{selectedEndLabel}</span>
          </div>
          <div style={{ position: 'relative', height: '30px', width: '100%', pointerEvents: 'auto' }}>
            <style>{`
              .lifetime-range-slider {
                position: absolute;
                width: 100%;
                pointer-events: none;
                -webkit-appearance: none;
                appearance: none;
                background: #666;
                outline: none;
                height: 1px;
              }
              .lifetime-range-slider::-webkit-slider-track {
                background: #666;
                height: 1px;
                border-radius: 0;
              }
              .lifetime-range-slider::-moz-range-track {
                background: #666;
                height: 1px;
                border-radius: 0;
              }
              .lifetime-range-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: #ff6b6b;
                cursor: pointer;
                border-radius: 50%;
                pointer-events: auto;
                position: relative;
                z-index: 100;
                box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.9);
              }
              .lifetime-range-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: #ff6b6b;
                cursor: pointer;
                border-radius: 50%;
                border: none;
                pointer-events: auto;
                position: relative;
                z-index: 100;
                box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.9);
              }
            `}</style>
            <input
              type="range"
              min="0"
              max="100"
              value={timeRange[0]}
              onChange={handleLowerChange}
              className="lifetime-range-slider"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={timeRange[1]}
              onChange={handleUpperChange}
              className="lifetime-range-slider"
            />
          </div>
        </div>
      </div>
      <h3>Lifetime activity</h3>
      <p className="stat-meta" style={{ marginBottom: '12px' }}>
        Weekly counts from {startLabel} through {endLabel}
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255, 107, 107, 0.7)', boxShadow: '0 0 0 1px rgba(255, 107, 107, 0.4)' }}></span>
          <span>{totals.comments.toLocaleString()} comments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.45)', boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.25)' }}></span>
          <span>{totals.posts.toLocaleString()} posts</span>
        </div>
      </div>

      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Timeline of weekly reddit activity counts"
      >
        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="rgba(255, 255, 255, 0.02)"
          rx="8"
        />

        {yTicks.map((value) => {
          const y = getY(value);
          return (
            <g key={`grid-${value}`}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + innerWidth}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={value === 0 ? 1.2 : 0.8}
                strokeDasharray={value === 0 ? '0' : '4 6'}
              />
              <text
                x={margin.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="rgba(255, 255, 255, 0.45)"
              >
                {value}
              </text>
            </g>
          );
        })}

        {visibleTimeline.map((bucket, idx) => {
          const x = getX(idx);
          const isQuarter = idx % 13 === 0; // roughly quarterly cue for typical year
          return (
            <line
              key={`week-stem-${bucket.key}`}
              x1={x}
              y1={margin.top + innerHeight}
              x2={x}
              y2={margin.top + innerHeight + (isQuarter ? 14 : 8)}
              stroke={isQuarter ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.14)'}
              strokeWidth={isQuarter ? 1 : 0.7}
            />
          );
        })}

        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={margin.left + innerWidth}
          y2={margin.top + innerHeight}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {axisLabelIndexes.map((idx) => {
          const x = getX(idx);
          return (
            <g key={`tick-${idx}`}>
              <line
                x1={x}
                y1={margin.top + innerHeight}
                x2={x}
                y2={margin.top + innerHeight + 6}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={margin.top + innerHeight + 24}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(255, 255, 255, 0.6)"
              >
                {visibleTimeline[idx].label}
              </text>
            </g>
          );
        })}

        <path
          d={buildPath('comments')}
          fill="none"
          stroke="rgba(255, 107, 107, 0.7)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path
          d={buildPath('posts')}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <text
          x={margin.left}
          y={margin.top - 8}
          fontSize="11"
          fill="rgba(255, 255, 255, 0.55)"
        >
          Activity count per week
        </text>
        <text
          x={margin.left + innerWidth}
          y={margin.top + innerHeight + 36}
          fontSize="11"
          fill="rgba(255, 255, 255, 0.55)"
          textAnchor="end"
        >
          Timeline covers {visibleTimeline.length} week{visibleTimeline.length === 1 ? '' : 's'}
        </text>
      </svg>
    </div>
  );
}
