/**
 * Neural network utilities for behavioral trajectory analysis
 * GRU encoder (reservoir computing) + PCA / t-SNE dimensionality reduction
 * All computation is client-side
 */

import { afinnScore, toxicityScore as computeToxicity } from './browserML';

// ============== SEEDED PRNG (Mulberry32) ==============

function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let _rng = mulberry32(42);
function seededRandom() { return _rng(); }
function seededRandn() {
  const u1 = seededRandom() || 1e-10;
  const u2 = seededRandom();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function resetSeed(seed = 42) { _rng = mulberry32(seed); }

// ============== VECTOR / MATRIX OPS ==============

function zeros(n) { return new Float64Array(n); }

function matVecMul(mat, vec) {
  const out = new Float64Array(mat.length);
  for (let i = 0; i < mat.length; i++) {
    let s = 0;
    const row = mat[i];
    for (let j = 0; j < row.length; j++) s += row[j] * vec[j];
    out[i] = s;
  }
  return out;
}

function initMatrix(rows, cols, scale) {
  return Array.from({ length: rows }, () => {
    const row = new Float64Array(cols);
    for (let j = 0; j < cols; j++) row[j] = seededRandn() * scale;
    return row;
  });
}

// ============== GRU CELL ==============

class GRUCell {
  constructor(inputSize, hiddenSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    const cs = hiddenSize + inputSize;
    const scale = Math.sqrt(2 / (cs + hiddenSize)) * 0.5;
    this.Wz = initMatrix(hiddenSize, cs, scale);
    this.Wr = initMatrix(hiddenSize, cs, scale);
    this.Wh = initMatrix(hiddenSize, cs, scale);
    this.bz = zeros(hiddenSize);
    this.br = zeros(hiddenSize);
    this.bh = zeros(hiddenSize);
  }

  forward(x, hPrev) {
    const { hiddenSize, inputSize } = this;
    const concat = new Float64Array(hiddenSize + inputSize);
    concat.set(hPrev, 0);
    for (let i = 0; i < inputSize; i++) concat[hiddenSize + i] = x[i];

    // Update gate
    const zRaw = matVecMul(this.Wz, concat);
    const z = new Float64Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) z[i] = 1 / (1 + Math.exp(-(zRaw[i] + this.bz[i])));

    // Reset gate
    const rRaw = matVecMul(this.Wr, concat);
    const r = new Float64Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) r[i] = 1 / (1 + Math.exp(-(rRaw[i] + this.br[i])));

    // Candidate
    const concatR = new Float64Array(hiddenSize + inputSize);
    for (let i = 0; i < hiddenSize; i++) concatR[i] = r[i] * hPrev[i];
    for (let i = 0; i < inputSize; i++) concatR[hiddenSize + i] = x[i];
    const hcRaw = matVecMul(this.Wh, concatR);
    const hCand = new Float64Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) hCand[i] = Math.tanh(hcRaw[i] + this.bh[i]);

    // Output: h = (1-z)*hPrev + z*hCand
    const h = new Float64Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) h[i] = (1 - z[i]) * hPrev[i] + z[i] * hCand[i];
    return h;
  }
}

// ============== GRU SEQUENCE ENCODER ==============

export function gruEncode(sequence, inputSize = 12, hiddenSize = 8) {
  resetSeed(42);
  const gru = new GRUCell(inputSize, hiddenSize);
  let h = zeros(hiddenSize);
  const states = [];
  for (const x of sequence) {
    h = gru.forward(x, h);
    states.push(Array.from(h));
  }
  return states;
}

// ============== PCA ==============

export function pca(data, nDims = 2) {
  const n = data.length;
  const d = data[0].length;

  // Mean-center
  const mean = new Float64Array(d);
  for (const row of data) for (let j = 0; j < d; j++) mean[j] += row[j];
  for (let j = 0; j < d; j++) mean[j] /= n;
  const centered = data.map(row => row.map((v, j) => v - mean[j]));

  // Covariance
  const cov = Array.from({ length: d }, () => new Float64Array(d));
  for (const row of centered) {
    for (let i = 0; i < d; i++)
      for (let j = i; j < d; j++) {
        cov[i][j] += row[i] * row[j];
        if (i !== j) cov[j][i] += row[i] * row[j];
      }
  }
  const div = Math.max(n - 1, 1);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) cov[i][j] /= div;

  // Power iteration for top-k eigenvectors
  resetSeed(123);
  const vecs = [];
  const covW = cov.map(r => Float64Array.from(r));

  for (let k = 0; k < nDims; k++) {
    let v = new Float64Array(d);
    for (let i = 0; i < d; i++) v[i] = seededRandn();
    let norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    for (let i = 0; i < d; i++) v[i] /= norm;

    for (let iter = 0; iter < 300; iter++) {
      const nv = matVecMul(covW, v);
      norm = Math.sqrt(nv.reduce((s, x) => s + x * x, 0));
      if (norm < 1e-12) break;
      for (let i = 0; i < d; i++) v[i] = nv[i] / norm;
    }
    vecs.push(v);

    // Deflate
    const ev = matVecMul(covW, v).reduce((s, x, i) => s + x * v[i], 0);
    for (let i = 0; i < d; i++)
      for (let j = 0; j < d; j++) covW[i][j] -= ev * v[i] * v[j];
  }

  return centered.map(row => vecs.map(ev => ev.reduce((s, v, i) => s + v * row[i], 0)));
}

// ============== t-SNE ==============

export function tsne(data, nDims = 2, perplexity = 10, nIter = 300, lr = 50) {
  const n = data.length;
  const d = data[0].length;

  // Pairwise squared distances
  const dist2 = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      let s = 0;
      for (let k = 0; k < d; k++) s += (data[i][k] - data[j][k]) ** 2;
      dist2[i][j] = s;
      dist2[j][i] = s;
    }

  // Conditional probabilities (binary search for sigma)
  const P = Array.from({ length: n }, () => new Float64Array(n));
  const targetH = Math.log(Math.min(perplexity, Math.max(1, (n - 1) / 3)));

  for (let i = 0; i < n; i++) {
    let lo = 1e-4, hi = 1e4;
    for (let iter = 0; iter < 50; iter++) {
      const beta = (lo + hi) / 2;
      let sumP = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) { P[i][j] = 0; continue; }
        P[i][j] = Math.exp(-beta * dist2[i][j]);
        sumP += P[i][j];
      }
      sumP = Math.max(sumP, 1e-10);
      let H = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        P[i][j] /= sumP;
        if (P[i][j] > 1e-10) H -= P[i][j] * Math.log(P[i][j]);
      }
      if (H > targetH) lo = beta; else hi = beta;
    }
  }

  // Symmetrize
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const sym = Math.max((P[i][j] + P[j][i]) / (2 * n), 1e-12);
      P[i][j] = sym;
      P[j][i] = sym;
    }

  // Init embedding
  resetSeed(789);
  let Y = Array.from({ length: n }, () =>
    Array.from({ length: nDims }, () => seededRandn() * 0.01)
  );
  let prevY = Array.from({ length: n }, () => new Array(nDims).fill(0));
  const gains = Array.from({ length: n }, () => new Array(nDims).fill(1));

  // Early exaggeration ×4 for first 100 iterations
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) P[i][j] *= 4;

  for (let iter = 0; iter < nIter; iter++) {
    if (iter === 100)
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) P[i][j] /= 4;

    const mom = iter < 250 ? 0.5 : 0.8;

    // Q (Student-t)
    let sumQ = 0;
    const Q = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        let d2 = 0;
        for (let k = 0; k < nDims; k++) d2 += (Y[i][k] - Y[j][k]) ** 2;
        const q = 1 / (1 + d2);
        Q[i][j] = q;
        Q[j][i] = q;
        sumQ += 2 * q;
      }
    sumQ = Math.max(sumQ, 1e-10);

    // Gradient
    const grad = Array.from({ length: n }, () => new Array(nDims).fill(0));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const mult = 4 * (P[i][j] - Q[i][j] / sumQ) * Q[i][j];
        for (let k = 0; k < nDims; k++) grad[i][k] += mult * (Y[i][k] - Y[j][k]);
      }

    // Update with momentum + adaptive gains
    const newY = Y.map(r => [...r]);
    for (let i = 0; i < n; i++)
      for (let k = 0; k < nDims; k++) {
        const same = Math.sign(grad[i][k]) === Math.sign(Y[i][k] - prevY[i][k]);
        gains[i][k] = same ? gains[i][k] * 0.8 : gains[i][k] + 0.2;
        gains[i][k] = Math.max(gains[i][k], 0.01);
        newY[i][k] = Y[i][k] - lr * gains[i][k] * grad[i][k] + mom * (Y[i][k] - prevY[i][k]);
      }
    prevY = Y;
    Y = newY;

    // Center
    const mn = new Array(nDims).fill(0);
    for (const row of Y) row.forEach((v, k) => (mn[k] += v));
    for (let k = 0; k < nDims; k++) mn[k] /= n;
    for (const row of Y) row.forEach((_, k) => (row[k] -= mn[k]));
  }

  return Y;
}

// ============== FEATURE EXTRACTION ==============

export function extractMonthlyFeatures(userData) {
  const comments = userData.comments || [];
  const posts = userData.posts || [];

  // Group by month
  const months = {};

  for (const c of comments) {
    if (!c.created_utc) continue;
    const d = new Date(c.created_utc * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { month: key, comments: [], posts: [] };
    months[key].comments.push(c);
  }

  for (const p of posts) {
    if (!p.created_utc) continue;
    const d = new Date(p.created_utc * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { month: key, comments: [], posts: [] };
    months[key].posts.push(p);
  }

  const sorted = Object.values(months).sort((a, b) => a.month.localeCompare(b.month));

  const features = sorted.map(m => {
    const bodies = m.comments.map(c => c.body || c.comment || '').filter(Boolean);
    const totalItems = m.comments.length + m.posts.length;
    const allItems = [...m.comments, ...m.posts].filter(i => i.created_utc);
    const scores = [...m.comments, ...m.posts].map(i => i.score || 0);

    // 1. Activity (log)
    const activity = Math.log1p(totalItems);

    // 2. Avg comment length
    const avgLen = bodies.length > 0
      ? bodies.reduce((s, b) => s + b.length, 0) / bodies.length : 0;

    // 3. Avg words
    const avgWords = bodies.length > 0
      ? bodies.reduce((s, b) => s + b.split(/\s+/).length, 0) / bodies.length : 0;

    // 4. Avg karma
    const avgScore = scores.length > 0
      ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;

    // 5. Unique subreddits
    const subs = new Set([...m.comments, ...m.posts].map(i => i.subreddit).filter(Boolean));

    // 6. Night ratio (22-06 UTC)
    const nightN = allItems.filter(i => {
      const h = new Date(i.created_utc * 1000).getUTCHours();
      return h >= 22 || h < 6;
    }).length;
    const nightRatio = allItems.length > 0 ? nightN / allItems.length : 0;

    // 7. Weekend ratio
    const weekendN = allItems.filter(i => {
      const day = new Date(i.created_utc * 1000).getUTCDay();
      return day === 0 || day === 6;
    }).length;
    const weekendRatio = allItems.length > 0 ? weekendN / allItems.length : 0;

    // 8. Controversy (score ≤ 0)
    const negN = scores.filter(s => s <= 0).length;
    const controversy = scores.length > 0 ? negN / scores.length : 0;

    // 9. TTR
    const allWords = bodies.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const ttr = allWords.length > 10 ? new Set(allWords).size / allWords.length : 0;

    // 10. Question ratio
    const qN = bodies.filter(b => b.includes('?')).length;
    const questionRatio = bodies.length > 0 ? qN / bodies.length : 0;

    // 11. Avg sentiment (AFINN)
    const sents = bodies.slice(0, 50).map(b => afinnScore(b));
    const avgSentiment = sents.length > 0 ? sents.reduce((s, v) => s + v, 0) / sents.length : 0;

    // 12. Avg toxicity
    const toxs = bodies.slice(0, 50).map(b => computeToxicity(b));
    const avgToxicity = toxs.length > 0 ? toxs.reduce((s, v) => s + v, 0) / toxs.length : 0;

    return {
      month: m.month,
      features: [activity, avgLen, avgWords, avgScore, subs.size, nightRatio,
        weekendRatio, controversy, ttr, questionRatio, avgSentiment, avgToxicity],
      meta: {
        total: totalItems,
        comments: m.comments.length,
        posts: m.posts.length,
        avgScore: Math.round(avgScore * 10) / 10,
        subreddits: subs.size,
        sentiment: Math.round(avgSentiment * 10) / 10,
        toxicity: Math.round(avgToxicity),
      },
    };
  });

  // Z-score normalise features across months
  if (features.length === 0) return features;
  const nF = features[0].features.length;
  const means = new Float64Array(nF);
  const stds = new Float64Array(nF);

  for (const f of features) for (let i = 0; i < nF; i++) means[i] += f.features[i];
  for (let i = 0; i < nF; i++) means[i] /= features.length;

  for (const f of features) for (let i = 0; i < nF; i++) stds[i] += (f.features[i] - means[i]) ** 2;
  for (let i = 0; i < nF; i++) stds[i] = Math.sqrt(stds[i] / Math.max(features.length - 1, 1)) || 1;

  for (const f of features) {
    f.normalized = f.features.map((v, i) => (v - means[i]) / stds[i]);
  }

  return features;
}

// ============== WebGPU detection ==============

export function hasWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
