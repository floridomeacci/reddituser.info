import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function FriendsNetwork({ userData, style = {} }) {
  const [friendsData, setFriendsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract friend-related sentences using regex
  const friendSentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allContent = [
      ...(userData.comments || []).map(c => c.body || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].join(' ');

    // Regex patterns for friend/acquaintance mentions
    const friendPatterns = [
      /\b(my|our|his|her)\s+(friend|buddy|pal|mate|bestie|best friend|colleague|coworker|roommate|neighbor|acquaintance)\b[^.!?]*[.!?]/gi,
      /\b(friend|buddy|colleague|coworker|roommate)\s+(is|was|has|have|had|does|did|will|would|said|told|thinks?|believes?)[^.!?]*[.!?]/gi,
      /\bwith (a )?friend\b[^.!?]*[.!?]/gi,
      /\b(we|us|together)\s+(went|hang|hangout|met|meet|played|talked)[^.!?]*[.!?]/gi,
      /\b(social circle|close friends|group of friends|friendship)\b[^.!?]*[.!?]/gi
    ];

    const sentences = new Set();
    friendPatterns.forEach(pattern => {
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
    if (friendSentences.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;
        
        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Based on these sentences, identify friends, colleagues, and acquaintances. Return JSON with this structure: {"friends": [{"type": "friend/colleague/roommate", "name": "unknown", "context": "brief description"}], "socialLevel": "introverted/moderate/extroverted", "summary": "brief social overview"}. Sentences: ${friendSentences.join(' ')}`,
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
        setFriendsData(parsed);
      } catch (err) {
        setError(err.message);
        console.error('Friends Network AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [friendSentences, userData]);

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>Friends & Network</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (friendSentences.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>Friends & Network</h3>
        <p className="stat-meta">No social mentions detected</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '8px', padding: '24px 16px' }}>
          <div style={{ fontSize: '40px' }}>🛡️</div>
          <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>User keeps social circle private</div>
          <div style={{ color: COLORS.TEXT_MUTED, fontSize: '11px' }}>No friend or colleague references found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={style}>
      <h3>Friends & Network</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {friendsData && `${friendsData.friends?.length || 0} connections • ${friendsData.socialLevel || 'unknown'}`}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: '11px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.TEXT_MUTED }}>
            Processing {friendSentences.length} mentions...
          </div>
        ) : error ? (
          <div style={{ color: COLORS.ACCENT_PRIMARY, padding: '8px' }}>
            Failed to analyze social network
          </div>
        ) : friendsData ? (
          <>
            {friendsData.summary && (
              <div style={{ 
                background: 'rgba(255, 107, 107, 0.1)', 
                border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_LIGHT_GREY
              }}>
                {friendsData.summary}
              </div>
            )}
            
            {friendsData.friends && friendsData.friends.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {friendsData.friends.map((friend, idx) => (
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
                      {friend.type}
                      {friend.name && friend.name !== 'unknown' && ` (${friend.name})`}
                    </div>
                    {friend.context && (
                      <div style={{ marginTop: '4px', color: COLORS.TEXT_MUTED, fontSize: '10px' }}>
                        {friend.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', backgroundColor: 'rgba(74, 222, 128, 0.06)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛡️</div>
                <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>User keeps social circle private</div>
                <div style={{ color: COLORS.TEXT_MUTED, fontSize: '10px', marginTop: '4px' }}>No specific friends or colleagues identified</div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
