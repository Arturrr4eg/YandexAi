import { describe, expect, it } from 'vitest';

import { mapListDto } from '@/entities/item/model/mappers';

describe('mapListDto', () => {
  it('maps dto to list card without transformations', () => {
    expect(
      mapListDto({
        category: 'electronics',
        id: 7,
        needsRevision: true,
        price: 125000,
        title: 'MacBook Pro 16',
      }),
    ).toEqual({
      category: 'electronics',
      id: 7,
      needsRevision: true,
      price: 125000,
      title: 'MacBook Pro 16',
    });
  });
});
