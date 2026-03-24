import { describe, expect, it } from 'vitest';

import { formatDate, formatPrice } from '@/shared/lib/format';

describe('format helpers', () => {
  it('formats numeric price with separators', () => {
    expect(formatPrice(100000)).toContain('100 000');
  });

  it('returns fallback text for null price', () => {
    expect(formatPrice(null)).not.toHaveLength(0);
  });

  it('formats iso date to readable russian locale string', () => {
    expect(formatDate('2026-03-24T10:00:00.000Z')).toContain('2026');
  });
});
