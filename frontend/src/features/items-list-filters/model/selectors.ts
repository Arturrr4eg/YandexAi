import { useItemsFiltersStore } from '@/features/items-list-filters/model/filters-store';

export const useItemsQueryFilters = () => {
  const categories = useItemsFiltersStore(state => state.categories);
  const limit = useItemsFiltersStore(state => state.limit);
  const needsRevision = useItemsFiltersStore(state => state.needsRevision);
  const page = useItemsFiltersStore(state => state.page);
  const q = useItemsFiltersStore(state => state.q);
  const sortColumn = useItemsFiltersStore(state => state.sortColumn);
  const sortDirection = useItemsFiltersStore(state => state.sortDirection);

  return {
    categories,
    limit,
    needsRevision,
    page,
    q,
    sortColumn,
    sortDirection,
  };
};

export const useItemsLayout = () => useItemsFiltersStore(state => state.layout);
