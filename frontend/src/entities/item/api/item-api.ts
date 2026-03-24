import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mapListDto } from '@/entities/item/model/mappers';
import type {
  GetItemsParams,
  Item,
  ItemListCard,
  UpdateItemInput,
} from '@/entities/item/model/types';
import { httpClient } from '@/shared/api/http-client';

type ItemsResponse = {
  items: Array<{
    id: number;
    category: Item['category'];
    title: string;
    price: number | null;
    needsRevision: boolean;
  }>;
  total: number;
};

const buildQueryParams = (params: GetItemsParams): URLSearchParams => {
  const query = new URLSearchParams();

  query.set('q', params.q);
  query.set('limit', String(params.limit));
  query.set('skip', String(params.skip));
  query.set('sortColumn', params.sortColumn);
  query.set('sortDirection', params.sortDirection);

  if (params.needsRevision) {
    query.set('needsRevision', 'true');
  }
  if (params.categories.length > 0) {
    query.set('categories', params.categories.join(','));
  }

  return query;
};

export const useItemsQuery = (params: GetItemsParams) =>
  useQuery({
    queryKey: ['items', params],
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const { data } = await httpClient.get<ItemsResponse>('/items', {
        params: buildQueryParams(params),
        signal,
      });

      const mapped: ItemListCard[] = data.items.map(item => mapListDto(item));

      return { items: mapped, total: data.total };
    },
  });

export const useItemQuery = (id: number | null) =>
  useQuery({
    queryKey: ['item', id],
    enabled: id !== null,
    queryFn: async ({ signal }) => {
      const { data } = await httpClient.get<Item>(`/items/${id}`, { signal });
      return data;
    },
  });

export const useUpdateItemMutation = () =>
  {
    const queryClient = useQueryClient();

    return useMutation({
    mutationFn: async ({ id, input, category }: { id: number; input: UpdateItemInput; category: Item['category'] }) => {
      const { data } = await httpClient.put<{ success: boolean }>(`/items/${id}`, {
        category,
        ...input,
      });
      return { data, id };
    },
    onSuccess: async ({ id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['item', id] }),
        queryClient.invalidateQueries({ queryKey: ['items'] }),
      ]);
    },
  });
};
