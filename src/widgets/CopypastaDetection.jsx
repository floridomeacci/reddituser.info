import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../design-tokens';

export default function CopypastaDetection({ userData, style = {} }) {
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'examples'

  const copypastaData = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return null;
    }

    const allContent = [
      ...(userData.comments || []).map(c => ({ 
        text: c.body || '', 
        type: 'comment', 
        id: c.id,
        subreddit: c.subreddit,
        karma: c.score || c.karma || 0,
        timestamp: c.created_utc || c.timestamp
      })),
      ...(userData.posts || []).map(p => ({ 
        text: (p.title || '') + ' ' + (p.selftext || ''), 
        type: 'post', 
        id: p.id,
        subreddit: p.subreddit,
        karma: p.score || p.karma || 0,
        timestamp: p.created_utc || p.timestamp
      }))
    ].filter(item => item.text.trim().length > 20); // Only analyze substantial content

    // Find repeated phrases (3+ words)
    const phraseMap = new Map();
    const minPhraseLength = 3;
    const minWordCount = 10; // Minimum words to consider as copypasta

    allContent.forEach(item => {
      // Clean text: remove URLs, code blocks, and common technical artifacts
      let cleanedText = item.text.toLowerCase()
        .replace(/https?:\/\/[^\s]+/g, ' ') // Remove URLs
        .replace(/www\.[^\s]+/g, ' ') // Remove www links
        .replace(/[a-z0-9]+\.(com|org|net|io|dev|github|reddit)[^\s]*/gi, ' ') // Remove domain names
        .replace(/`[^`]+`/g, ' ') // Remove inline code
        .replace(/```[\s\S]*?```/g, ' ') // Remove code blocks
        .replace(/\b[a-z]+\/[a-z]+\b/g, ' ') // Remove paths like r/subreddit
        .replace(/[^\w\s]/g, ' ')
        .replace(/\b\w{1,2}\b/g, ' '); // Remove 1-2 letter words
      
      const words = cleanedText
        .split(/\s+/)
        .filter(w => w.length > 2);

      // Skip if too few words after cleaning
      if (words.length < minPhraseLength) return;

      // Extract phrases of different lengths
      for (let len = minPhraseLength; len <= Math.min(15, words.length); len++) {
        for (let i = 0; i <= words.length - len; i++) {
          const phrase = words.slice(i, i + len).join(' ');
          
          // Additional filtering: skip phrases that are too generic or technical
          const genericTerms = ['http', 'https', 'www', 'com', 'org', 'github', 'reddit', 'edit', 'delete', 'click', 'link', 'source', 'permalink'];
          const hasGenericTerm = genericTerms.some(term => phrase.includes(term));
          
          if (phrase.split(' ').length >= minPhraseLength && !hasGenericTerm) {
            if (!phraseMap.has(phrase)) {
              phraseMap.set(phrase, { count: 0, items: [], wordCount: len });
            }
            const entry = phraseMap.get(phrase);
            if (!entry.items.some(existing => existing.id === item.id)) {
              entry.count++;
              entry.items.push(item);
            }
          }
        }
      }
    });

    // Filter to repeated phrases only
    const repeatedPhrases = Array.from(phraseMap.entries())
      .filter(([phrase, data]) => data.count >= 2 && data.wordCount >= minWordCount)
      .map(([phrase, data]) => {
        // Truncate at word boundary, not mid-word
        let displayPhrase = phrase;
        if (phrase.length > 80) {
          const words = phrase.split(' ');
          let truncated = '';
          for (const word of words) {
            if ((truncated + word).length > 80) break;
            truncated += (truncated ? ' ' : '') + word;
          }
          displayPhrase = truncated + '...';
        }
        
        return {
          phrase: displayPhrase,
          fullPhrase: phrase,
          count: data.count,
          wordCount: data.wordCount,
          items: data.items
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate self-similarity score
    const calculateSimilarity = (text1, text2) => {
      const words1 = new Set(text1.toLowerCase().split(/\s+/));
      const words2 = new Set(text2.toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter(w => words2.has(w)));
      const union = new Set([...words1, ...words2]);
      return union.size > 0 ? intersection.size / union.size : 0;
    };

    let totalSimilarity = 0;
    let comparisons = 0;
    const sampleSize = Math.min(50, allContent.length); // Sample to avoid performance issues
    
    for (let i = 0; i < sampleSize; i++) {
      for (let j = i + 1; j < sampleSize; j++) {
        totalSimilarity += calculateSimilarity(allContent[i].text, allContent[j].text);
        comparisons++;
      }
    }

    const avgSimilarity = comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;

    // Find signature phrases (frequently used short phrases)
    const signaturePhrases = Array.from(phraseMap.entries())
      .filter(([phrase, data]) => data.count >= 3 && data.wordCount >= 3 && data.wordCount <= 8)
      .map(([phrase, data]) => ({
        phrase,
        count: data.count,
        percentage: (data.count / allContent.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Interpretation
    let interpretation = '';
    let color = COLORS.DATA_5;

    if (avgSimilarity > 40) {
      interpretation = 'High self-repetition';
      color = COLORS.ACCENT_PRIMARY;
    } else if (avgSimilarity > 25) {
      interpretation = 'Moderate consistency';
      color = COLORS.DATA_3;
    } else {
      interpretation = 'Diverse writing';
      color = COLORS.DATA_5;
    }

    return {
      repeatedPhrases,
      avgSimilarity,
      signaturePhrases,
      totalContent: allContent.length,
      interpretation,
      color
    };
  }, [userData]);

  if (!copypastaData) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Copypasta Detection</h3>
        <p className="stat-meta">No content available for analysis</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '200px',
          color: COLORS.TEXT_MUTED,
          fontSize: '12px'
        }}>
          No content to analyze
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Copypasta Detection</h3>
      
      <p className="stat-meta" style={{ marginBottom: '12px' }}>
        Self-similarity: {copypastaData.avgSimilarity.toFixed(1)}% • {copypastaData.interpretation}
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
        {/* Signature Phrases Cloud */}
        {copypastaData.signaturePhrases.length > 0 ? (
          <>
            <div style={{ 
              fontSize: '9px', 
              color: COLORS.TEXT_MUTED, 
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Signature Phrases
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
                  {copypastaData.signaturePhrases.map((sig, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 16px',
                        background: `rgba(255, 107, 107, ${0.15 + (sig.percentage / 100) * 0.4})`,
                        border: `1px solid rgba(255, 107, 107, ${0.3 + (sig.percentage / 100) * 0.5})`,
                        borderRadius: '16px',
                        fontSize: `${10 + Math.min(sig.count, 8)}px`,
                        color: '#fff',
                        fontWeight: '500',
                        cursor: 'default',
                        transition: 'all 0.2s'
                      }}
                      title={`Used ${sig.count} times (${sig.percentage.toFixed(1)}% of content)`}
                    >
                      {sig.phrase}
                    </div>
                  ))}
                </div>
              </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flex: 1,
            color: COLORS.TEXT_MUTED,
            fontSize: '11px'
          }}>
            No signature phrases detected
          </div>
        )}
      </div>
    </div>
  );
}
