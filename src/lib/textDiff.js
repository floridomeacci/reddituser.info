const TOKEN_LIMIT_CELLS = 120000; // safeguard to avoid O(n*m) blow-ups

const tokenize = (input) => {
  if (!input) return [];
  return input.split(/(\s+)/).filter(segment => segment.length > 0);
};

const mergeSegments = (segments) => {
  if (!segments.length) return segments;
  const merged = [segments[0]];
  for (let idx = 1; idx < segments.length; idx += 1) {
    const current = segments[idx];
    const previous = merged[merged.length - 1];
    if (previous.type === current.type) {
      previous.value += current.value;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
};

const diffFallback = (originalTokens, updatedTokens) => {
  if (originalTokens.join('') === updatedTokens.join('')) {
    return originalTokens.map(value => ({ value, type: 'equal' }));
  }

  const result = [];
  if (originalTokens.length) {
    result.push({ value: originalTokens.join(''), type: 'delete' });
  }
  if (updatedTokens.length) {
    result.push({ value: updatedTokens.join(''), type: 'insert' });
  }
  return result;
};

export function diffStrings(original = '', updated = '') {
  const a = tokenize(original);
  const b = tokenize(updated);

  if (a.length === 0 && b.length === 0) {
    return [];
  }

  if (a.length === 0) {
    return [{ value: updated, type: 'insert' }];
  }

  if (b.length === 0) {
    return [{ value: original, type: 'delete' }];
  }

  if ((a.length + 1) * (b.length + 1) > TOKEN_LIMIT_CELLS) {
    return diffFallback(a, b);
  }

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const reversed = [];

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      reversed.push({ value: a[i - 1], type: 'equal' });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      reversed.push({ value: a[i - 1], type: 'delete' });
      i -= 1;
    } else {
      reversed.push({ value: b[j - 1], type: 'insert' });
      j -= 1;
    }
  }

  while (i > 0) {
    reversed.push({ value: a[i - 1], type: 'delete' });
    i -= 1;
  }
  while (j > 0) {
    reversed.push({ value: b[j - 1], type: 'insert' });
    j -= 1;
  }

  const diff = reversed.reverse();
  return mergeSegments(diff);
}
