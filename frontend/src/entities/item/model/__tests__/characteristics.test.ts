import { describe, expect, it } from 'vitest';

import {
  createItemParamsDraft,
  getFilledItemCharacteristics,
  getItemCharacteristicDefinitions,
  getMissingItemCompletionLabels,
  normalizeItemParamsForUpdate,
} from '@/entities/item/model/characteristics';
import type { Item } from '@/entities/item/model/types';

const autoItem: Item = {
  category: 'auto',
  createdAt: '2026-03-24T10:00:00.000Z',
  description: '',
  id: 1,
  needsRevision: true,
  params: {
    brand: 'Volkswagen',
    enginePower: 0,
    mileage: 125000,
    model: 'Polo',
    transmission: 'automatic',
    yearOfManufacture: 2018,
  },
  price: 950000,
  title: 'Volkswagen Polo',
  updatedAt: '2026-03-24T10:00:00.000Z',
};

describe('item characteristics', () => {
  it('returns definitions for category in stable order', () => {
    const definitions = getItemCharacteristicDefinitions('auto');

    expect(definitions.map(field => field.key)).toEqual([
      'brand',
      'model',
      'yearOfManufacture',
      'transmission',
      'mileage',
      'enginePower',
    ]);
  });

  it('creates params draft and preserves zero values', () => {
    expect(createItemParamsDraft(autoItem)).toEqual({
      brand: 'Volkswagen',
      enginePower: '0',
      mileage: '125000',
      model: 'Polo',
      transmission: 'automatic',
      yearOfManufacture: '2018',
    });
  });

  it('normalizes values for update and converts numeric fields', () => {
    expect(
      normalizeItemParamsForUpdate('electronics', {
        brand: ' Apple ',
        color: '',
        condition: 'used',
        model: ' iPhone 15 ',
        type: 'phone',
      }),
    ).toEqual({
      brand: 'Apple',
      color: undefined,
      condition: 'used',
      model: 'iPhone 15',
      type: 'phone',
    });

    expect(
      normalizeItemParamsForUpdate('auto', {
        brand: 'Volkswagen',
        enginePower: '150',
        mileage: ' 125000 ',
        model: 'Polo',
        transmission: 'automatic',
        yearOfManufacture: '2018',
      }),
    ).toEqual({
      brand: 'Volkswagen',
      enginePower: 150,
      mileage: 125000,
      model: 'Polo',
      transmission: 'automatic',
      yearOfManufacture: 2018,
    });
  });

  it('returns only filled characteristics for item details', () => {
    const item: Item = {
      ...autoItem,
      params: {
        brand: 'Volkswagen',
        enginePower: undefined,
        mileage: 125000,
        model: '',
        transmission: 'automatic',
        yearOfManufacture: 2018,
      },
    };

    expect(getFilledItemCharacteristics(item).map(field => field.key)).toEqual([
      'brand',
      'yearOfManufacture',
      'transmission',
      'mileage',
    ]);
  });

  it('collects missing labels from description and params', () => {
    const item: Item = {
      ...autoItem,
      description: '   ',
      params: {
        brand: '',
        enginePower: undefined,
        mileage: 125000,
        model: 'Polo',
        transmission: 'automatic',
        yearOfManufacture: 2018,
      },
    };

    expect(getMissingItemCompletionLabels(item)).toEqual([
      'Описание',
      'Бренд',
      'Мощность двигателя',
    ]);
  });
});
