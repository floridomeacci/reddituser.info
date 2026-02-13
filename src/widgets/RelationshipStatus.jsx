import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function RelationshipStatus({ userData, style = {} }) {
  const [relationshipData, setRelationshipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if backend already stored relationship data
  const storedRelationship = userData?.relationship;
  const isStoredUnknown = storedRelationship && (
    !storedRelationship.flair ||
    storedRelationship.flair.toLowerCase() === 'unknown' ||
    storedRelationship.flair.toLowerCase().includes('unknown')
  );

  // Extract relationship-related sentences using regex
  const relationshipSentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allContent = [
      ...(userData.comments || []).map(c => c.body || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].join(' ');

    // Regex patterns for relationship mentions
    const relationshipPatterns = [
      /\b(my|our|his|her)\s+(wife|husband|spouse|partner|girlfriend|boyfriend|fiancé|fiancée|SO|significant other|ex|relationship)\b[^.!?]*[.!?]/gi,
      /\b(married|single|dating|engaged|divorced|separated|widowed)\b[^.!?]*[.!?]/gi,
      /\b(we('re| are)?\s+(married|dating|together|engaged))\b[^.!?]*[.!?]/gi,
      /\b(wedding|marriage|anniversary|proposal|honeymoon)\b[^.!?]*[.!?]/gi,
      /\b(relationship|romance|romantic|love|dating|crush)\b[^.!?]*[.!?]/gi,
      /\b(got (married|engaged|divorced))\b[^.!?]*[.!?]/gi
    ];

    const sentences = new Set();
    relationshipPatterns.forEach(pattern => {
      const matches = allContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim();
          if (cleaned.length > 20 && cleaned.length < 300) {
            sentences.add(cleaned);
          }
        });
      }
    });

    return Array.from(sentences).slice(0, 50);
  }, [userData, storedRelationship]);

  // Use stored data if available
  useEffect(() => {
    if (storedRelationship && !isStoredUnknown) {
      setRelationshipData({
        status: storedRelationship.flair,
        partner: storedRelationship.partnerType ? { type: storedRelationship.partnerType } : null,
        summary: storedRelationship.summary,
        confidence: storedRelationship.confidence,
      });
    }
  }, [storedRelationship, isStoredUnknown]);

  // Query AI endpoint (only if no stored data)
  useEffect(() => {
    if (storedRelationship) return; // skip AI if backend already analyzed
    if (relationshipSentences.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;
        
        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Based on these sentences, determine relationship status. Return JSON with this structure: {"status": "single/dating/married/engaged/divorced/complicated/unknown", "partner": {"type": "wife/husband/girlfriend/boyfriend", "duration": "years together if mentioned"}, "history": "brief relationship history", "summary": "brief overview"}. Sentences: ${relationshipSentences.join(' ')}`,
            sessionId: sessionId
          })
        });

        if (!response.ok) throw new Error('AI query failed');
        
        const raw = await response.json();
        let parsed = raw;
        if (Array.isArray(raw) && raw[0]?.output) {
          try { parsed = JSON.parse(raw[0].output); } catch (e) { parsed = raw[0].output; }
        } else if (typeof raw === 'string') {
          try { parsed = JSON.parse(raw); } catch (e) { /* keep as-is */ }
        }
        setRelationshipData(parsed);
      } catch (err) {
        setError(err.message);
        console.error('Relationship Status AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [relationshipSentences, userData, storedRelationship]);

  // Privacy shield component
  const PrivacyShield = ({ label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', padding: '32px 16px' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <div style={{ color: '#4ade80', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>{label}</div>
    </div>
  );

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>Relationship Status</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  // Show privacy shield if stored data says Unknown OR no sentences found and no stored data
  if (isStoredUnknown || (!storedRelationship && relationshipSentences.length === 0)) {
    return (
      <div className="cell" style={style}>
        <h3>Relationship Status</h3>
        <PrivacyShield label="User keeps relationship status private" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (!status || status.toLowerCase() === 'unknown') return COLORS.TEXT_MUTED;
    return COLORS.ACCENT_PRIMARY;
  };

  return (
    <div className="cell" style={style}>
      <h3>Relationship Status</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {relationshipData && (
          <span style={{ color: getStatusColor(relationshipData.status) }}>
            {(() => {
              const status = relationshipData.status || 'Unknown';
              const confidence = relationshipData.confidence;
              if (confidence && confidence > 0 && confidence <= 1) {
                const pct = Math.round(confidence * 100);
                return `${status} (${pct}%)`;
              }
              return status;
            })()}
          </span>
        )}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: '11px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.TEXT_MUTED }}>
            Processing {relationshipSentences.length} mentions...
          </div>
        ) : error ? (
          <div style={{ color: COLORS.ACCENT_PRIMARY, padding: '8px' }}>
            Failed to analyze relationship status
          </div>
        ) : relationshipData ? (
          <>
            {relationshipData.summary && (
              <div style={{ 
                background: 'rgba(255, 107, 107, 0.1)', 
                border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_LIGHT_GREY
              }}>
                {relationshipData.summary}
              </div>
            )}
            
            {relationshipData.partner && (
              <div style={{
                padding: '10px',
                background: 'rgba(255, 107, 107, 0.08)',
                borderRadius: '6px',
                marginBottom: '12px'
              }}>
                <div style={{ fontWeight: '600', color: getStatusColor(relationshipData.status), marginBottom: '6px', textTransform: 'capitalize' }}>
                  {relationshipData.partner.type || 'Partner'}
                </div>
                {relationshipData.partner.duration && (
                  <div style={{ color: COLORS.TEXT_MUTED, fontSize: '10px' }}>
                    {relationshipData.partner.duration}
                  </div>
                )}
              </div>
            )}

            {relationshipData.history && (
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '4px',
                fontSize: '10px',
                color: COLORS.TEXT_MUTED
              }}>
                <div style={{ fontWeight: '600', color: COLORS.TEXT_WHITE, marginBottom: '4px' }}>
                  History
                </div>
                {relationshipData.history}
              </div>
            )}

            {/* Evidence sentences */}
            {relationshipSentences.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Evidence
                </div>
                {relationshipSentences.slice(0, 6).map((sentence, i) => (
                  <div key={i} style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: COLORS.TEXT_SECONDARY,
                    lineHeight: '1.3',
                    borderLeft: '2px solid rgba(255,107,107,0.3)'
                  }}>
                    "{sentence}"
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
