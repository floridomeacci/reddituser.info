import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

export default function ProfessionAnalysis({ userData, style = {} }) {
  const [professionData, setProfessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract work/profession-related sentences using regex
  const professionSentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allContent = [
      ...(userData.comments || []).map(c => c.body || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].join(' ');

    // Regex patterns for profession/work mentions
    const professionPatterns = [
      /\b(my|our|his|her|I'm a|I am a)\s+(job|work|career|profession|occupation|position|role|employer|company|business|office)\b[^.!?]*[.!?]/gi,
      /\b(work as|working as|employed as|hired as)\s+[^.!?]*[.!?]/gi,
      /\b(at work|at the office|at my job|during work|workplace|coworker|boss|manager|employee)\b[^.!?]*[.!?]/gi,
      /\b(I'm a|I am a)\s+[a-z]+\s+(engineer|developer|designer|teacher|doctor|nurse|lawyer|accountant|manager|consultant|analyst|technician|programmer|scientist|researcher|writer|artist|musician)\b[^.!?]*[.!?]/gi,
      /\b(salary|paycheck|income|wage|unemployed|hired|fired|promoted|quit|resignation)\b[^.!?]*[.!?]/gi,
      /\b(industry|company|corporation|startup|freelance|remote work|work from home)\b[^.!?]*[.!?]/gi
    ];

    const sentences = new Set();
    professionPatterns.forEach(pattern => {
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
    if (professionSentences.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;
        
        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Based on these sentences, identify profession and work details. Return JSON with this structure: {"profession": "job title", "industry": "industry sector", "employmentStatus": "employed/freelance/unemployed/student/retired", "workEnvironment": "office/remote/hybrid", "skills": ["skill1", "skill2"], "summary": "brief career overview"}. Sentences: ${professionSentences.join(' ')}`,
            sessionId: sessionId
          })
        });

        if (!response.ok) throw new Error('AI query failed');
        
        const data = await response.json();
        setProfessionData(data);
      } catch (err) {
        setError(err.message);
        console.error('Profession Analysis AI query error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [professionSentences, userData]);

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>Profession</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (professionSentences.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>Profession</h3>
        <p className="stat-meta">No work mentions detected</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: COLORS.TEXT_MUTED, fontSize: '11px' }}>
          No profession references found
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={style}>
      <h3>Profession</h3>
      <p className="stat-meta">
        {loading && '⏳ Analyzing...'}
        {error && `❌ ${error}`}
        {professionData && `${professionData.profession || 'Unknown'}`}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: '11px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.TEXT_MUTED }}>
            Processing {professionSentences.length} mentions...
          </div>
        ) : error ? (
          <div style={{ color: COLORS.ACCENT_PRIMARY, padding: '8px' }}>
            Failed to analyze profession
          </div>
        ) : professionData ? (
          <>
            {professionData.summary && (
              <div style={{ 
                background: 'rgba(167, 139, 250, 0.1)', 
                border: `1px solid rgba(167, 139, 250, 0.3)`,
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '10px',
                color: COLORS.TEXT_PRIMARY
              }}>
                {professionData.summary}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {professionData.industry && (
                <div style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '9px', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Industry
                  </div>
                  <div style={{ fontWeight: '600', color: COLORS.DATA_3 }}>
                    {professionData.industry}
                  </div>
                </div>
              )}

              {professionData.employmentStatus && (
                <div style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '9px', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Employment
                  </div>
                  <div style={{ fontWeight: '600', color: COLORS.DATA_4, textTransform: 'capitalize' }}>
                    {professionData.employmentStatus}
                    {professionData.workEnvironment && ` • ${professionData.workEnvironment}`}
                  </div>
                </div>
              )}

              {professionData.skills && professionData.skills.length > 0 && (
                <div style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '9px', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {professionData.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(167, 139, 250, 0.2)',
                          borderRadius: '12px',
                          fontSize: '9px',
                          color: '#A78BFA',
                          fontWeight: '500'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
