import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function RelationshipStatus({ userData, style = {} }) {
  const [relationshipData, setRelationshipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [userData]);

  // Query AI endpoint
  useEffect(() => {
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
        
        const data = await response.json();
        setRelationshipData(data);
      } catch (err) {
        setError(err.message);
        console.error('Relationship Status AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [relationshipSentences, userData]);

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>Relationship Status</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (relationshipSentences.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>Relationship Status</h3>
        <p className="stat-meta">No relationship mentions</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: COLORS.TEXT_MUTED, fontSize: '11px' }}>
          No relationship references found
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      married: COLORS.DATA_5,
      engaged: COLORS.DATA_3,
      dating: COLORS.ACCENT_PRIMARY,
      single: COLORS.DATA_2,
      divorced: COLORS.DATA_4,
      complicated: '#FF9500',
      unknown: COLORS.TEXT_MUTED
    };
    return colors[status?.toLowerCase()] || COLORS.TEXT_MUTED;
  };

  return (
    <div className="cell" style={style}>
      <h3>Relationship Status</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {relationshipData && (
          <span style={{ color: getStatusColor(relationshipData.status) }}>
            {relationshipData.status || 'Unknown'}
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
                background: 'rgba(255, 193, 107, 0.1)', 
                border: `1px solid rgba(255, 193, 107, 0.3)`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_PRIMARY
              }}>
                {relationshipData.summary}
              </div>
            )}
            
            {relationshipData.partner && (
              <div style={{
                padding: '10px',
                background: `rgba(${getStatusColor(relationshipData.status) === COLORS.DATA_5 ? '107, 255, 193' : '255, 107, 107'}, 0.08)`,
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
                <div style={{ fontWeight: '600', color: COLORS.TEXT_PRIMARY, marginBottom: '4px' }}>
                  History
                </div>
                {relationshipData.history}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
