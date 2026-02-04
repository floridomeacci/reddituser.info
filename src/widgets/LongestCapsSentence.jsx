export default function LongestCapsSentence({ userData, style }) {
  const longestCapsSentence = (() => {
    const allComments = (userData?.comments || []).map(c => c.comment || c.body || '');
    let longest = '';
    
    allComments.forEach(comment => {
      const sentences = comment.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      
      sentences.forEach(sentence => {
        const lettersOnly = sentence.replace(/[^a-zA-Z]/g, '');
        if (lettersOnly.length > 0 && lettersOnly === lettersOnly.toUpperCase()) {
          if (sentence.length > longest.length) {
            longest = sentence;
          }
        }
      });
    });
    
    return longest || 'No all-caps sentences found';
  })();

  // Hide widget if no caps sentences found
  if (longestCapsSentence === 'No all-caps sentences found') return null;

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Longest ALL CAPS Sentence</h3>
      <p className="stat-meta" style={{ marginBottom: '8px', fontSize: '0.9em', opacity: 0.7 }}>
        Most intense moment
      </p>
      <p style={{ 
        fontSize: '0.95em', 
        lineHeight: '1.4',
        color: '#00ff7f',
        fontWeight: '500',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        "{longestCapsSentence}"
      </p>
      <p className="stat-label" style={{ marginTop: '8px', fontSize: '0.85em', opacity: 0.6 }}>
        {longestCapsSentence !== 'No all-caps sentences found' ? `${longestCapsSentence.length} characters` : ''}
      </p>
    </div>
  );
}
