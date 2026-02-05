import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function FamilyTree({ userData, style = {} }) {
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract family-related sentences using regex
  const familySentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allContent = [
      ...(userData.comments || []).map(c => c.body || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].join(' ');

    // Regex patterns for family mentions
    const familyPatterns = [
      /\b(my|our|his|her)\s+(mom|mother|dad|father|parent|son|daughter|child|kid|brother|sister|sibling|grandmother|grandfather|grandma|grandpa|aunt|uncle|cousin|nephew|niece|family|wife|husband|spouse)\b[^.!?]*[.!?]/gi,
      /\b(mom|mother|dad|father|parent|son|daughter|brother|sister|sibling|family)\s+(is|was|has|have|had|does|did|will|would|said|told|thinks?|believes?)[^.!?]*[.!?]/gi,
      /\bmy\s+family\b[^.!?]*[.!?]/gi,
      /\b(raised|grew up|childhood|growing up)\b[^.!?]*[.!?]/gi,
      /\b(inherit(ed)?|passed down|family tradition)\b[^.!?]*[.!?]/gi
    ];

    const sentences = new Set();
    familyPatterns.forEach(pattern => {
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

    return Array.from(sentences).slice(0, 50); // Limit to 50 most relevant
  }, [userData]);

  // Query AI endpoint
  useEffect(() => {
    if (familySentences.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;
        
        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Based on these sentences, identify family members mentioned and their relationships. Return JSON with this structure: {"members": [{"relation": "mother", "name": "unknown", "details": "brief description"}], "familySize": "small/medium/large", "summary": "brief family overview"}. Sentences: ${familySentences.join(' ')}`,
            sessionId: sessionId
          })
        });

        if (!response.ok) throw new Error('AI query failed');
        
        const raw = await response.json();
        // n8n returns [{"output": "JSON string"}] - unwrap it
        let parsed = raw;
        if (Array.isArray(raw) && raw[0]?.output) {
          try { parsed = JSON.parse(raw[0].output); } catch (e) { parsed = raw[0].output; }
        } else if (typeof raw === 'string') {
          try { parsed = JSON.parse(raw); } catch (e) { /* keep as-is */ }
        }
        setFamilyData(parsed);
      } catch (err) {
        setError(err.message);
        console.error('Family Tree AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [familySentences, userData]);

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>Family Tree</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (familySentences.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>Family Tree</h3>
        <p className="stat-meta">No family mentions detected</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: COLORS.TEXT_MUTED, fontSize: '11px' }}>
          No family references found
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={style}>
      <h3>Family Tree</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {familyData && `${familyData.members?.length || 0} members • ${familyData.familySize || 'unknown'}`}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: '11px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.TEXT_MUTED }}>
            Processing {familySentences.length} mentions...
          </div>
        ) : error ? (
          <div style={{ color: COLORS.ACCENT_PRIMARY, padding: '8px' }}>
            Failed to analyze family data
          </div>
        ) : familyData ? (
          <>
            {familyData.summary && (
              <div style={{ 
                background: 'rgba(255, 107, 107, 0.1)', 
                border: `1px solid rgba(255, 107, 107, 0.3)`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_PRIMARY
              }}>
                {familyData.summary}
              </div>
            )}
            
            {familyData.members && familyData.members.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {familyData.members.map((member, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: `3px solid ${COLORS.ACCENT_PRIMARY}`,
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: COLORS.ACCENT_PRIMARY, textTransform: 'capitalize' }}>
                      {member.relation}
                      {member.name && member.name !== 'unknown' && ` (${member.name})`}
                    </div>
                    {member.details && (
                      <div style={{ marginTop: '4px', color: COLORS.TEXT_MUTED, fontSize: '10px' }}>
                        {member.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: COLORS.TEXT_MUTED, padding: '8px' }}>
                No specific family members identified
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
