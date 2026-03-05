import { useState, useMemo, useCallback, useRef } from 'react';
import { COLORS } from '../design-tokens';
import { extractMonthlyFeatures, gruEncode, trainGRU, pca, tsne } from '../lib/neuralUtils';
import { detectLanguage, getLanguageName } from '../lib/languageUtils';

function projectPoints(hiddenStates, monthlyData, method) {
  let projected;
  if (method === 'PCA') {
    projected = pca(hiddenStates, 2);
  } else {
    const perp = Math.min(10, Math.max(2, Math.floor(hiddenStates.length / 4)));
    projected = tsne(hiddenStates, 2, perp, 300, 50);
  }

  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (const [x, y] of projected) {
    if (x < xMin) xMin = x; if (x > xMax) xMax = x;
    if (y < yMin) yMin = y; if (y > yMax) yMax = y;
  }
  const xPad = (xMax - xMin) * 0.12 || 1;
  const yPad = (yMax - yMin) * 0.12 || 1;

  return {
    points: projected.map(([x, y], i) => ({
      x, y,
      month: monthlyData[i].month,
      label: new Date(monthlyData[i].month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      meta: monthlyData[i].meta,
    })),
    xRange: [xMin - xPad, xMax + xPad],
    yRange: [yMin - yPad, yMax + yPad],
  };
}

export default function PersonaMap({ userData, style = {} }) {
  const [method, setMethod] = useState('PCA');
  const [hovered, setHovered] = useState(null);

  // Training state
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null); // { states, lossHistory, gpu, epochs }
  const [trainProgress, setTrainProgress] = useState(null); // { epoch, loss }
  const abortRef = useRef(false);

  // 1. Extract features
  const { monthlyData, mainLang } = useMemo(() => {
    if (!userData?.comments?.length) return { monthlyData: null, mainLang: null };
    // Determine dominant language among comments only
    const langCounts = {};
    for (const c of userData.comments) {
      const t = c.body || c.comment || '';
      const code = detectLanguage(t);
      if (code && code !== 'und') langCounts[code] = (langCounts[code] || 0) + 1;
    }
    const main = Object.entries(langCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'eng';
    // Enrich comments with detected language to help the extractor filter
    const ud = {
      ...userData,
      comments: (userData.comments||[]).map(c => ({...c, _detectedLanguage: c._detectedLanguage || detectLanguage(c.body || c.comment || '')}))
    };
    const features = extractMonthlyFeatures(ud, { commentsOnly: true, languageFilter: main });
    return { monthlyData: features.length >= 4 ? features : null, mainLang: main };
  }, [userData]);

  // 2. Untrained baseline (reservoir GRU — instant)
  const baseline = useMemo(() => {
    if (!monthlyData) return null;
    const normalized = monthlyData.map(m => m.normalized);
    const states = gruEncode(normalized, normalized[0].length, 8);
    return projectPoints(states, monthlyData, method);
  }, [monthlyData, method]);

  // 3. Trained projection (only after user clicks train)
  const trained = useMemo(() => {
    if (!trainResult || !monthlyData) return null;
    return projectPoints(trainResult.states, monthlyData, method);
  }, [trainResult, monthlyData, method]);

  // Use trained data if available, else baseline
  const active = trained || baseline;

  // Train handler
  const handleTrain = useCallback(async () => {
    if (!monthlyData || training) return;
    abortRef.current = false;
    setTraining(true);
    setTrainProgress(null);
    setTrainResult(null);

    const normalized = monthlyData.map(m => m.normalized);
    try {
      const result = await trainGRU(normalized, {
        inputSize: normalized[0].length,
        hiddenSize: 8,
        epochs: 120,
        lr: 0.003,
        onEpoch: (info) => {
          if (abortRef.current) throw new Error('aborted');
          setTrainProgress({ epoch: info.epoch, loss: info.loss, gpu: info.gpu, history: info.lossHistory, trainAcc: info.trainAcc, testAcc: info.testAcc });
        },
      });
      setTrainResult(result);
    } catch (e) {
      if (e.message !== 'aborted') console.error('Training error:', e);
    } finally {
      setTraining(false);
    }
  }, [monthlyData, training]);

  if (!monthlyData || !active || active.points.length < 4) return null;

  const { points, xRange, yRange } = active;

  // SVG layout
  const margin = { top: 16, right: 16, bottom: 26, left: 32 };
  const W = 320, H = 260;
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const sx = (v) => margin.left + ((v - xRange[0]) / (xRange[1] - xRange[0])) * plotW;
  const sy = (v) => margin.top + plotH - ((v - yRange[0]) / (yRange[1] - yRange[0])) * plotH;

  const pathD = 'M ' + points.map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' L ');

  const midIdx = Math.floor(points.length / 2);
  const arrowAngle = points.length > 2
    ? Math.atan2(sy(points[midIdx].y) - sy(points[midIdx - 1].y), sx(points[midIdx].x) - sx(points[midIdx - 1].x)) * 180 / Math.PI
    : 0;

  const dimLabel = method === 'PCA' ? ['PC1', 'PC2'] : ['Dim 1', 'Dim 2'];
  const isTrained = !!trainResult;

  return (
    <div className="cell" style={style}>
      <h3>PERSONA MAP</h3>
      <p className="stat-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span>{monthlyData.length}mo · GRU(8) → </span>
        <span
          style={{ cursor: 'pointer', color: COLORS.ACCENT_PRIMARY, fontWeight: 600, borderBottom: `1px dashed ${COLORS.ACCENT_PRIMARY}` }}
          onClick={() => setMethod(m => (m === 'PCA' ? 't-SNE' : 'PCA'))}
          title="Toggle projection"
        >{method}</span>
        <span style={{ color: COLORS.TEXT_MUTED, fontSize: '10px' }}> · language: {getLanguageName(mainLang)} ({mainLang}) · comments only</span>
        {isTrained ? (
          <span style={{ color: COLORS.DATA_2, fontSize: '9px', fontWeight: 600 }}>
            TRAINED · loss {trainResult.lossHistory[trainResult.lossHistory.length - 1].toFixed(4)} · acc {((trainResult.finalTest?.acc||trainResult.finalTrain?.acc||0)*100).toFixed(1)}%
            {trainResult.gpu ? ' · WebGPU' : ''}
          </span>
        ) : !training ? (
          <span
            style={{
              cursor: 'pointer', fontSize: '9px', fontWeight: 700,
              color: COLORS.DATA_3, background: 'rgba(251,146,60,0.12)',
              padding: '1px 6px', borderRadius: 4, marginLeft: 2,
              border: `1px solid rgba(251,146,60,0.3)`,
            }}
            onClick={handleTrain}
            title="Train a GRU autoencoder on this user's behavioral data using BPTT (runs in your browser)"
          >
            TRAIN
          </span>
        ) : (
          <span style={{ color: COLORS.DATA_4, fontSize: '9px', fontWeight: 600 }}>
            epoch {trainProgress?.epoch ?? 0}/150 · loss {trainProgress?.loss?.toFixed(4) ?? '—'}
            {trainProgress?.gpu ? ' · WebGPU' : ''}
          </span>
        )}
      </p>

      {/* Training metrics: loss + accuracy sparklines and terminal log */}
      {(training || isTrained) && (trainProgress?.history?.length > 1 || trainResult?.lossHistory?.length > 1) && (() => {
        const hist = trainResult?.lossHistory || trainProgress?.history || [];
        if (hist.length < 2) return null;
        const maxL = Math.max(...hist);
        const minL = Math.min(...hist);
        const range = maxL - minL || 1;
        const sparkW = 272, sparkH = 18;
        const sparkPath = hist.map((v, i) =>
          `${(i / (hist.length - 1) * sparkW).toFixed(1)},${(sparkH - ((v - minL) / range) * sparkH).toFixed(1)}`
        ).join(' L ');
        const accTrain = (trainProgress?.trainAcc != null) ? (trainProgress.history.map((_,i)=>i).map(()=>trainProgress.trainAcc)) : [];
        const accTest = (trainProgress?.testAcc != null) ? (trainProgress.history.map((_,i)=>i).map(()=>trainProgress.testAcc)) : [];
        // If final result, we don't have per-epoch accuracies; keep sparkline to loss only
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: COLORS.TEXT_MUTED, width: 52 }}>loss</span>
              <svg width={sparkW} height={sparkH}>
                <polyline points={sparkPath} fill="none" stroke={COLORS.ACCENT_PRIMARY} strokeWidth="1.2" strokeOpacity="0.7" />
              </svg>
            </div>
            {training && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: COLORS.TEXT_MUTED, width: 52 }}>acc</span>
                <svg width={sparkW} height={sparkH}>
                  {/* Simple last-known accuracy lines */}
                  {accTrain.length > 0 && (
                    <line x1={0} y1={sparkH - (trainProgress.trainAcc * sparkH)} x2={sparkW} y2={sparkH - (trainProgress.trainAcc * sparkH)} stroke={COLORS.DATA_2} strokeWidth="1" strokeDasharray="4 2" />
                  )}
                  {accTest.length > 0 && (
                    <line x1={0} y1={sparkH - (trainProgress.testAcc * sparkH)} x2={sparkW} y2={sparkH - (trainProgress.testAcc * sparkH)} stroke={COLORS.DATA_6} strokeWidth="1" strokeDasharray="2 2" />
                  )}
                </svg>
              </div>
            )}
          </div>
        );
      })()}

      {(training || isTrained) && (
        <div style={{
          marginTop: 6,
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${COLORS.BORDER_DEFAULT}`,
          borderRadius: 6,
          padding: '6px 8px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 10,
          color: COLORS.TEXT_LIGHT_GREY,
          maxHeight: 100,
          overflowY: 'auto'
        }}>
          <div>$ init trainer {trainProgress?.gpu ? '(WebGPU enabled)' : '(CPU fallback)'}</div>
          {trainProgress && (
            <div>
              $ epoch {String(trainProgress.epoch).padStart(3,' ')} loss={trainProgress.loss?.toFixed(6)} acc_train={(trainProgress.trainAcc*100||0).toFixed(2)}% acc_test={(trainProgress.testAcc*100||0).toFixed(2)}%
            </div>
          )}
          {isTrained && (
            <div>
              $ done epochs={trainResult.epochs} loss={trainResult.lossHistory[trainResult.lossHistory.length-1]?.toFixed(6)} acc_train={(trainResult.finalTrain?.acc*100||0).toFixed(2)}% acc_test={(trainResult.finalTest?.acc*100||0).toFixed(2)}%
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="personaTrailGrad" gradientUnits="userSpaceOnUse"
              x1={sx(points[0].x)} y1={sy(points[0].y)}
              x2={sx(points[points.length - 1].x)} y2={sy(points[points.length - 1].y)}>
              <stop offset="0%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity="0.15" />
              <stop offset="100%" stopColor={COLORS.ACCENT_PRIMARY} stopOpacity="0.9" />
            </linearGradient>
            <filter id="pmGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {[0.25, 0.5, 0.75].map(frac => (
            <g key={frac}>
              <line x1={margin.left + plotW * frac} y1={margin.top} x2={margin.left + plotW * frac} y2={margin.top + plotH}
                stroke={COLORS.BORDER_DEFAULT} strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1={margin.left} y1={margin.top + plotH * frac} x2={margin.left + plotW} y2={margin.top + plotH * frac}
                stroke={COLORS.BORDER_DEFAULT} strokeWidth="0.5" strokeDasharray="2 4" />
            </g>
          ))}

          {/* Axes */}
          <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke={COLORS.BORDER_DEFAULT} strokeWidth="1" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke={COLORS.BORDER_DEFAULT} strokeWidth="1" />
          <text x={margin.left + plotW / 2} y={H - 3} fill={COLORS.TEXT_MUTED} fontSize="8" textAnchor="middle" fontFamily="monospace">{dimLabel[0]} →</text>
          <text x={10} y={margin.top + plotH / 2} fill={COLORS.TEXT_MUTED} fontSize="8" textAnchor="middle" fontFamily="monospace"
            transform={`rotate(-90, 10, ${margin.top + plotH / 2})`}>{dimLabel[1]} →</text>

          {/* Trajectory */}
          <path d={pathD} fill="none" stroke="url(#personaTrailGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Arrow */}
          {points.length > 2 && (
            <polygon points="-5,-3.5 5,0 -5,3.5" fill={COLORS.ACCENT_PRIMARY} fillOpacity="0.65"
              transform={`translate(${sx(points[midIdx].x).toFixed(1)},${sy(points[midIdx].y).toFixed(1)}) rotate(${arrowAngle.toFixed(1)})`} />
          )}

          {/* Points */}
          {points.map((p, i) => {
            const opacity = 0.15 + 0.85 * (i / (points.length - 1));
            const baseR = 2.5 + (p.meta.total > 50 ? 2 : p.meta.total > 20 ? 1 : 0);
            const isH = hovered === i;
            const cx = sx(p.x), cy = sy(p.y);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={isH ? baseR + 3 : baseR}
                  fill={COLORS.ACCENT_PRIMARY} fillOpacity={isH ? 1 : opacity}
                  stroke={isH ? '#fff' : COLORS.ACCENT_PRIMARY} strokeWidth={isH ? 1.5 : 0.5}
                  filter={isH ? 'url(#pmGlow)' : undefined}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
                {i === 0 && <text x={cx} y={cy - 9} fill={COLORS.TEXT_MUTED} fontSize="7" textAnchor="middle" fontWeight="500">START</text>}
                {i === points.length - 1 && <text x={cx} y={cy - 9} fill={COLORS.ACCENT_PRIMARY} fontSize="7.5" textAnchor="middle" fontWeight="700">NOW</text>}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(10,10,20,0.92)', border: `1px solid ${COLORS.BORDER_DEFAULT}`,
            borderRadius: 6, padding: '6px 10px', fontSize: '9px',
            color: COLORS.TEXT_LIGHT_GREY, pointerEvents: 'none', minWidth: 110, zIndex: 5, lineHeight: 1.5,
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: COLORS.ACCENT_PRIMARY, marginBottom: 3 }}>{points[hovered].label}</div>
            <div>📝 {points[hovered].meta.comments} comments · {points[hovered].meta.posts} posts</div>
            <div>⭐ Avg karma: {points[hovered].meta.avgScore}</div>
            <div>🗂 {points[hovered].meta.subreddits} subreddits</div>
            <div>💬 Sentiment: {points[hovered].meta.sentiment}</div>
            <div>🌶️ Toxicity: {points[hovered].meta.toxicity}</div>
          </div>
        )}
      </div>
    </div>
  );
}
