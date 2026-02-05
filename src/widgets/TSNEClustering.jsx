import { useState, useMemo, useEffect } from 'react';
import { TSNE } from '@keckelt/tsne';
import { COLORS } from '../design-tokens';
import { analyzeLanguages, getLanguageName } from '../lib/languageUtils';

export default function TSNEClustering({ userData, style }) {
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

  // Use shared language analysis (cached across widgets)
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
      .replace(/\b(removed|deleted)\b/g, '')
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

  // Build trigram vocabulary and run t-SNE (memoized to prevent recalculation)
  const { basePoints, languageData, minTime, maxTime } = useMemo(() => {
    // Early return if no data
    if (!allItems || allItems.length === 0) {
      return { basePoints: [], languageData: [], minTime: 0, maxTime: 1 };
    }
    
    // Use cached language data
    const languageData = langAnalysis.languageData.filter(l => l.percentage >= 3);
    const dominantLanguage = langAnalysis.dominantLanguage || 'eng';

    // Collect chunks with language labels - use pre-detected languages
    const chunks = [];
    langAnalysis.itemsWithLanguage.forEach(item => {
      const rawText = item.comment || item.title || item.body || item.selftext || '';
      const text = cleanText(rawText);
      
      if (text.length > 50) {
        let itemLang = item._detectedLanguage || dominantLanguage;
        const langPercentage = languageData.find(l => l.code === itemLang)?.percentage || 0;
        if (langPercentage < 5) itemLang = dominantLanguage;
        
        for (let i = 0; i < text.length; i += 400) {
          const chunk = text.substring(i, i + 400);
          if (chunk.length >= 100) {
            chunks.push({ text: chunk, language: itemLang, item });
          }
        }
      }
    });

    // Get time range from ALL items first (not just chunks)
    const allTimes = allItems.map(item => item.timestamp).filter(t => t);
    const minTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
    const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : 1;

    // Sort chunks by timestamp to get chronological representation
    chunks.sort((a, b) => (a.item.timestamp || 0) - (b.item.timestamp || 0));
    
    // Sample evenly across time to get representative coverage
    const limitedChunks = chunks.length <= 100 
      ? chunks 
      : chunks.filter((_, i) => i % Math.ceil(chunks.length / 100) === 0).slice(0, 100);

    if (langAnalysis.totalItems === 0 || limitedChunks.length < 5) {
      return { basePoints: [], languageData, minTime, maxTime };
    }
    
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
      // Run t-SNE
      const tsneModel = new TSNE({
        dim: 2,
        perplexity: Math.min(30, Math.floor(vectors.length / 3)),
        epsilon: 10
      });

      tsneModel.initDataRaw(vectors);
      tsneModel.initSolution();

      for (let i = 0; i < 500; i++) {
        tsneModel.step();
      }

      const output = tsneModel.getSolution();

      const xValues = output.map(p => p[0]);
      const yValues = output.map(p => p[1]);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      const basePoints = output.map(([x, y], idx) => ({
        x: ((x - xMin) / (xMax - xMin)) * 70 + 15,
        y: ((y - yMin) / (yMax - yMin)) * 70 + 15,
        rawX: x,
        rawY: y,
        chunk: limitedChunks[idx]
      }));
      
      return { basePoints, languageData, minTime, maxTime };
    } catch (error) {
      console.error('t-SNE error:', error);
      return { basePoints: [], languageData: [], minTime, maxTime };
    }
  }, [allItems, langAnalysis]);

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
    
    // Find nearest neighbor distance for each point (better clustering metric)
    const nearestDistances = basePoints.map((p, i) => {
      let minDist = Infinity;
      for (let j = 0; j < basePoints.length; j++) {
        if (i !== j) {
          const dx = p.rawX - basePoints[j].rawX;
          const dy = p.rawY - basePoints[j].rawY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) minDist = dist;
        }
      }
      return minDist;
    });
    const avgNearestDist = nearestDistances.reduce((a, b) => a + b, 0) / nearestDistances.length;
    
    // Calculate the maximum possible distance (diagonal of the space)
    const xVals = basePoints.map(p => p.rawX);
    const yVals = basePoints.map(p => p.rawY);
    const xRange = Math.max(...xVals) - Math.min(...xVals);
    const yRange = Math.max(...yVals) - Math.min(...yVals);
    const maxPossibleDist = Math.sqrt(xRange * xRange + yRange * yRange);
    
    // Normalize average distance by maximum possible distance
    const normalizedAvgDist = maxPossibleDist > 0 ? avgDistance / maxPossibleDist : 0;
    
    // Convert to tightness percentage (inverted: 0 = spread out, 100 = tight)
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
      avgDistance: avgDistance.toFixed(1),
      avgNearest: avgNearestDist.toFixed(2),
      stdDev: stdDev.toFixed(1),
      tightness: tightness.toFixed(0),
      interpretation,
      color
    };
  }, [basePoints]);

  // Calculate language colors from languageData
  const languageColors = useMemo(() => {
    const colorPalette = [
      COLORS.DATA_1, COLORS.DATA_2, COLORS.DATA_3, COLORS.DATA_4, COLORS.DATA_5,
      COLORS.DATA_6, COLORS.DATA_7, COLORS.DATA_8, COLORS.DATA_9, COLORS.DATA_10
    ];
    
    const colors = {};
    languageData.forEach((lang, index) => {
      colors[lang.name] = colorPalette[index % colorPalette.length];
    });
    
    return colors;
  }, [languageData]);

  // Initialize slider to full time range
  useEffect(() => {
    if (startTime === null && minTime > 0 && maxTime > minTime) {
      setStartTime(minTime);
      setEndTime(maxTime);
    }
  }, [minTime, maxTime, startTime]);

  // Apply color/opacity based on current time range (recalculates only when slider moves)
  const normalizedPoints = useMemo(() => {
    if (!basePoints || basePoints.length === 0) return [];
    
    if (!startTime || !endTime) return basePoints.map(p => ({
      ...p,
      languageName: getLanguageName(p.chunk?.language),
      color: languageColors[getLanguageName(p.chunk?.language)] || '#999',
      opacity: 0.9
    }));
    
    const isFullRange = startTime === minTime && endTime === maxTime;
    
    // Calculate local density for each point (number of neighbors within radius)
    const densityRadius = 3; // t-SNE scale is different from PCA
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
    
    const result = basePoints.map((point, idx) => {
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
    
    return result;
  }, [basePoints, startTime, endTime, minTime, maxTime, languageColors]);

  const uniqueLanguages = [...new Set((normalizedPoints || []).map(p => p.languageName))]
    .filter(lang => lang !== 'Unknown')
    .slice(0, 6);

  const hasData = allItems && allItems.length > 0 && basePoints && basePoints.length > 0;

  try {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0 }}>t-SNE Clustering</h3>
            <p className="stat-meta" style={{ marginBottom: '0', fontSize: '10px' }}>Language patterns • Distance = similarity</p>
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
              {minTime > 0 && maxTime > minTime && startTime && endTime ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999', marginBottom: '8px' }}>
                    <span>{new Date(startTime * 1000).toLocaleDateString()}</span>
                    <span>{new Date(endTime * 1000).toLocaleDateString()}</span>
                  </div>
                  <div style={{ position: 'relative', height: '30px' }}>
                    <style>{`
                      .tsne-range-slider {
                        position: absolute;
                        width: 100%;
                        pointer-events: none;
                        -webkit-appearance: none;
                        appearance: none;
                        background: #666;
                        outline: none;
                        height: 1px;
                      }
                      .tsne-range-slider::-webkit-slider-track {
                        background: #666;
                        height: 1px;
                        border-radius: 0;
                      }
                      .tsne-range-slider::-moz-range-track {
                        background: #666;
                        height: 1px;
                        border-radius: 0;
                      }
                      .tsne-range-slider::-webkit-slider-thumb {
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
                      .tsne-range-slider::-moz-range-thumb {
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
                      value={startTime}
                      onChange={(e) => setStartTime(Math.min(parseInt(e.target.value), endTime - 1))}
                      className="tsne-range-slider"
                    />
                    <input 
                      type="range" 
                      min={minTime} 
                      max={maxTime} 
                      value={endTime}
                      onChange={(e) => setEndTime(Math.max(parseInt(e.target.value), startTime + 1))}
                      className="tsne-range-slider"
                    />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '10px', color: '#666' }}>Loading...</div>
              )}
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
                    Avg dist: {clusteringMetrics.avgDistance} • Nearest: {clusteringMetrics.avgNearest}
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
              {/* Grid lines */}
              <line x1="15" y1="15" x2="85" y2="15" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="15" y1="27" x2="85" y2="27" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="15" y1="39" x2="85" y2="39" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.3" />
              <line x1="15" y1="61" x2="85" y2="61" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="15" y1="73" x2="85" y2="73" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="15" y1="85" x2="85" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              
              <line x1="15" y1="15" x2="15" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="27" y1="15" x2="27" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="38.5" y1="15" x2="38.5" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.3" />
              <line x1="61.5" y1="15" x2="61.5" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="73" y1="15" x2="73" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              <line x1="85" y1="15" x2="85" y2="85" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.2" />
              
              {/* Y-axis labels */}
              <text x="11" y="18" fill="#666" fontSize="2.5" textAnchor="end">3</text>
              <text x="11" y="30" fill="#666" fontSize="2.5" textAnchor="end">2</text>
              <text x="11" y="42" fill="#666" fontSize="2.5" textAnchor="end">1</text>
              <text x="11" y="53" fill="#666" fontSize="2.5" textAnchor="end">0</text>
              <text x="11" y="64" fill="#666" fontSize="2.5" textAnchor="end">-1</text>
              <text x="11" y="76" fill="#666" fontSize="2.5" textAnchor="end">-2</text>
              <text x="11" y="88" fill="#666" fontSize="2.5" textAnchor="end">-3</text>
              
              {/* X-axis labels */}
              <text x="15" y="91" fill="#666" fontSize="2.5" textAnchor="middle">-3</text>
              <text x="27" y="91" fill="#666" fontSize="2.5" textAnchor="middle">-2</text>
              <text x="38.5" y="91" fill="#666" fontSize="2.5" textAnchor="middle">-1</text>
              <text x="50" y="91" fill="#666" fontSize="2.5" textAnchor="middle">0</text>
              <text x="61.5" y="91" fill="#666" fontSize="2.5" textAnchor="middle">1</text>
              <text x="73" y="91" fill="#666" fontSize="2.5" textAnchor="middle">2</text>
              <text x="85" y="91" fill="#666" fontSize="2.5" textAnchor="middle">3</text>
              
              {/* Axis labels */}
              <text x="55" y="109" fill="#999" fontSize="3" textAnchor="middle" fontWeight="bold">Component 1</text>
              <text x="3" y="55" fill="#999" fontSize="3" textAnchor="middle" transform="rotate(-90, 3, 55)" fontWeight="bold">Component 2</text>
              
              {normalizedPoints.map((point, idx) => (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={100 - point.y}
                  r="1.5"
                  fill={point.color}
                  opacity={point.opacity}
                  style={{ transition: 'opacity 0.3s ease' }}
                />
              ))}
            </svg>
          </div>
        </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('t-SNE render error:', error);
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0 }}>t-SNE Clustering</h3>
            <p className="stat-meta" style={{ marginBottom: '0', fontSize: '10px' }}>Language patterns • Distance = similarity</p>
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
