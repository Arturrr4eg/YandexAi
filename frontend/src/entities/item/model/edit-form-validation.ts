import type { ItemCategory } from '@/entities/item/model/types';
import { getItemCharacteristicDefinitions } from '@/entities/item/model/characteristics';

export const MAX_ITEM_PRICE = 100_000_000_000;

export type ItemEditFormValues = {
  description: string;
  params: Record<string, string>;
  price: string;
  title: string;
};

export type ItemEditFieldErrors = {
  description?: string;
  params: Record<string, string>;
  price?: string;
  title?: string;
};

const currentYear = new Date().getFullYear();

const createEmptyErrors = (): ItemEditFieldErrors => ({
  params: {},
});

const validateTextParam = (key: string, value: string) => {
  const minLengthByKey: Partial<Record<string, number>> = {
    address: 5,
    brand: 2,
    color: 2,
    model: 2,
  };

  const maxLengthByKey: Partial<Record<string, number>> = {
    address: 200,
    brand: 60,
    color: 40,
    model: 80,
  };

  const minLength = minLengthByKey[key];
  const maxLength = maxLengthByKey[key];

  if (minLength && value.length < minLength) {
    return `Минимум ${minLength} символа.`;
  }

  if (maxLength && value.length > maxLength) {
    return `Максимум ${maxLength} символов.`;
  }

  return undefined;
};

const validateNumberParam = (key: string, value: number) => {
  if (key === 'yearOfManufacture') {
    if (!Number.isInteger(value)) return 'Год выпуска должен быть целым числом.';
    if (value < 1900 || value > currentYear + 1) return `Укажите год в диапазоне 1900-${currentYear + 1}.`;
  }

  if (key === 'mileage') {
    if (!Number.isInteger(value)) return 'Пробег должен быть целым числом.';
    if (value < 0 || value > 5_000_000) return 'Пробег должен быть в диапазоне от 0 до 5 000 000 км.';
  }

  if (key === 'enginePower') {
    if (!Number.isInteger(value)) return 'Мощность должна быть целым числом.';
    if (value < 1 || value > 3_000) return 'Мощность должна быть в диапазоне от 1 до 3000 л.с.';
  }

  if (key === 'area') {
    if (value <= 0 || value > 100_000) return 'Площадь должна быть больше 0 и не превышать 100 000 м².';
  }

  if (key === 'floor') {
    if (!Number.isInteger(value)) return 'Этаж должен быть целым числом.';
    if (value < 0 || value > 500) return 'Этаж должен быть в диапазоне от 0 до 500.';
  }

  return undefined;
};

export const validateItemEditForm = (
  category: ItemCategory,
  values: ItemEditFormValues,
): ItemEditFieldErrors => {
  const errors = createEmptyErrors();
  const title = values.title.trim();
  const description = values.description.trim();
  const price = values.price.trim();

  if (title.length < 3) {
    errors.title = 'Название должно содержать минимум 3 символа.';
  } else if (title.length > 120) {
    errors.title = 'Название не должно быть длиннее 120 символов.';
  }

  if (!price) {
    errors.price = 'Укажите цену.';
  } else {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      errors.price = 'Цена должна быть числом.';
    } else if (!Number.isInteger(numericPrice)) {
      errors.price = 'Цена должна быть целым числом.';
    } else if (numericPrice < 0) {
      errors.price = 'Цена не может быть отрицательной.';
    } else if (numericPrice > MAX_ITEM_PRICE) {
      errors.price = 'Цена не может быть больше 100 000 000 000 ₽.';
    }
  }

  if (description && description.length < 10) {
    errors.description = 'Если заполняете описание, сделайте его хотя бы из 10 символов.';
  }

  getItemCharacteristicDefinitions(category).forEach(field => {
    const rawValue = values.params[field.key] ?? '';
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) {
      return;
    }

    if (field.kind === 'select') {
      const allowedValues = field.options?.map(option => option.value) ?? [];

      if (!allowedValues.includes(trimmedValue)) {
        errors.params[field.key] = 'Выберите значение из списка.';
      }

      return;
    }

    if (field.kind === 'text') {
      const textError = validateTextParam(field.key, trimmedValue);

      if (textError) {
        errors.params[field.key] = textError;
      }

      return;
    }

    const numericValue = Number(trimmedValue);

    if (!Number.isFinite(numericValue)) {
      errors.params[field.key] = 'Введите корректное число.';
      return;
    }

    const numberError = validateNumberParam(field.key, numericValue);

    if (numberError) {
      errors.params[field.key] = numberError;
    }
  });

  return errors;
};

export const hasItemEditFormErrors = (errors: ItemEditFieldErrors) =>
  Boolean(errors.title || errors.price || errors.description || Object.keys(errors.params).length > 0);
