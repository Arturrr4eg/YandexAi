import type { Item, ItemCategory } from '@/entities/item/model/types';

type CharacteristicOption = {
  label: string;
  value: string;
};

export type ItemCharacteristicDefinition = {
  key: string;
  kind: 'number' | 'select' | 'text';
  label: string;
  options?: CharacteristicOption[];
  placeholder?: string;
  format?: (value: string | number | undefined) => string;
};

const EMPTY_VALUE_LABEL = 'Не заполнено';

const formatOptionalValue = (value: string | number | undefined) => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE_LABEL;
  }

  return String(value);
};

const createEnumFormatter = (labels: Record<string, string>) => (value: string | number | undefined) => {
  if (typeof value !== 'string' || value.length === 0) {
    return EMPTY_VALUE_LABEL;
  }

  return labels[value] ?? value;
};

const formatNumberWithUnit =
  (unit: string) =>
  (value: string | number | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return EMPTY_VALUE_LABEL;
    }

    return `${value} ${unit}`;
  };

const transmissionOptions: CharacteristicOption[] = [
  { label: 'Автомат', value: 'automatic' },
  { label: 'Механика', value: 'manual' },
];

const realEstateTypeOptions: CharacteristicOption[] = [
  { label: 'Квартира', value: 'flat' },
  { label: 'Дом', value: 'house' },
  { label: 'Комната', value: 'room' },
];

const electronicsTypeOptions: CharacteristicOption[] = [
  { label: 'Телефон', value: 'phone' },
  { label: 'Ноутбук', value: 'laptop' },
  { label: 'Другое', value: 'misc' },
];

const conditionOptions: CharacteristicOption[] = [
  { label: 'Новый', value: 'new' },
  { label: 'Б/у', value: 'used' },
];

const formatTransmission = createEnumFormatter(
  Object.fromEntries(transmissionOptions.map(option => [option.value, option.label])),
);
const formatRealEstateType = createEnumFormatter(
  Object.fromEntries(realEstateTypeOptions.map(option => [option.value, option.label])),
);
const formatElectronicsType = createEnumFormatter(
  Object.fromEntries(electronicsTypeOptions.map(option => [option.value, option.label])),
);
const formatCondition = createEnumFormatter(
  Object.fromEntries(conditionOptions.map(option => [option.value, option.label])),
);

export const itemCharacteristicsByCategory: Record<ItemCategory, ItemCharacteristicDefinition[]> = {
  auto: [
    { key: 'brand', kind: 'text', label: 'Бренд', placeholder: 'Например, Volkswagen', format: formatOptionalValue },
    { key: 'model', kind: 'text', label: 'Модель', placeholder: 'Например, Polo', format: formatOptionalValue },
    { key: 'yearOfManufacture', kind: 'number', label: 'Год выпуска', placeholder: 'Например, 2018', format: formatOptionalValue },
    { key: 'transmission', kind: 'select', label: 'Коробка передач', options: transmissionOptions, format: formatTransmission },
    { key: 'mileage', kind: 'number', label: 'Пробег', placeholder: 'Например, 125000', format: formatNumberWithUnit('км') },
    { key: 'enginePower', kind: 'number', label: 'Мощность двигателя', placeholder: 'Например, 150', format: formatNumberWithUnit('л.с.') },
  ],
  real_estate: [
    { key: 'type', kind: 'select', label: 'Тип недвижимости', options: realEstateTypeOptions, format: formatRealEstateType },
    { key: 'address', kind: 'text', label: 'Адрес', placeholder: 'Например, ул. Ленина, 10', format: formatOptionalValue },
    { key: 'area', kind: 'number', label: 'Площадь', placeholder: 'Например, 42', format: formatNumberWithUnit('м²') },
    { key: 'floor', kind: 'number', label: 'Этаж', placeholder: 'Например, 7', format: formatOptionalValue },
  ],
  electronics: [
    { key: 'type', kind: 'select', label: 'Тип устройства', options: electronicsTypeOptions, format: formatElectronicsType },
    { key: 'brand', kind: 'text', label: 'Бренд', placeholder: 'Например, Apple', format: formatOptionalValue },
    { key: 'model', kind: 'text', label: 'Модель', placeholder: 'Например, iPhone 15', format: formatOptionalValue },
    { key: 'condition', kind: 'select', label: 'Состояние', options: conditionOptions, format: formatCondition },
    { key: 'color', kind: 'text', label: 'Цвет', placeholder: 'Например, Черный', format: formatOptionalValue },
  ],
};

export const getItemCharacteristicDefinitions = (category: ItemCategory) => itemCharacteristicsByCategory[category];

export const createItemParamsDraft = (item: Item) =>
  Object.fromEntries(
    getItemCharacteristicDefinitions(item.category).map(field => [field.key, item.params[field.key] ? String(item.params[field.key]) : '']),
  );

export const normalizeItemParamsForUpdate = (
  category: ItemCategory,
  values: Record<string, string>,
): Record<string, string | number | undefined> =>
  Object.fromEntries(
    getItemCharacteristicDefinitions(category).map(field => {
      const rawValue = values[field.key]?.trim() ?? '';

      if (!rawValue) {
        return [field.key, undefined];
      }

      if (field.kind === 'number') {
        return [field.key, Number(rawValue)];
      }

      return [field.key, rawValue];
    }),
  );

export const getItemCharacteristics = (item: Item) =>
  getItemCharacteristicDefinitions(item.category).map(field => ({
    key: field.key,
    label: field.label,
    value: field.format ? field.format(item.params[field.key]) : formatOptionalValue(item.params[field.key]),
    isMissing:
      item.params[field.key] === null || item.params[field.key] === undefined || item.params[field.key] === '',
  }));

export const getFilledItemCharacteristics = (item: Item) =>
  getItemCharacteristics(item).filter(field => !field.isMissing);
