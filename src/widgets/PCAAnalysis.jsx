import { useState, useMemo, useEffect } from 'react';
import { PCA } from 'ml-pca';
import { COLORS } from '../design-tokens';
import { analyzeLanguages, getLanguageName } from '../lib/languageUtils';

export default function PCAAnalysis({ userData, style }) {
  const [contentType, setContentType] = useState('both'); // 'comments', 'posts', 'both'
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  // Filter userData based on contentType
  const filteredUserData = useMemo(() => {
    if (!userData) return null;
    if (contentType === 'comments') return { ...userData, posts: [] };
    if (contentType === 'posts') return { ...userData, comments: [] };
    return userData;
  }, [userData, contentType]);
  
  const allItems = useMemo(() => {
    if (contentType === 'comments') return filteredUserData?.comments || [];
    if (contentType === 'posts') return filteredUserData?.posts || [];
    return [...(filteredUserData?.comments || []), ...(filteredUserData?.posts || [])];
  }, [filteredUserData, contentType]);

  // Use shared language analysis (cached)
  const langAnalysis = useMemo(() => {
    try {
      return analyzeLanguages(filteredUserData);
    } catch (e) {
      console.error('Language analysis error:', e);
      return { languageData: [], dominantLanguage: 'eng', totalItems: 0, itemsWithLanguage: [] };
    }
  }, [filteredUserData]);

  const cleanText = (text) => {
    return text.toLowerCase()
      .replace(/\b(removed|deleted)\b/g, '') // Remove 'removed' and 'deleted' words
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  const extractTrigrams = (text) => {
    const trigrams = [];
    for (let i = 0; i < text.length - 2; i++) {
      trigrams.push(text.substring(i, i + 3));
    }
    return trigrams;
  };

  // Use language data from shared analysis
  const languageData = langAnalysis.languageData?.filter(l => l.percentage >= 3) || [];
  const dominantLanguage = langAnalysis.dominantLanguage;
  const totalItems = langAnalysis.totalItems || 0;

  const colorPalette = [COLORS.DATA_1, COLORS.DATA_2, COLORS.DATA_3, COLORS.DATA_4, COLORS.DATA_5];
  const languageColors = {};
  languageData.forEach((lang, i) => {
    languageColors[getLanguageName(lang.code)] = colorPalette[i % colorPalette.length];
  });

  // Collect chunks with language labels (use pre-computed language from shared analysis)
  const chunks = useMemo(() => {
    if (!langAnalysis.itemsWithLanguage || langAnalysis.itemsWithLanguage.length === 0) return [];
    
    const result = [];
    langAnalysis.itemsWithLanguage.forEach(item => {
      const rawText = item.body || item.comment || item.title || item.selftext || '';
      const text = cleanText(rawText);
      if (text.length > 50) {
        let itemLang = item._detectedLanguage;
        const langPercentage = languageData.find(l => l.code === itemLang)?.percentage || 0;
        if (langPercentage < 5) itemLang = dominantLanguage;
        for (let i = 0; i < text.length; i += 400) {
          const chunk = text.substring(i, i + 400);
          if (chunk.length >= 100) {
            result.push({ text: chunk, language: itemLang, item });
          }
        }
      }
    });
    return result;
  }, [langAnalysis.itemsWithLanguage, languageData, dominantLanguage]);

  // Get time range from ALL items first (not just chunks)
  const allTimes = allItems.map(item => item.timestamp).filter(t => t);
  const minTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
  const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : 1;

  // Sort chunks by timestamp to get chronological representation
  const sortedChunks = useMemo(() => {
    return [...chunks].sort((a, b) => (a.item.timestamp || 0) - (b.item.timestamp || 0));
  }, [chunks]);
  
  // Sample evenly across time to get representative coverage
  const limitedChunks = useMemo(() => {
    if (sortedChunks.length <= 100) return sortedChunks;
    return sortedChunks.filter((_, i) => i % Math.ceil(sortedChunks.length / 100) === 0).slice(0, 100);
  }, [sortedChunks]);

  // Initialize slider to full time range
  useEffect(() => {
    if (startTime === null && minTime > 0 && maxTime > minTime) {
      setStartTime(minTime);
      setEndTime(maxTime);
    }
  }, [minTime, maxTime, startTime]);

  // Build trigram vocabulary and run PCA (memoized to prevent recalculation)
  const basePoints = useMemo(() => {
    if (totalItems === 0 || !limitedChunks || limitedChunks.length < 5) return [];
    
    const trigramSet = new Set();
    limitedChunks.forEach(chunk => {
      extractTrigrams(chunk.text).forEach(tri => trigramSet.add(tri));
    });
    const vocabulary = Array.from(trigramSet).slice(0, 500);
    const vocabMap = {};
    vocabulary.forEach((tri, idx) => vocabMap[tri] = idx);

    // Create feature vectors
    const vectors = limitedChunks.map(chunk => {
      const vector = new Array(vocabulary.length).fill(0);
      const trigrams = extractTrigrams(chunk.text);
      trigrams.forEach(tri => {
        if (vocabMap[tri] !== undefined) vector[vocabMap[tri]]++;
      });
      const sum = vector.reduce((a, b) => a + b, 0);
      return sum > 0 ? vector.map(v => v / sum) : vector;
    });

    try {
      const pca = new PCA(vectors);
      const projected = pca.predict(vectors, { nComponents: 2 });
      const pcaData = projected.data || projected.to2DArray();

      const xVals = pcaData.map(p => p[0]);
      const yVals = pcaData.map(p => p[1]);
      const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
      const yMin = Math.min(...yVals), yMax = Math.max(...yVals);
      const xRange = xMax - xMin || 1;
      const yRange = yMax - yMin || 1;

      return pcaData.map((p, i) => ({
        x: ((p[0] - xMin) / xRange) * 70 + 15,
        y: ((p[1] - yMin) / yRange) * 70 + 15,
        rawX: p[0],
        rawY: p[1],
        chunk: limitedChunks[i]
      }));
    } catch (error) {
      console.error('PCA error:', error);
      return [];
    }
  }, [limitedChunks]);

  // Calculate clustering metrics
  const clusteringMetrics = useMemo(() => {
    if (!basePoints || basePoints.length < 3) return null;
    
    // Calculate all pairwise distances
    const distances = [];
    for (let i = 0; i < basePoints.length; i++) {
      for (let j = i + 1; j < basePoints.length; j++) {
        const dx = basePoints[i].rawX - basePoints[j].rawX;
        const dy = basePoints[i].rawY - basePoints[j].rawY;
        distances.push(Math.sqrt(dx * dx + dy * dy));
      }
    }
    
    // Calculate average and std dev
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate the maximum possible distance (diagonal of the space)
    const xVals = basePoints.map(p => p.rawX);
    const yVals = basePoints.map(p => p.rawY);
    const xRange = Math.max(...xVals) - Math.min(...xVals);
    const yRange = Math.max(...yVals) - Math.min(...yVals);
    const maxPossibleDist = Math.sqrt(xRange * xRange + yRange * yRange);
    
    // Normalize average distance by maximum possible distance
    // Lower normalized distance = tighter clusters = more consistent
    const normalizedAvgDist = maxPossibleDist > 0 ? avgDistance / maxPossibleDist : 0;
    
    // Convert to tightness percentage (inverted: 0 = spread out, 100 = tight)
    // We expect human writing to cluster moderately (40-70% of max spread)
    const tightness = Math.max(0, Math.min(100, (1 - normalizedAvgDist) * 100));
    
    // Interpretation based on normalized distance
    let interpretation = '';
    let color = '';
    if (normalizedAvgDist < 0.3) {
      interpretation = 'Highly consistent writing style';
      color = '#4ade80'; // green
    } else if (normalizedAvgDist < 0.5) {
      interpretation = 'Moderately consistent style';
      color = '#fbbf24'; // yellow
    } else if (normalizedAvgDist < 0.7) {
      interpretation = 'Variable writing patterns';
      color = '#f97316'; // orange
    } else {
      interpretation = 'Highly variable / possible AI';
      color = '#ef4444'; // red
    }
    
    return {
      avgDistance: avgDistance.toFixed(3),
      stdDev: stdDev.toFixed(3),
      tightness: tightness.toFixed(0),
      interpretation,
      color
    };
  }, [basePoints]);

  // Apply color/opacity based on current time range (recalculates only when slider moves)
  const points = useMemo(() => {
    if (!basePoints || basePoints.length === 0) return [];
    
    if (!startTime || !endTime) return basePoints.map(p => ({
      ...p,
      languageName: getLanguageName(p.chunk?.language),
      color: languageColors[getLanguageName(p.chunk?.language)] || '#999',
      opacity: 0.9
    }));
    
    const isFullRange = startTime === minTime && endTime === maxTime;
    
    // Calculate local density for each point (number of neighbors within radius)
    const densityRadius = 0.5; // Adjust this to change sensitivity
    const densities = basePoints.map((point, i) => {
      let count = 0;
      for (let j = 0; j < basePoints.length; j++) {
        if (i !== j) {
          const dx = point.rawX - basePoints[j].rawX;
          const dy = point.rawY - basePoints[j].rawY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < densityRadius) count++;
        }
      }
      return count;
    });
    
    const maxDensity = Math.max(...densities, 1);
    
    return basePoints.map((point, idx) => {
      const itemTime = point.chunk.item.timestamp || 0;
      const isInRange = itemTime >= startTime && itemTime <= endTime;
      const langName = getLanguageName(point.chunk.language);
      const langColor = languageColors[langName] || '#999';
      
      // Map density to opacity: isolated = 0.15, clustered = 0.95
      const densityFactor = densities[idx] / maxDensity;
      const baseOpacity = 0.15 + (densityFactor * 0.8);
      
      return {
        ...point,
        languageName: langName,
        color: (isFullRange || isInRange) ? langColor : '#666',
        opacity: (isFullRange || isInRange) ? baseOpacity : 0.2
      };
    });
  }, [basePoints, startTime, endTime, minTime, maxTime, languageColors]);

  const uniqueLanguages = [...new Set((points || []).map(p => p.languageName))]
    .filter(l => l !== 'Unknown').slice(0, 5);

  const hasData = allItems && allItems.length >= 10 && basePoints && basePoints.length > 0;

  // Hide widget entirely if there's not enough data for default (both) view
  if (!hasData && contentType === 'both') return null;

  try {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0 }}>PCA Analysis</h3>
            <p className="stat-meta" style={{ marginBottom: '0', fontSize: '10px' }}>Principal components • Variance preserved</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginRight: '32px' }}>
            {['both', 'comments', 'posts'].map(type => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                style={{
                  padding: '4px 8px',
                  background: contentType === type ? COLORS.ACCENT_PRIMARY : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '4px',
                  color: contentType === type ? '#000' : '#fff',
                  fontSize: '9px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {!hasData ? (
          <div style={{ color: '#999', textAlign: 'center', paddingTop: '50px' }}>Not enough data for this content type</div>
        ) : (
        
        <div style={{ display: 'flex', height: 'calc(100% - 55px)', gap: '12px' }}>          {/* Left side - Controls */}
          <div style={{ width: '28%', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>            {/* Time range slider */}
            <div>
              <label style={{ 
                color: '#999999', 
                fontSize: '11px', 
                display: 'block', 
                marginBottom: '8px' 
              }}>
                Time Range
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999', marginBottom: '8px' }}>
                <span>{startTime ? new Date(startTime * 1000).toLocaleDateString() : 'Start'}</span>
                <span>{endTime ? new Date(endTime * 1000).toLocaleDateString() : 'End'}</span>
              </div>
              <div style={{ position: 'relative', height: '30px' }}>
                <style>{`
                  .pca-range-slider {
                    position: absolute;
                    width: 100%;
                    pointer-events: none;
                    -webkit-appearance: none;
                    appearance: none;
                    background: #666;
                    outline: none;
                    height: 1px;
                  }
                  .pca-range-slider::-webkit-slider-track {
                    background: #666;
                    height: 1px;
                    border-radius: 0;
                  }
                  .pca-range-slider::-moz-range-track {
                    background: #666;
                    height: 1px;
                    border-radius: 0;
                  }
                  .pca-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #ff6b6b;
                    cursor: pointer;
                    border-radius: 50%;
                    pointer-events: auto;
                    position: relative;
                    z-index: 100;
                  }
                  .pca-range-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #ff6b6b;
                    cursor: pointer;
                    border-radius: 50%;
                    border: none;
                    pointer-events: auto;
                    position: relative;
                    z-index: 100;
                  }
                `}</style>
                <input 
                  type="range" 
                  min={minTime} 
                  max={maxTime} 
                  value={startTime || minTime}
                  onChange={(e) => setStartTime(Math.min(parseInt(e.target.value), (endTime || maxTime) - 1))}
                  className="pca-range-slider"
                />
                <input 
                  type="range" 
                  min={minTime} 
                  max={maxTime} 
                  value={endTime || maxTime}
                  onChange={(e) => setEndTime(Math.max(parseInt(e.target.value), (startTime || minTime) + 1))}
                  className="pca-range-slider"
                />
              </div>
            </div>
            
            {/* Legend */}
            <div style={{ 
              padding: '8px', 
              borderRadius: '4px',
              flex: 1,
              overflowY: 'auto',
              fontSize: '9px',
              minHeight: 0
            }}>
              {/* Clustering metrics */}
              {clusteringMetrics && (
                <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '6px', color: COLORS.TEXT_WHITE, fontSize: '10px' }}>Cluster Tightness</div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: clusteringMetrics.color,
                    marginBottom: '4px'
                  }}>
                    {clusteringMetrics.tightness}%
                  </div>
                  <div style={{ fontSize: '8px', color: clusteringMetrics.color, marginBottom: '6px' }}>
                    {clusteringMetrics.interpretation}
                  </div>
                  <div style={{ fontSize: '7px', color: '#666' }}>
                    Avg dist: {clusteringMetrics.avgDistance} • σ: {clusteringMetrics.stdDev}
                  </div>
                </div>
              )}
              
              <div style={{ fontWeight: '600', marginBottom: '6px', color: COLORS.TEXT_WHITE }}>Languages</div>
              {uniqueLanguages.map(lang => (
                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: languageColors[lang] }} />
                  <span style={{ color: COLORS.TEXT_WHITE }}>{lang}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Visualization */}
          <div style={{ width: '72%', borderRadius: '6px', padding: '10px', minHeight: 0 }}>
            <svg width="100%" height="100%" viewBox="0 0 110 110" preserveAspectRatio="xMidYMid meet">
              <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.3" />
              <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.3" />
              
              <text x="50" y="98" fill={COLORS.TEXT_MUTED} fontSize="3" textAnchor="middle">PC1</text>
              <text x="5" y="50" fill={COLORS.TEXT_MUTED} fontSize="3" textAnchor="middle" transform="rotate(-90, 5, 50)">PC2</text>
              
              {points.map((point, idx) => (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={100 - point.y}
                  r="1.8"
                  fill={point.color}
                  opacity={point.opacity}
                  style={{ transition: 'opacity 0.3s ease' }}
                >
                  <title>{point.languageName}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('PCA render error:', error);
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0 }}>PCA Analysis</h3>
            <p className="stat-meta" style={{ marginBottom: '0', fontSize: '10px' }}>Principal components • Variance preserved</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginRight: '32px' }}>
            {['both', 'comments', 'posts'].map(type => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                style={{
                  padding: '4px 8px',
                  background: contentType === type ? COLORS.ACCENT_PRIMARY : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '4px',
                  color: contentType === type ? '#000' : '#fff',
                  fontSize: '9px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div style={{ color: '#999', textAlign: 'center', paddingTop: '50px' }}>Processing error — try a different content type</div>
      </div>
    );
  }
}
