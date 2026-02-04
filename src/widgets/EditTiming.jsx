import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Scatter, Customized } from 'recharts';
import { COLORS } from '../design-tokens';

const TYPE_COLORS = {
  post: {
    stem: 'rgba(147, 197, 253, 0.55)',
    body: 'rgba(147, 197, 253, 0.9)',
    origin: 'rgba(191, 219, 254, 0.95)',
    glow: 'rgba(59, 130, 246, 0.55)'
  },
  comment: {
    stem: 'rgba(239, 68, 68, 0.55)',
    body: 'rgba(239, 68, 68, 0.92)',
    origin: 'rgba(252, 165, 165, 0.95)',
    glow: 'rgba(220, 38, 38, 0.55)'
  }
};

export default function EditTiming({ userData, style = {} }) {
  const timingData = useMemo(() => {
    if (!userData) return null;

    const editedItems = [];
      const seenKeys = new Set();

      const getUniqueKey = (item, fallbackTs, prefix) => {
        return (
          item.id ||
          item.name ||
          item.permalink ||
          item.url ||
          `${prefix}-${item.subreddit || 'unknown'}-${fallbackTs}`
        );
      };
    
    // Process comments
    (userData.comments || []).forEach(c => {
      if (c.edited && typeof c.edited === 'number') {
        const created = c.created_utc || c.timestamp;
        const edited = c.edited;
        const timeDiff = (edited - created) / 60; // Convert to minutes
        
        if (timeDiff > 0 && timeDiff < 525600) { // Less than 1 year in minutes
            const key = getUniqueKey(c, created, 'comment');
            if (seenKeys.has(key)) return;
            seenKeys.add(key);

            editedItems.push({
            type: 'comment',
            timeDiff,
            subreddit: c.subreddit,
            created,
            edited,
            body: c.body || c.comment || '',
            bodyOriginal: c.body_original || c.body || c.comment || ''
          });
        }
      }
    });

    // Process posts
    (userData.posts || []).forEach(p => {
      if (p.edited && typeof p.edited === 'number') {
        const created = p.created_utc || p.timestamp;
        const edited = p.edited;
        const timeDiff = (edited - created) / 60; // Convert to minutes
        
        if (timeDiff > 0 && timeDiff < 525600) { // Less than 1 year in minutes
            const key = getUniqueKey(p, created, 'post');
            if (seenKeys.has(key)) return;
            seenKeys.add(key);

            editedItems.push({
            type: 'post',
            timeDiff,
            subreddit: p.subreddit,
            created,
            edited,
            body: p.selftext || p.body || p.title || '',
            bodyOriginal: p.selftext_original || p.selftext || p.body || p.title || ''
          });
        }
      }
    });

    if (editedItems.length === 0) {
      return { editedItems: [], avgTime: 0, medianTime: 0, stats: null };
    }

    // Calculate statistics
    const times = editedItems.map(e => e.timeDiff).sort((a, b) => a - b);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const medianTime = times[Math.floor(times.length / 2)];
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    // Categorize by time ranges
    const within5min = editedItems.filter(e => e.timeDiff <= 5).length;
    const within1hour = editedItems.filter(e => e.timeDiff <= 60).length;
    const within1day = editedItems.filter(e => e.timeDiff <= 1440).length;
    const within1week = editedItems.filter(e => e.timeDiff <= 10080).length;
    const beyond1week = editedItems.filter(e => e.timeDiff > 10080).length;

    // Interpretation
    let interpretation = '';
    let color = '';
    if (medianTime < 5) {
      interpretation = 'Immediate typo fixer';
      color = '#4ade80';
    } else if (medianTime < 60) {
      interpretation = 'Quick revisions';
      color = '#fbbf24';
    } else if (medianTime < 1440) {
      interpretation = 'Same-day editor';
      color = '#fb923c';
    } else {
      interpretation = 'Retrospective reviser';
      color = '#ef4444';
    }

    // Format for line chart - separate series for comments and posts
    // Filter outliers using IQR method
    const timeDiffs = editedItems.map(item => item.timeDiff).sort((a, b) => a - b);
    const q1Index = Math.floor(timeDiffs.length * 0.25);
    const q3Index = Math.floor(timeDiffs.length * 0.75);
    const q1 = timeDiffs[q1Index];
    const q3 = timeDiffs[q3Index];
    const iqr = q3 - q1;
    const lowerBound = Math.max(0, q1 - 1.5 * iqr);
    const upperBound = q3 + 1.5 * iqr;
    
    // Filter to remove outliers
    const filteredItems = editedItems.filter(item => 
      item.timeDiff >= lowerBound && item.timeDiff <= upperBound
    );

    const sortedItems = filteredItems.slice().sort((a, b) => a.created - b.created);
    const minCreated = sortedItems.length ? Math.min(...sortedItems.map(item => item.created)) : 0;
    const maxDuration = sortedItems.length ? Math.max(...sortedItems.map(item => item.timeDiff)) : 0;
    const axisMaxMinutes = Math.max(5, maxDuration * 1.15);

    const candleData = sortedItems.map((item, idx) => ({
      key: `${item.type}-${item.created}-${idx}`,
      index: idx,
      type: item.type,
      createdMs: item.created * 1000,
      editedMs: item.edited * 1000,
      durationMinutes: item.timeDiff,
      timelineStartMinutes: 0,
      timelineEndMinutes: item.timeDiff,
      subreddit: item.subreddit,
      body: item.body,
      bodyOriginal: item.bodyOriginal,
      createdLabel: new Date(item.created * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      editedLabel: new Date(item.edited * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      date: new Date(item.created * 1000).toLocaleDateString()
    }));

    return {
      editedItems,
      avgTime,
      medianTime,
      minTime,
      maxTime,
      within5min,
      within1hour,
      within1day,
      within1week,
      beyond1week,
      interpretation,
      color,
      candleData,
      minCreated,
      axisMaxMinutes
    };
  }, [userData]);

  const formatTime = (minutes) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
    if (minutes < 10080) return `${(minutes / 1440).toFixed(1)}d`;
    return `${(minutes / 10080).toFixed(1)}w`;
  };

  if (!userData || !timingData || timingData.editedItems.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Edit Timing</h3>
        <p className="stat-meta">Time between posting and editing</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '200px',
          color: COLORS.TEXT_MUTED,
          fontSize: '12px'
        }}>
          No edit timestamps available
        </div>
      </div>
    );
  }

  const formatTimelineTick = (minutes) => formatTime(minutes);

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Edit Timing</h3>
      <p className="stat-meta">
        Median: {formatTime(timingData.medianTime)} • Average: {formatTime(timingData.avgTime)} • Total: {timingData.editedItems.length} edits
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={timingData.candleData} margin={{ top: 5, right: 16, left: 40, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="createdMs"
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke={COLORS.TEXT_MUTED}
              style={{ fontSize: '9px' }}
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              label={{ value: 'Posted on', position: 'insideBottom', offset: -10, style: { fontSize: '9px', fill: COLORS.TEXT_MUTED } }}
            />
            <YAxis
              yAxisId="timeline"
              stroke={COLORS.TEXT_MUTED}
              style={{ fontSize: '9px' }}
              domain={[0, timingData.axisMaxMinutes]}
              tickFormatter={formatTimelineTick}
              label={{ value: 'Delay after post', angle: -90, position: 'insideLeft', style: { fontSize: '9px', fill: COLORS.TEXT_MUTED } }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;

                const displayText = (data.body || data.text || '').trim();
                const truncatedText = displayText.length > 480 ? `${displayText.slice(0, 477)}…` : displayText;

                return (
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.95)',
                      border: `1px solid ${COLORS.ACCENT_PRIMARY}`,
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '10px',
                      maxWidth: '420px',
                      color: COLORS.TEXT_PRIMARY
                    }}
                  >
                    <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>
                      {data.date} • r/{data.subreddit}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: COLORS.ACCENT_PRIMARY }}>Posted:</span> {data.createdLabel}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: COLORS.ACCENT_PRIMARY }}>Edited:</span> {data.editedLabel}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: COLORS.ACCENT_PRIMARY }}>Delay:</span> {formatTime(data.durationMinutes)}
                    </div>
                    {displayText && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ color: COLORS.ACCENT_PRIMARY, fontSize: '9px', marginBottom: '4px' }}>Comment text</div>
                        <div
                          style={{
                            background: 'rgba(148, 163, 184, 0.12)',
                            padding: '8px',
                            borderRadius: '4px',
                            borderLeft: `2px solid ${COLORS.ACCENT_PRIMARY}`,
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            color: 'rgba(226, 232, 240, 0.9)'
                          }}
                        >
                          {truncatedText || 'No text available'}
                        </div>
                        {displayText.length > 480 && (
                          <div style={{ marginTop: '4px', fontSize: '9px', color: 'rgba(226, 232, 240, 0.6)' }}>
                            Truncated to keep the tooltip compact.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Scatter
              yAxisId="timeline"
              dataKey="timelineEndMinutes"
              data={timingData.candleData}
              fill="transparent"
              shape={({ cx, cy }) => (
                <circle cx={cx} cy={cy} r={10} fill="rgba(0, 0, 0, 0)" stroke="rgba(0, 0, 0, 0)" />
              )}
              isAnimationActive={false}
            />
            <Customized component={<CandlestickLayer data={timingData.candleData} colors={TYPE_COLORS} />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CandlestickLayer({ data, colors, xAxisMap, yAxisMap, offset }) {
  if (!data?.length || !xAxisMap || !yAxisMap) {
    return null;
  }

  const xAxis = Object.values(xAxisMap)[0];
  const yAxis = yAxisMap.timeline || Object.values(yAxisMap)[0];
  if (!xAxis || !yAxis) {
    return null;
  }

  const offsetLeft = offset?.left ?? 0;
  const offsetTop = offset?.top ?? 0;

  return (
    <g>
      {data.map((entry) => {
        const palette = colors[entry.type] || colors.post;
        if (!palette) return null;

        const rawX = xAxis.scale(entry.createdMs);
        const startCoord = yAxis.scale(entry.timelineStartMinutes);
        const endCoord = yAxis.scale(entry.timelineEndMinutes);
        if ([rawX, startCoord, endCoord].some((value) => !Number.isFinite(value))) {
          return null;
        }

        const x = rawX + offsetLeft;
        const startY = startCoord + offsetTop;
        const endY = endCoord + offsetTop;
        const upper = Math.min(startY, endY);
        const lower = Math.max(startY, endY);
        const stemHeight = Math.max(lower - upper, 4);
        const bandSize = typeof xAxis.bandSize === 'number' && xAxis.bandSize > 0 ? xAxis.bandSize : 16;
        const candleWidth = Math.max(6, Math.min(14, bandSize * 0.6));
        const bodyHeight = Math.max(6, Math.min(14, stemHeight * 0.4));
        const bodyY = upper + stemHeight / 2 - bodyHeight / 2;

        return (
          <g key={entry.key}>
            <line
              x1={x}
              x2={x}
              y1={upper}
              y2={lower}
              stroke={palette.stem}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <rect
              x={x - candleWidth / 2}
              y={bodyY}
              width={candleWidth}
              height={bodyHeight}
              fill={palette.body}
              opacity={0.92}
              rx={Math.min(5, candleWidth / 3)}
              ry={Math.min(5, candleWidth / 3)}
            />
            <circle cx={x} cy={startY} r={2.6} fill={palette.origin} stroke={palette.glow} strokeWidth={1} fillOpacity={0.9} />
            <circle cx={x} cy={endY} r={3.3} fill={palette.body} stroke={palette.glow} strokeWidth={1} fillOpacity={0.95} />
          </g>
        );
      })}
    </g>
  );
}
