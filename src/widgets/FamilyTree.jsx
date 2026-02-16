import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function FamilyTree({ userData, style = {} }) {
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic family relations that apply to everyone — filter these out
  const GENERIC_RELATIONS = /^(mother|mom|father|dad|parents?|grandma|grandpa|grandmother|grandfather|grandparents?)$/i;

  // Check if backend already stored family data
  const storedFamily = userData?.family;
  const isStoredUnknown = storedFamily && (
    !storedFamily.flairs ||
    storedFamily.flairs.length === 0 ||
    (storedFamily.flairs.length === 1 && storedFamily.flairs[0]?.toLowerCase?.()?.includes('unknown'))
  );

  // Extract family-related sentences using regex
  const familySentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allItems = [
      ...(userData.comments || []).map(c => ({
        text: c.body || c.comment || '',
        sub: c.subreddit,
        permalink: c.permalink || c.link_permalink,
        created: c.created_utc || c.timestamp
      })),
      ...(userData.posts || []).map(p => ({
        text: `${p.title || ''} ${p.selftext || ''}`,
        sub: p.subreddit,
        permalink: p.permalink,
        created: p.created_utc || p.timestamp
      }))
    ];

    // Regex patterns for family mentions
    const familyPatterns = [
      /\b(my|our|his|her)\s+(mom|mother|dad|father|parent|son|daughter|child|kid|brother|sister|sibling|grandmother|grandfather|grandma|grandpa|aunt|uncle|cousin|nephew|niece|family|wife|husband|spouse)\b[^.!?]*[.!?]/gi,
      /\b(mom|mother|dad|father|parent|son|daughter|brother|sister|sibling|family)\s+(is|was|has|have|had|does|did|will|would|said|told|thinks?|believes?)\s+[^.!?]*[.!?]/gi,
      /\bmy\s+family\b[^.!?]*[.!?]/gi,
      /\b(raised|grew up|childhood|growing up)\b[^.!?]*[.!?]/gi,
      /\b(inherit(ed)?|passed down|family tradition)\b[^.!?]*[.!?]/gi
    ];

    const results = [];
    const seen = new Set();

    allItems.forEach(({ text, sub, permalink, created }) => {
      if (!text || text.length < 10) return;
      familyPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.trim();
            if (cleaned.length > 20 && cleaned.length < 300) {
              const key = cleaned.substring(0, 80).toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                results.push({ text: cleaned, subreddit: sub, permalink, created });
              }
            }
          });
        }
      });
    });

    return results.slice(0, 50);
  }, [userData, storedFamily]);

  // Use stored data if available
  useEffect(() => {
    if (storedFamily && !isStoredUnknown) {
      // Convert stored flairs to member objects, filtering out generic relations
      const members = (storedFamily.flairs || [])
        .filter(flair => !GENERIC_RELATIONS.test(flair.trim()))
        .map(flair => ({
          relation: flair,
          name: 'unknown',
          details: ''
        }));
      setFamilyData({
        members,
        familySize: storedFamily.familySize || (members.length <= 2 ? 'small' : members.length <= 5 ? 'medium' : 'large'),
        summary: storedFamily.summary,
        confidence: storedFamily.confidence,
      });
    }
  }, [storedFamily, isStoredUnknown]);

  // Query AI endpoint (only if no stored data)
  useEffect(() => {
    if (storedFamily) return; // skip AI if backend already analyzed
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
        let parsed = raw;
        if (Array.isArray(raw) && raw[0]?.output) {
          try { parsed = JSON.parse(raw[0].output); } catch (e) { parsed = raw[0].output; }
        } else if (typeof raw === 'string') {
          try { parsed = JSON.parse(raw); } catch (e) { /* keep as-is */ }
        }
        // Filter out generic family relations from AI response
        if (parsed && parsed.members) {
          parsed.members = parsed.members.filter(m => !GENERIC_RELATIONS.test((m.relation || '').trim()));
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
  }, [familySentences, userData, storedFamily]);

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
        <h3>Family Tree</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  // Show privacy shield if stored data says Unknown OR no sentences found and no stored data
  if (isStoredUnknown || (!storedFamily && familySentences.length === 0)) {
    return (
      <div className="cell" style={style}>
        <h3>Family Tree</h3>
        <PrivacyShield label="User keeps family info private" />
      </div>
    );
  }

  return (
    <div className="cell" style={style}>
      <h3>Family Tree</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {familyData && (() => {
          const memberCount = familyData.members?.length || 0;
          const familySize = familyData.familySize || 'unknown';
          const confidence = familyData.confidence;
          let text = `${memberCount} members • ${familySize}`;
          if (confidence && confidence > 0 && confidence <= 1) {
            const pct = Math.round(confidence * 100);
            text += ` (${pct}%)`;
          }
          return text;
        })()}
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
                border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_LIGHT_GREY
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
            ) : null}

            {/* Evidence sentences */}
            {familySentences.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Evidence
                </div>
                {familySentences.slice(0, 6).map((item, i) => (
                  <a key={i} href={item.permalink ? `https://reddit.com${item.permalink}` : '#'}
                     target="_blank" rel="noopener noreferrer"
                     style={{ textDecoration: 'none', display: 'block', marginBottom: '4px', color: 'inherit' }}>
                    <div style={{
                      padding: '6px 8px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: COLORS.TEXT_SECONDARY,
                      lineHeight: '1.3',
                      borderLeft: '2px solid rgba(255,107,107,0.3)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '8px', color: COLORS.ACCENT_PRIMARY, fontWeight: '600' }}>
                          r/{item.subreddit || '?'}
                        </span>
                        <span style={{ fontSize: '8px', color: COLORS.TEXT_MUTED }}>
                          {item.created ? new Date(item.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div>"{typeof item === 'string' ? item : item.text}"</div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {(!familyData.members || familyData.members.length === 0) && familySentences.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: '12px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <div style={{ color: '#4ade80', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>User keeps family info private</div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
