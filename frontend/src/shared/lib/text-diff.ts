export type DiffPart = {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
};

const tokenize = (value: string) => value.match(/(\s+|[^\s]+)/g) ?? [];

export const getTextDiff = (before: string, after: string): DiffPart[] => {
  const source = tokenize(before);
  const target = tokenize(after);
  const dp = Array.from({ length: source.length + 1 }, () => Array(target.length + 1).fill(0));

  for (let i = source.length - 1; i >= 0; i -= 1) {
    for (let j = target.length - 1; j >= 0; j -= 1) {
      dp[i][j] =
        source[i] === target[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const diff: DiffPart[] = [];
  let i = 0;
  let j = 0;

  const pushPart = (type: DiffPart['type'], value: string) => {
    const last = diff.at(-1);

    if (last?.type === type) {
      last.value += value;
      return;
    }

    diff.push({ type, value });
  };

  while (i < source.length && j < target.length) {
    if (source[i] === target[j]) {
      pushPart('unchanged', source[i]);
      i += 1;
      j += 1;
      continue;
    }

    if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushPart('removed', source[i]);
      i += 1;
      continue;
    }

    pushPart('added', target[j]);
    j += 1;
  }

  while (i < source.length) {
    pushPart('removed', source[i]);
    i += 1;
  }

  while (j < target.length) {
    pushPart('added', target[j]);
    j += 1;
  }

  return diff;
};
