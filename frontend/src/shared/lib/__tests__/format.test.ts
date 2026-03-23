import { describe, expect, it } from 'vitest';

import { formatPrice } from '@/shared/lib/format';

describe('formatPrice', () => {
  it('formats numeric price', () => {
    expect(formatPrice(100000)).toBe('100 000 ₽');
  });

  it('handles null price', () => {
    expect(formatPrice(null)).toBe('Цена не указана');
  });
});
