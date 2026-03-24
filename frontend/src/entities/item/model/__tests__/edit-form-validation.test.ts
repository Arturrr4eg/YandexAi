import { describe, expect, it } from 'vitest';

import {
  MAX_ITEM_PRICE,
  hasItemEditFormErrors,
  validateItemEditForm,
} from '@/entities/item/model/edit-form-validation';

describe('validateItemEditForm', () => {
  it('returns no errors for valid auto form', () => {
    const errors = validateItemEditForm('auto', {
      description: 'Надежный автомобиль, обслужен и готов к продаже.',
      params: {
        brand: 'Volkswagen',
        enginePower: '110',
        mileage: '125000',
        model: 'Polo',
        transmission: 'automatic',
        yearOfManufacture: '2018',
      },
      price: '950000',
      title: 'Volkswagen Polo',
    });

    expect(errors).toEqual({ params: {} });
    expect(hasItemEditFormErrors(errors)).toBe(false);
  });

  it('marks invalid base fields', () => {
    const errors = validateItemEditForm('electronics', {
      description: 'short',
      params: {
        brand: '',
        color: '',
        condition: '',
        model: '',
        type: '',
      },
      price: String(MAX_ITEM_PRICE + 1),
      title: 'TV',
    });

    expect(errors.title).toBeTruthy();
    expect(errors.price).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(hasItemEditFormErrors(errors)).toBe(true);
  });

  it('validates select values against allowed options', () => {
    const errors = validateItemEditForm('electronics', {
      description: 'Хорошее устройство с полным комплектом и рабочим состоянием.',
      params: {
        brand: 'Apple',
        color: 'Black',
        condition: 'broken',
        model: 'iPhone',
        type: 'console',
      },
      price: '1000',
      title: 'iPhone',
    });

    expect(errors.params.type).toBeTruthy();
    expect(errors.params.condition).toBeTruthy();
  });

  it('validates numeric characteristic ranges', () => {
    const errors = validateItemEditForm('real_estate', {
      description: 'Светлая квартира рядом с метро и магазинами.',
      params: {
        address: 'ул. Ленина, 1',
        area: '0',
        floor: '501',
        type: 'flat',
      },
      price: '5000000',
      title: 'Квартира',
    });

    expect(errors.params.area).toBeTruthy();
    expect(errors.params.floor).toBeTruthy();
  });
});
