import { useMemo } from 'react';
import { getDataColor } from '../design-tokens';

export default function WordCloud({ comments }) {
  const wordData = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    
    // Combine all comments
    const allText = comments
      .map(c => c.comment || '')
      .join(' ')
      .toLowerCase();
    
    // Remove common words and count occurrences
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having', 'may', 'am']);
    
    const words = allText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
  }, [comments]);
  
  if (wordData.length === 0) return <p className="stat-meta">No data</p>;
  
  const maxCount = Math.max(...wordData.map(w => w.count));
  const minCount = Math.min(...wordData.map(w => w.count));
  
  const getFontSize = (count) => {
    if (maxCount === minCount) return 14;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 10 + normalized * 18;
  };
  
  const getOpacity = (count) => {
    if (maxCount === minCount) return 0.9;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.5 + normalized * 0.5;
  };
  
  // Arrange in alternating pattern to balance visually
  const arrangeInSpiral = (words) => {
    if (words.length === 0) return [];
    
    // Create a balanced arrangement by interleaving from both ends
    const result = [];
    let startIdx = 0;
    let endIdx = words.length - 1;
    let addToStart = false;
    
    while (startIdx <= endIdx) {
      if (addToStart) {
        result.unshift(words[startIdx]);
        startIdx++;
      } else {
        result.push(words[startIdx]);
        startIdx++;
      }
      addToStart = !addToStart;
    }
    
    return result;
  };
  
  const displayWords = arrangeInSpiral(wordData);
  
  return (
    <div className="word-cloud">
      {displayWords.map(({ word, count }, index) => (
        <span
          key={word}
          className="word-cloud-word"
          style={{
            fontSize: `${getFontSize(count)}px`,
            opacity: getOpacity(count),
            color: getDataColor(index % 10),
          }}
        >
          <span className="word-cloud-count">{count}</span>
          {word}
        </span>
      ))}
    </div>
  );
}
