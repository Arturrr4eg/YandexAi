import type { Item, ItemCategory } from '@/entities/item/model/types';

type CharacteristicDefinition = {
  key: string;
  label: string;
  format?: (value: string | number | undefined) => string;
};

const formatOptionalValue = (value: string | number | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 'Не заполнено';
  }

  return String(value);
};

const formatTransmission = (value: string | number | undefined) => {
  const labels: Record<string, string> = {
    automatic: 'Автомат',
    manual: 'Механика',
  };

  if (typeof value !== 'string' || value.length === 0) {
    return 'Не заполнено';
  }

  return labels[value] ?? value;
};

const formatRealEstateType = (value: string | number | undefined) => {
  const labels: Record<string, string> = {
    flat: 'Квартира',
    house: 'Дом',
    room: 'Комната',
  };

  if (typeof value !== 'string' || value.length === 0) {
    return 'Не заполнено';
  }

  return labels[value] ?? value;
};

const formatElectronicsType = (value: string | number | undefined) => {
  const labels: Record<string, string> = {
    phone: 'Телефон',
    laptop: 'Ноутбук',
    misc: 'Другое',
  };

  if (typeof value !== 'string' || value.length === 0) {
    return 'Не заполнено';
  }

  return labels[value] ?? value;
};

const formatCondition = (value: string | number | undefined) => {
  const labels: Record<string, string> = {
    new: 'Новый',
    used: 'Б/у',
  };

  if (typeof value !== 'string' || value.length === 0) {
    return 'Не заполнено';
  }

  return labels[value] ?? value;
};

const formatNumberWithUnit =
  (unit: string) =>
  (value: string | number | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return 'Не заполнено';
    }

    return `${value} ${unit}`;
  };

export const itemCharacteristicsByCategory: Record<ItemCategory, CharacteristicDefinition[]> = {
  auto: [
    { key: 'brand', label: 'Бренд', format: formatOptionalValue },
    { key: 'model', label: 'Модель', format: formatOptionalValue },
    { key: 'yearOfManufacture', label: 'Год выпуска', format: formatOptionalValue },
    { key: 'transmission', label: 'Коробка передач', format: formatTransmission },
    { key: 'mileage', label: 'Пробег', format: formatNumberWithUnit('км') },
    { key: 'enginePower', label: 'Мощность двигателя', format: formatNumberWithUnit('л.с.') },
  ],
  real_estate: [
    { key: 'type', label: 'Тип недвижимости', format: formatRealEstateType },
    { key: 'address', label: 'Адрес', format: formatOptionalValue },
    { key: 'area', label: 'Площадь', format: formatNumberWithUnit('м²') },
    { key: 'floor', label: 'Этаж', format: formatOptionalValue },
  ],
  electronics: [
    { key: 'type', label: 'Тип устройства', format: formatElectronicsType },
    { key: 'brand', label: 'Бренд', format: formatOptionalValue },
    { key: 'model', label: 'Модель', format: formatOptionalValue },
    { key: 'condition', label: 'Состояние', format: formatCondition },
    { key: 'color', label: 'Цвет', format: formatOptionalValue },
  ],
};

export const getItemCharacteristics = (item: Item) =>
  itemCharacteristicsByCategory[item.category].map(field => ({
    key: field.key,
    label: field.label,
    value: field.format ? field.format(item.params[field.key]) : formatOptionalValue(item.params[field.key]),
    isMissing:
      item.params[field.key] === null || item.params[field.key] === undefined || item.params[field.key] === '',
  }));
