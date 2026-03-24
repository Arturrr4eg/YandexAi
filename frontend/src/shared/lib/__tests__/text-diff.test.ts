import { describe, expect, it } from 'vitest';

import { getTextDiff } from '@/shared/lib/text-diff';

describe('getTextDiff', () => {
  it('keeps unchanged text as one part when strings are equal', () => {
    expect(getTextDiff('same text', 'same text')).toEqual([
      { type: 'unchanged', value: 'same text' },
    ]);
  });

  it('marks inserted words as added', () => {
    expect(getTextDiff('Надежный товар', 'Надежный отличный товар')).toEqual([
      { type: 'unchanged', value: 'Надежный ' },
      { type: 'added', value: 'отличный ' },
      { type: 'unchanged', value: 'товар' },
    ]);
  });

  it('marks removed words as removed', () => {
    expect(getTextDiff('Почти новый телефон', 'Новый телефон')).toEqual([
      { type: 'removed', value: 'Почти новый' },
      { type: 'added', value: 'Новый' },
      { type: 'unchanged', value: ' телефон' },
    ]);
  });
});
