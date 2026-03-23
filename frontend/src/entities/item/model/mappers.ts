import type { Item, ItemListCard } from '@/entities/item/model/types';

type ListDto = {
  id: number;
  category: Item['category'];
  title: string;
  price: number | null;
  needsRevision: boolean;
};

export const mapListDto = (dto: ListDto): ItemListCard => ({
  id: dto.id,
  title: dto.title,
  price: dto.price,
  category: dto.category,
  needsRevision: dto.needsRevision,
});
