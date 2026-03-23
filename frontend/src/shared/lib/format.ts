const numberFormatter = new Intl.NumberFormat('ru-RU');
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export const formatPrice = (value: number | null): string =>
  value === null
    ? 'Цена не указана'
    : `${numberFormatter.format(value).replaceAll('\u00A0', ' ')} ₽`;

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));
