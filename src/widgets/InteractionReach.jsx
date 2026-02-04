import { useMemo } from 'react';

const sanitizeName = (value) => {
  if (!value && value !== 0) return '';
  return String(value).trim();
};

const formatRelativeTime = (timestampInSeconds) => {
  if (!timestampInSeconds) return 'date unknown';
  const timestampMs = timestampInSeconds * 1000;
  const now = Date.now();
  const diffMs = timestampMs - now;
  const absDiffMs = Math.abs(diffMs);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  const formatLabel = (value, unit) => {
    const absVal = Math.round(Math.abs(value));
    const plural = absVal === 1 ? '' : 's';
    return `${absVal} ${unit}${plural} ${diffMs >= 0 ? 'from now' : 'ago'}`;
  };

  if (absDiffMs < minuteMs) return diffMs >= 0 ? 'in moments' : 'moments ago';
  if (absDiffMs < hourMs) return formatLabel(absDiffMs / minuteMs, 'minute');
  if (absDiffMs < dayMs) return formatLabel(absDiffMs / hourMs, 'hour');
  if (absDiffMs < weekMs) return formatLabel(absDiffMs / dayMs, 'day');
  if (absDiffMs < monthMs) return formatLabel(absDiffMs / weekMs, 'week');
  if (absDiffMs < yearMs) return formatLabel(absDiffMs / monthMs, 'month');
  return formatLabel(absDiffMs / yearMs, 'year');
};

export default function InteractionReach({ userData, style }) {
  const interactionData = useMemo(() => {
    const comments = userData?.comments || [];
    const posts = userData?.posts || [];
    const activities = [
      ...comments.map((comment) => ({ type: 'comment', data: comment })),
      ...posts.map((post) => ({ type: 'post', data: post })),
    ];

    if (!activities.length) {
      return {
        uniqueCount: 0,
        totalInteractions: 0,
        topTargets: [],
        recentTargets: [],
        selfInteractions: 0,
        ignoredInteractions: 0,
      };
    }

    const rawUsername =
      sanitizeName(userData?.username) ||
      sanitizeName(userData?.account_info?.username) ||
      sanitizeName(userData?.about?.name) ||
      '';
    const normalizedUsername = rawUsername.toLowerCase();
    const ignoredNames = new Set(['[deleted]', '[removed]']);
    const bucket = new Map();
    let totalInteractions = 0;
    let selfInteractions = 0;
    let ignoredInteractions = 0;

    const registerUserTarget = (rawTarget, timestamp) => {
      const label = sanitizeName(rawTarget);
      if (!label) {
        ignoredInteractions += 1;
        return;
      }

      const normalized = label.toLowerCase();
      if (!normalized || ignoredNames.has(normalized)) {
        ignoredInteractions += 1;
        return;
      }

      if (normalized === normalizedUsername) {
        selfInteractions += 1;
        return;
      }

      totalInteractions += 1;

      const key = `user:${normalized}`;
      const existing = bucket.get(key);
      if (existing) {
        existing.count += 1;
        if (timestamp) {
          if (!existing.latest || timestamp > existing.latest) existing.latest = timestamp;
          if (!existing.earliest || timestamp < existing.earliest) existing.earliest = timestamp;
        }
      } else {
        bucket.set(key, {
          name: label,
          count: 1,
          latest: timestamp || null,
          earliest: timestamp || null,
          origin: 'user',
        });
      }
    };

    activities.forEach(({ type, data }) => {
      const timestamp =
        data.timestamp || data.created_utc || data.createdAt || data.created || data.createdUTC || null;

      if (type === 'comment') {
        const candidateFields = [
          data.responding,
          data.parent_author,
          data.link_author,
          data.in_reply_to,
          data.replied_to,
          data.author_replied_to,
        ];
        const target = candidateFields.map(sanitizeName).find(Boolean);

        if (target) {
          registerUserTarget(target, timestamp);
        } else {
          ignoredInteractions += 1;
        }
      } else {
        const ownerCandidate =
          sanitizeName(data.author) ||
          sanitizeName(data.user) ||
          sanitizeName(data.poster) ||
          sanitizeName(data.original_poster) ||
          rawUsername ||
          '';

        if (ownerCandidate) {
          registerUserTarget(ownerCandidate, timestamp);
        } else {
          ignoredInteractions += 1;
        }
      }
    });

    const entries = Array.from(bucket.values());
    const uniqueCount = entries.length;

    const topTargets = entries
      .slice()
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return (b.latest || 0) - (a.latest || 0);
      })
      .slice(0, 6);

    const recentTargets = entries
      .filter((entry) => entry.latest)
      .sort((a, b) => (b.latest || 0) - (a.latest || 0))
      .slice(0, 4);

    return {
      uniqueCount,
      totalInteractions,
      topTargets,
      recentTargets,
      selfInteractions,
      ignoredInteractions,
    };
  }, [userData]);

  const maxCount = interactionData.topTargets[0]?.count || 1;
  const repeatInteractions = Math.max(0, interactionData.totalInteractions - interactionData.uniqueCount);
  const MAX_BAR_HEIGHT = 160;
  const uniqueBarHeight = interactionData.totalInteractions
    ? Math.round((interactionData.uniqueCount / interactionData.totalInteractions) * MAX_BAR_HEIGHT)
    : 0;
  const repeatBarHeight = interactionData.totalInteractions
    ? Math.round((repeatInteractions / interactionData.totalInteractions) * MAX_BAR_HEIGHT)
    : 0;

  const formatOrigin = (origin) => {
    switch (origin) {
      case 'user':
        return 'User';
      case 'subreddit':
        return 'Subreddit';
      case 'post':
        return 'Post';
      case 'thread':
        return 'Thread';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Interaction Reach</h3>
      <p className="stat-meta" style={{ marginBottom: '16px' }}>
        Tracking how every activity connects you with others
      </p>

      {interactionData.totalInteractions === 0 && interactionData.selfInteractions === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: 0.7,
          }}
        >
          <div style={{ fontSize: '34px' }}>🫂</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No activity captured yet</p>
          <p className="stat-meta" style={{ margin: 0 }}>
            Once you start posting or commenting, interactions will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100% - 60px)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '56px',
              padding: '18px 0 12px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  height: `${MAX_BAR_HEIGHT}px`,
                  width: '52px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    bottom: `${uniqueBarHeight}px`,
                    transform: 'translateY(-12px)',
                    color: '#ff6b6b',
                    fontSize: '18px',
                    fontWeight: 600,
                  }}
                >
                  {interactionData.uniqueCount}
                </span>
                <div
                  style={{
                    width: '52px',
                    height: `${Math.max(uniqueBarHeight, uniqueBarHeight > 0 ? 6 : 0)}px`,
                    background: '#d45a62',
                    borderRadius: '12px',
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Unique</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  height: `${MAX_BAR_HEIGHT}px`,
                  width: '52px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    bottom: `${repeatBarHeight}px`,
                    transform: 'translateY(-12px)',
                    color: '#ff6b6b',
                    fontSize: '18px',
                    fontWeight: 600,
                  }}
                >
                  {repeatInteractions}
                </span>
                <div
                  style={{
                    width: '52px',
                    height: `${Math.max(repeatBarHeight, repeatBarHeight > 0 ? 6 : 0)}px`,
                    background: '#ff6b6b',
                    borderRadius: '12px',
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Repeats</div>
            </div>
          </div>

          {(interactionData.selfInteractions > 0 || interactionData.ignoredInteractions > 0) && (
            <div className="stat-meta" style={{ textAlign: 'center' }}>
              {interactionData.selfInteractions > 0 && `Excluded ${interactionData.selfInteractions} self interactions`}
              {interactionData.ignoredInteractions > 0 && (
                interactionData.selfInteractions > 0 ? ` • Skipped ${interactionData.ignoredInteractions} unknown owners` : `Skipped ${interactionData.ignoredInteractions} unknown owners`
              )}
            </div>
          )}

          {interactionData.recentTargets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="stat-meta">Most recent interactions</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {interactionData.recentTargets.map((target) => (
                  <div
                    key={target.name}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255, 107, 107, 0.12)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <span>{target.name}</span>
                    <span className="stat-meta">{formatRelativeTime(target.latest)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            <span className="stat-meta">Top interaction targets</span>
            {interactionData.topTargets.map((target, index) => {
              const share = interactionData.totalInteractions
                ? Math.round((target.count / interactionData.totalInteractions) * 100)
                : 0;
              return (
                <div
                  key={target.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(255, 107, 107, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      #{index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{target.name}</div>
                      <div className="stat-meta">
                        {target.count} interactions ({share}%) • {formatOrigin(target.origin)} • last {formatRelativeTime(target.latest)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{target.count}</div>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(6, Math.round((target.count / maxCount) * 100))}%`,
                        background: '#ff6b6b',
                        height: '100%',
                        borderRadius: 'inherit',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
