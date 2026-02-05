export type DiffLine = { type: 'same' | 'add' | 'remove'; left?: string; right?: string };

export const diffLines = (left: string, right: string): DiffLine[] => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const m = leftLines.length;
  const n = rightLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      result.push({ type: 'same', left: leftLines[i - 1], right: rightLines[j - 1] });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'add', right: rightLines[j - 1] });
      j -= 1;
    } else if (i > 0) {
      result.push({ type: 'remove', left: leftLines[i - 1] });
      i -= 1;
    }
  }

  return result.reverse();
};
