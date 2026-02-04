import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function QuestionsVsCommentary({ userData, style }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  const hasComments = userData.comments?.length > 0;
  const hasPosts = userData.posts?.length > 0;
  
  // Calculate question statistics
  const allTexts = [
    ...(userData?.comments || []).map(c => c.comment || c.body || ''),
    ...(userData?.posts || []).map(p => p.title || p.selftext || p.post || '')
  ];
  
  const textsWithQuestions = allTexts.filter(t => t.includes('?'));
  const questionRate = ((textsWithQuestions.length / allTexts.length) * 100).toFixed(1);
  
  // Use primary content source for visualization
  const contentSource = hasComments ? userData.comments : userData.posts;
  const contentType = hasComments ? 'comments' : 'posts';
  
  // Research-based insights
  const getQuestionInsight = () => {
    if (questionRate > 35) {
      return {
        text: 'High curiosity profile',
        detail: 'Research links frequent question-asking to openness, learning orientation, and collaborative problem-solving. Associated with growth mindset.',
        color: '#4a9eff'
      };
    } else if (questionRate > 20) {
      return {
        text: 'Balanced inquiry style',
        detail: 'Healthy mix of seeking and sharing knowledge. Typical of engaged community participants.',
        color: '#51cf66'
      };
    } else if (questionRate > 10) {
      return {
        text: 'Statement-focused communication',
        detail: 'More declarative style. May indicate expertise-sharing or opinion-based engagement.',
        color: '#ffd43b'
      };
    } else {
      return {
        text: 'Low question frequency',
        detail: 'Primarily assertive communication. Research suggests confidence in knowledge or preference for statements over inquiry.',
        color: '#ff6b6b'
      };
    }
  };
  
  const questionInsight = getQuestionInsight();
  
  const questionsVsCommentary = contentSource.slice(0, 100).map((item, idx) => {
    const text = hasComments ? (item.comment || item.body || '') : (item.title || item.selftext || item.body || '');
    
    const questionMarks = (text.match(/\?/g) || []).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    const questionRatio = sentences > 0 ? questionMarks / sentences : 0;
    
    let baseX;
    if (questionRatio > 0.5) {
      baseX = 0.05 + Math.random() * 0.35;
    } else if (questionRatio > 0) {
      baseX = 0.3 + Math.random() * 0.4;
    } else {
      baseX = 0.6 + Math.random() * 0.35;
    }
    
    const yJitter = (Math.random() - 0.5) * 8;
    
    return {
      id: idx,
      x: baseX,
      y: yJitter,
      karma: item.karma || item.score || 0,
      questionRatio: questionRatio,
      text: text.slice(0, 100),
      subreddit: item.subreddit,
      isQuestion: questionRatio > 0.5,
      isMixed: questionRatio > 0.2 && questionRatio < 0.8
    };
  });

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Questions VS Commentary {!hasComments && hasPosts ? '(posts)' : ''}</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {questionRate}% of content contains questions
      </p>
      <div style={{ height: 'calc(100% - 80px)', width: '100%', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '-15px',
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: '11px',
          fontWeight: '600',
          color: '#4a9eff',
          opacity: 0.5,
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          QUESTIONS
        </div>
        <div style={{
          position: 'absolute',
          right: '-15px',
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          fontSize: '11px',
          fontWeight: '600',
          color: '#ff6b6b',
          opacity: 0.5,
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          COMMENTARY
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[-0.1, 1.1]}
              hide={true}
            />
            <YAxis 
              type="number" 
              dataKey="y"
              domain={[-4.5, 4.5]}
              hide={true}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--spacing-xs)',
                      fontSize: 'var(--font-size-tiny)',
                      maxWidth: '200px'
                    }}>
                      <div className="stat-meta">Type: {data.isQuestion ? 'Question' : data.isMixed ? 'Mixed' : 'Commentary'}</div>
                      <div className="stat-meta">Karma: {data.karma}</div>
                      <div className="stat-meta">r/{data.subreddit}</div>
                      {data.text && (
                        <div className="stat-meta" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          "{data.text}..."
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter
              name="Questions"
              data={questionsVsCommentary.filter(d => d.x < 0.4)}
              fill="#4a9eff"
              fillOpacity={0.6}
            />
            <Scatter
              name="Mixed"
              data={questionsVsCommentary.filter(d => d.x >= 0.4 && d.x <= 0.6)}
              fill="#9b59b6"
              fillOpacity={0.6}
            />
            <Scatter
              name="Commentary"
              data={questionsVsCommentary.filter(d => d.x > 0.6)}
              fill="#ff6b6b"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
