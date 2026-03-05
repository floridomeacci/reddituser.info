import { useMemo } from 'react';
import { COLORS } from '../design-tokens';
import { extractTopics, extractEntities } from '../lib/browserML';

export default function TopicExtractor({ userData, style = {} }) {
  const { topics, entities } = useMemo(() => {
    if (!userData?.comments?.length && !userData?.posts?.length) {
      return { topics: [], entities: [] };
    }

    const texts = [
      ...(userData.comments || []).map(c => c.body || c.comment || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].filter(Boolean);

    return {
      topics: extractTopics(texts, 25),
      entities: extractEntities(texts, 10)
    };
  }, [userData]);

  if (!topics.length) return null;

  const maxCount = topics[0]?.count || 1;

  return (
    <div className="cell" style={style}>
      <h3>TOPIC CLOUD</h3>
      <p className="stat-meta">
        Top topics & entities extracted client-side
        <span style={{ marginLeft: 8, fontSize: '9px', color: COLORS.TEXT_MUTED }}>⚡ Browser ML</span>
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px'
        }}>
          {topics.map((t, i) => {
            const ratio = t.count / maxCount;
            const size = 10 + ratio * 22;
            const opacity = 0.4 + ratio * 0.6;
            return (
              <span
                key={i}
                title={`${t.word}: ${t.count} mentions`}
                style={{
                  fontSize: `${size}px`,
                  fontWeight: ratio > 0.5 ? 700 : 400,
                  color: COLORS.ACCENT_PRIMARY,
                  opacity,
                  cursor: 'default',
                  lineHeight: 1.2
                }}
              >
                {t.word}
              </span>
            );
          })}
        </div>

        {entities.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${COLORS.BORDER_DEFAULT}` }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: COLORS.TEXT_LIGHT_GREY, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Named Entities Detected
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {entities.map((e, i) => (
                <span
                  key={i}
                  style={{
                    padding: '2px 8px',
                    background: 'rgba(96, 165, 250, 0.15)',
                    border: `1px solid ${COLORS.DATA_6}40`,
                    borderRadius: '12px',
                    fontSize: '10px',
                    color: COLORS.DATA_6,
                    fontWeight: 500
                  }}
                >
                  {e.entity} <span style={{ opacity: 0.6 }}>×{e.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
