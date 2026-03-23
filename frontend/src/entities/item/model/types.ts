export const ITEM_CATEGORIES = ['auto', 'real_estate', 'electronics'] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type Item = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  category: ItemCategory;
  params: Record<string, string | number | undefined>;
  needsRevision: boolean;
};

export type ItemListCard = {
  id: number;
  title: string;
  price: number | null;
  category: ItemCategory;
  needsRevision: boolean;
};

export type GetItemsParams = {
  q: string;
  limit: number;
  skip: number;
  categories: ItemCategory[];
  needsRevision: boolean;
  sortColumn: 'title' | 'createdAt';
  sortDirection: 'asc' | 'desc';
};

export type UpdateItemInput = {
  title: string;
  description?: string;
  price: number;
  params: Record<string, string | number | undefined>;
};
