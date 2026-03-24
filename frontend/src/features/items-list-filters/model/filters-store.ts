import { create } from 'zustand';

import type { ItemCategory } from '@/entities/item/model/types';

export type SortColumn = 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type ItemLayout = 'grid' | 'list';

type FiltersState = {
  q: string;
  categories: ItemCategory[];
  needsRevision: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  limit: number;
  layout: ItemLayout;
  setQuery: (value: string) => void;
  toggleCategory: (value: ItemCategory) => void;
  setNeedsRevision: (value: boolean) => void;
  setSort: (column: SortColumn, direction: SortDirection) => void;
  setPage: (page: number) => void;
  setLayout: (layout: ItemLayout) => void;
  reset: () => void;
};

const initialState = {
  q: '',
  categories: [] as ItemCategory[],
  needsRevision: false,
  sortColumn: 'createdAt' as SortColumn,
  sortDirection: 'desc' as SortDirection,
  page: 1,
  limit: 10,
  layout: 'grid' as ItemLayout,
};

export const useItemsFiltersStore = create<FiltersState>(set => ({
  ...initialState,
  setQuery: q => set({ q, page: 1 }),
  toggleCategory: value =>
    set(state => ({
      categories: state.categories.includes(value)
        ? state.categories.filter(item => item !== value)
        : [...state.categories, value],
      page: 1,
    })),
  setNeedsRevision: value => set({ needsRevision: value, page: 1 }),
  setSort: (sortColumn, sortDirection) => set({ sortColumn, sortDirection, page: 1 }),
  setPage: page => set({ page }),
  setLayout: layout => set({ layout }),
  reset: () =>
    set(state => ({
      ...initialState,
      layout: state.layout,
    })),
}));
