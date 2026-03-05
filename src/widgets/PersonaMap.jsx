import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../design-tokens';
import FocusableWidget from '../components/FocusableWidget';
import { extractMonthlyFeatures, pca, trainGRU, hasWebGPU } from '../lib/neuralUtils';
import { detectLanguage } from '../lib/languageUtils';

const INPUT_SIZE = 24;
const HIDDEN_SIZE = 16;
const EPOCHS = 100;
const PATIENCE = 15;
const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";

const FEATURE_LABELS = [
  'activity','avgLen','avgWords','avgScore','subreddits','nightRatio',
  'weekendRatio','controversy','ttr','questionRatio','avgSentiment','avgToxicity',
  'readability','avgWordLength','avgSentenceLength','exclamationRate',
  'capsRate','emojiRate','hourEntropy','punctDensity',
  'contractionRate','formalityRatio','linkRate','karmaVol',
];

function AccuracyChart({ epochLog }) {
  const validLogs = epochLog.filter(e => !e.error && e.trainAcc != null);
  if (validLogs.length === 0) return null;

  const svgW = 320, svgH = 200;
  const pad = { top: 16, right: 12, bottom: 28, left: 36 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;
  const n = validLogs.length;
  const maxEpoch = Math.max(n - 1, 1);

  const allAcc = validLogs.flatMap(e => [e.trainAcc, e.testAcc]);
  const minAcc = Math.max(0, Math.floor(Math.min(...allAcc) * 10) / 10 - 0.05);
  const maxAcc = Math.min(1, Math.ceil(Math.max(...allAcc) * 10) / 10 + 0.05);
  const yRange = Math.max(maxAcc - minAcc, 0.1);

  const xScale = (i) => pad.left + (i / maxEpoch) * plotW;
  const yScale = (v) => pad.top + plotH - ((v - minAcc) / yRange) * plotH;

  const trainLine = validLogs.map((e, i) => xScale(i) + ',' + yScale(e.trainAcc)).join(' ');
  const testLine = validLogs.map((e, i) => xScale(i) + ',' + yScale(e.testAcc)).join(' ');

  const nTicks = 5;
  const yTicks = Array.from({ length: nTicks + 1 }, (_, i) => minAcc + (yRange * i / nTicks));
  const xTickCount = Math.min(5, n - 1);
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => Math.round(i * maxEpoch / xTickCount));

  const lastTrain = validLogs[validLogs.length - 1]?.trainAcc;
  const lastTest = validLogs[validLogs.length - 1]?.testAcc;

  return (
    <svg width="100%" height="100%" viewBox={'0 0 ' + svgW + ' ' + svgH} style={{ overflow: 'visible' }}>
      {yTicks.map((tick, i) => (
        <line key={'yg' + i} x1={pad.left} x2={svgW - pad.right}
          y1={yScale(tick)} y2={yScale(tick)}
          stroke={COLORS.BORDER_DEFAULT} strokeWidth="0.5" strokeDasharray="2,2" />
      ))}
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH}
        stroke={COLORS.TEXT_MUTED} strokeWidth="1" />
      <line x1={pad.left} x2={svgW - pad.right} y1={pad.top + plotH} y2={pad.top + plotH}
        stroke={COLORS.TEXT_MUTED} strokeWidth="1" />
      {yTicks.map((tick, i) => (
        <text key={'yl' + i} x={pad.left - 4} y={yScale(tick)} fill={COLORS.TEXT_MUTED}
          fontSize="8" fontFamily={MONO} textAnchor="end" dominantBaseline="middle">
          {(tick * 100).toFixed(0) + '%'}
        </text>
      ))}
      {xTicks.map((tick, i) => (
        <text key={'xl' + i} x={xScale(tick)} y={pad.top + plotH + 14} fill={COLORS.TEXT_MUTED}
          fontSize="8" fontFamily={MONO} textAnchor="middle">
          {tick + 1}
        </text>
      ))}
      <text x={svgW / 2} y={svgH - 2} fill={COLORS.TEXT_MUTED}
        fontSize="9" fontFamily={MONO} textAnchor="middle">epoch</text>
      <text x={8} y={svgH / 2} fill={COLORS.TEXT_MUTED}
        fontSize="9" fontFamily={MONO} textAnchor="middle"
        transform={'rotate(-90, 8, ' + (svgH / 2) + ')'}>accuracy</text>
      <polyline points={trainLine} fill="none" stroke="#5599ff" strokeWidth="1.5" />
      <polyline points={testLine} fill="none" stroke="#ff8844" strokeWidth="1.5" />
      {validLogs.length > 0 && (
        <>
          <circle cx={xScale(n - 1)} cy={yScale(lastTrain)} r="3" fill="#5599ff" />
          <circle cx={xScale(n - 1)} cy={yScale(lastTest)} r="3" fill="#ff8844" />
        </>
      )}
      {validLogs.length > 1 && (
        <>
          <text x={xScale(n - 1) + 4} y={yScale(lastTrain) - 4} fill="#5599ff"
            fontSize="8" fontFamily={MONO}>
            {(lastTrain * 100).toFixed(1) + '%'}
          </text>
          <text x={xScale(n - 1) + 4} y={yScale(lastTest) + 12} fill="#ff8844"
            fontSize="8" fontFamily={MONO}>
            {(lastTest * 100).toFixed(1) + '%'}
          </text>
        </>
      )}
    </svg>
  );
}

export default function PersonaMap({ userData }) {
  const [training, setTraining] = useState(false);
  const [epochLog, setEpochLog] = useState([]);
  const [trainResult, setTrainResult] = useState(null);
  const logRef = useRef(null);

  const mainLang = useMemo(() => {
    if (!userData?.comments?.length) return null;
    const sample = userData.comments.slice(0, 60).map(c => c.body || c.comment || '').filter(Boolean);
    if (sample.length < 5) return null;
    const langs = sample.map(t => detectLanguage(t)).filter(l => l && l !== 'und');
    if (langs.length === 0) return null;
    const freq = {};
    for (const l of langs) freq[l] = (freq[l] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [userData]);

  const monthlyData = useMemo(() => {
    if (!userData) return [];
    return extractMonthlyFeatures(userData, { commentsOnly: true, languageFilter: mainLang });
  }, [userData, mainLang]);

  const pcaPoints = useMemo(() => {
    if (monthlyData.length < 3) return [];
    try {
      const normalized = monthlyData.map(m => m.normalized || m.features);
      return pca(normalized, 2);
    } catch { return []; }
  }, [monthlyData]);

  const handleTrain = useCallback(async () => {
    if (training || monthlyData.length < 4) return;
    setTraining(true);
    setEpochLog([]);
    setTrainResult(null);
    const sequence = monthlyData.map(m => m.normalized || m.features);
    try {
      const result = await trainGRU(sequence, {
        inputSize: INPUT_SIZE, hiddenSize: HIDDEN_SIZE, epochs: EPOCHS,
        lr: 0.003, patience: PATIENCE, dropoutRate: 0.15,
        onEpoch: (info) => setEpochLog(prev => [...prev, info]),
      });
      setTrainResult(result);
    } catch (err) {
      setEpochLog(prev => [...prev, { error: err.message }]);
    }
    setTraining(false);
  }, [training, monthlyData]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [epochLog]);

  const nMonths = monthlyData.length;
  const canTrain = nMonths >= 4 && !training;

  return (
    <FocusableWidget>
      <div style={{
        background: COLORS.BG_DARK_GREY, border: '1px solid ' + COLORS.BORDER_DEFAULT,
        borderRadius: '12px', padding: '12px', height: '100%', display: 'flex',
        flexDirection: 'column', fontFamily: MONO, color: COLORS.TEXT_WHITE,
        overflow: 'hidden', minHeight: 0,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.TEXT_WHITE }}>
              Writing Style Identity Analysis
            </span>
            <span style={{ fontSize: '10px', color: COLORS.TEXT_MUTED, fontFamily: MONO }}>
              {nMonths + 'mo | GRU(' + HIDDEN_SIZE + ') | ' + INPUT_SIZE + 'feat | skip+LN+drop'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasWebGPU() && (
              <span style={{ fontSize: '9px', color: COLORS.ACCENT_PRIMARY, fontFamily: MONO }}>WebGPU</span>
            )}
            <button onClick={handleTrain} disabled={!canTrain} style={{
              background: canTrain ? COLORS.ACCENT_PRIMARY : COLORS.BG_CARD,
              color: canTrain ? '#fff' : COLORS.TEXT_MUTED, border: 'none', borderRadius: '4px',
              padding: '3px 10px', fontSize: '10px', fontFamily: MONO,
              cursor: canTrain ? 'pointer' : 'default', opacity: canTrain ? 1 : 0.5,
            }}>
              {training ? 'TRAINING...' : 'TRAIN'}
            </button>
          </div>
        </div>

        {/* Two-panel layout */}
        <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* LEFT: Terminal */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a',
            borderRadius: '6px', border: '1px solid ' + COLORS.BORDER_DEFAULT, overflow: 'hidden', minWidth: 0,
          }}>
            <div style={{
              padding: '4px 8px', fontSize: '9px', color: COLORS.TEXT_MUTED,
              borderBottom: '1px solid ' + COLORS.BORDER_DEFAULT, background: COLORS.BG_CARD, flexShrink: 0,
            }}>
              {'Terminal \u2014 ' + EPOCHS + ' epochs, patience ' + PATIENCE + ', RF ensemble'}
            </div>
            <div ref={logRef} style={{
              flex: 1, overflowY: 'auto', padding: '4px 6px', fontSize: '9px',
              fontFamily: MONO, lineHeight: '1.5', color: '#aaa',
            }}>
              {epochLog.length === 0 && !training && (
                <div style={{ color: COLORS.TEXT_MUTED, padding: '8px 0' }}>
                  {nMonths < 4
                    ? 'Need >= 4 months of data (have ' + nMonths + ')'
                    : 'Press TRAIN to start GRU training with BPTT + Adam'}
                </div>
              )}
              {epochLog.map((info, i) => {
                if (info.error) return <div key={i} style={{ color: '#ff4444' }}>{'ERR: ' + info.error}</div>;
                const trainPct = Math.round((info.trainAcc || 0) * 100);
                const testPct = Math.round((info.testAcc || 0) * 100);
                const barW = 20;
                const trainFill = Math.round(trainPct / 100 * barW);
                const testFill = Math.round(testPct / 100 * barW);
                const trainBar = '\u2588'.repeat(trainFill) + '\u2591'.repeat(barW - trainFill);
                const testBar = '\u2588'.repeat(testFill) + '\u2591'.repeat(barW - testFill);
                const pStr = info.patience > 0 ? ' p:' + info.patience + '/' + info.maxPatience : '';
                const earlyStr = info.earlyStopped ? ' [EARLY STOP]' : '';
                return (
                  <div key={i} style={{ whiteSpace: 'pre', color: info.earlyStopped ? '#ffaa00' : '#aaa' }}>
                    <span style={{ color: COLORS.TEXT_MUTED }}>{'E' + String(info.epoch + 1).padStart(3, '0')}</span>
                    {' '}
                    <span style={{ color: '#5599ff' }}>{'train ' + trainBar + ' ' + trainPct + '%'}</span>
                    {' '}
                    <span style={{ color: '#ff8844' }}>{'test ' + testBar + ' ' + testPct + '%'}</span>
                    {' '}
                    <span style={{ color: COLORS.TEXT_MUTED }}>{'loss:' + info.loss.toFixed(4) + pStr + earlyStr}</span>
                  </div>
                );
              })}
              {trainResult && (
                <>
                  <div style={{ color: '#44cc88', marginTop: '4px' }}>--- Training complete ---</div>
                  <div style={{ color: '#44cc88' }}>
                    {trainResult.epochs + ' epochs' + (trainResult.earlyStopMsg ? ' (early stopped)' : '') + ' | ' + (trainResult.gpu ? 'WebGPU' : 'CPU')}
                  </div>
                  <div style={{ color: '#44cc88' }}>
                    {'Final train: ' + (trainResult.finalTrain.acc * 100).toFixed(1) + '% | test: ' + (trainResult.finalTest.acc * 100).toFixed(1) + '%'}
                  </div>
                  <div style={{ color: '#44cc88' }}>
                    {'RF ensemble acc: ' + (trainResult.rfAcc * 100).toFixed(1) + '%'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Accuracy chart */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a',
            borderRadius: '6px', border: '1px solid ' + COLORS.BORDER_DEFAULT, overflow: 'hidden', minWidth: 0,
          }}>
            <div style={{
              padding: '4px 8px', fontSize: '9px', color: COLORS.TEXT_MUTED,
              borderBottom: '1px solid ' + COLORS.BORDER_DEFAULT, background: COLORS.BG_CARD,
              flexShrink: 0, display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Model Accuracy</span>
              <span style={{ display: 'flex', gap: '8px' }}>
                <span><span style={{ color: '#5599ff' }}>{'\u25CF'}</span> train</span>
                <span><span style={{ color: '#ff8844' }}>{'\u25CF'}</span> test</span>
              </span>
            </div>
            <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {epochLog.length === 0 ? (
                <div style={{ color: COLORS.TEXT_MUTED, fontSize: '10px', textAlign: 'center' }}>
                  {pcaPoints.length > 0
                    ? 'PCA baseline ready (' + nMonths + ' months, ' + INPUT_SIZE + ' features)'
                    : 'Accuracy chart will appear during training'}
                </div>
              ) : (
                <AccuracyChart epochLog={epochLog} />
              )}
            </div>
          </div>
        </div>

        {/* Feature summary */}
        {trainResult && (
          <div style={{
            marginTop: '6px', padding: '4px 8px', background: COLORS.BG_CARD,
            borderRadius: '4px', fontSize: '9px', color: COLORS.TEXT_MUTED,
            fontFamily: MONO, display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0,
          }}>
            {FEATURE_LABELS.map((label, i) => (
              <span key={label} style={{ color: i >= 12 ? '#5599ff' : COLORS.TEXT_LIGHT_GREY }}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </FocusableWidget>
  );
}
