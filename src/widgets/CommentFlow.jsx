import CommentFlowTree from '../components/CommentFlowTree';

export default function CommentFlow({ userData, style }) {
  if (!userData || !userData.comments?.length) return null;

  // Build hierarchical tree from sentence patterns
  const commentTreeData = (() => {
    const sentences = [];
    
    (userData?.comments || []).forEach(comment => {
      const text = comment.comment || comment.body || '';
      const commentSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      sentences.push(...commentSentences);
    });
    
    if (sentences.length === 0) return [];
    
    const fragmentsByRoot = {};
    sentences.forEach(sentence => {
      const words = sentence.trim().toLowerCase().split(/\s+/)
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length > 0);
      
      for (let i = 0; i < words.length - 1; i++) {
        const root = words[i];
        if (root.length < 2 && root !== 'i' && root !== 'a') continue;
        
        if (!fragmentsByRoot[root]) fragmentsByRoot[root] = [];
        fragmentsByRoot[root].push(words.slice(i));
      }
    });

    const scoredRoots = Object.entries(fragmentsByRoot)
      .filter(([root, list]) => list.length >= 5)
      .map(([root, list]) => {
        const uniqueNodes = new Set();
        list.forEach(words => {
          for (let k = 1; k <= 5; k++) {
            if (words[k]) uniqueNodes.add(`${k}_${words[k]}`);
          }
        });
        
        const score = uniqueNodes.size + (list.length * 0.05);
        return { root, score, list };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    if (scoredRoots.length === 0) return [];
    
    const allTrees = scoredRoots.map(({ root: starter, list: relevantSentences }) => {
      const rootId = 'tree_root';
      const treeData = [{
        id: rootId,
        parent: null,
        name: starter
      }];
      
      const processed = new Set();
      processed.add(rootId);
      
      const buildLevel = (parentId, parentWords, level) => {
        if (level > 50) return;
        
        const matching = relevantSentences.filter(words => {
          if (words.length <= level) return false;
          for (let i = 0; i < parentWords.length; i++) {
            if (words[i] !== parentWords[i]) return false;
          }
          return true;
        });
        
        if (matching.length === 0) return;
        
        const nextWords = {};
        matching.forEach(words => {
          const nextWord = words[level];
          if (!nextWords[nextWord]) nextWords[nextWord] = [];
          nextWords[nextWord].push(words);
        });
        
        let candidates = Object.entries(nextWords)
          .map(([word, sentences]) => ({ word, sentences, count: sentences.length }))
          .sort((a, b) => b.count - a.count);

        let sortedBranches = [];
        const strongBranches = candidates.filter(c => c.count > 1);
        
        if (strongBranches.length >= 3) {
          sortedBranches = strongBranches.slice(0, 8);
        } else {
          sortedBranches = [...strongBranches];
          const needed = 5 - sortedBranches.length;
          if (needed > 0) {
            const singletons = candidates.filter(c => c.count === 1).slice(0, needed);
            sortedBranches = [...sortedBranches, ...singletons];
          }
        }

        sortedBranches.forEach(({ word, sentences }) => {
          let currentPhrase = [word];
          let currentLevel = level;
          let currentSentences = sentences;
          
          while (true) {
            const nextLevel = currentLevel + 1;
            const anyEnded = currentSentences.some(s => s.length <= nextLevel);
            if (anyEnded) break;
            
            const nextWordCounts = {};
            currentSentences.forEach(s => {
              const w = s[nextLevel];
              nextWordCounts[w] = (nextWordCounts[w] || 0) + 1;
            });
            
            const significantNextWords = Object.entries(nextWordCounts)
              .filter(([, count]) => count > 1)
              .map(([w]) => w);
              
            if (significantNextWords.length > 1) break;
            
            if (significantNextWords.length === 0) {
              const uniqueNextWords = Object.keys(nextWordCounts);
              if (uniqueNextWords.length === 1) {
                const [onlyWord] = uniqueNextWords;
                currentPhrase.push(onlyWord);
                currentLevel = nextLevel;
                currentSentences = currentSentences.filter(s => s[nextLevel] === onlyWord);
                continue;
              }
              break;
            }

            const [nextWord] = significantNextWords;
            currentPhrase.push(nextWord);
            currentLevel = nextLevel;
            currentSentences = currentSentences.filter(s => s[nextLevel] === nextWord);
          }

          const nodeName = currentPhrase.join(' ');
          const nodeId = `${parentId}_${nodeName}_${level}`;
          
          if (!processed.has(nodeId)) {
            treeData.push({
              id: nodeId,
              parent: parentId,
              name: nodeName
            });
            processed.add(nodeId);
            
            buildLevel(nodeId, [...parentWords, ...currentPhrase], currentLevel + 1);
          }
        });
      };
      
      buildLevel(rootId, [starter], 1);
      
      return treeData;
    });
    
    return allTrees;
  })();

  // Hide widget if no meaningful patterns found
  if (!commentTreeData || commentTreeData.length === 0) return null;

  return (
    <div className="cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Comment Flow</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Most common sentence patterns showing word progression
      </p>
      <div style={{ height: 'calc(100% - 60px)', width: '100%' }}>
        <CommentFlowTree treeData={commentTreeData} />
      </div>
    </div>
  );
}
