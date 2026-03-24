import { Box, Pagination, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';

import type { ItemListCard } from '@/entities/item/model/types';
import { ItemCard } from '@/entities/item/ui/item-card';
import { useItemsFiltersStore } from '@/features/items-list-filters/model/filters-store';
import { useItemsLayout } from '@/features/items-list-filters/model/selectors';

type Props = {
  items: ItemListCard[];
  total: number;
};

export const ItemsCatalog = ({ items, total }: Props) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));

  const layout = useItemsLayout();
  const limit = useItemsFiltersStore(state => state.limit);
  const page = useItemsFiltersStore(state => state.page);
  const setPage = useItemsFiltersStore(state => state.setPage);

  const itemsCount = items.length;
  const maxColumns = isXlUp ? 5 : isLgUp ? 4 : isMdUp ? 3 : isSmUp ? 2 : 1;

  const gridColumns = useMemo(() => {
    if (maxColumns <= 1) return 1;

    for (let cols = maxColumns; cols >= 2; cols -= 1) {
      if (itemsCount % cols !== 1) return cols;
    }

    return 1;
  }, [itemsCount, maxColumns]);

  const renderedGridColumns = itemsCount === 1 && maxColumns > 1 ? 2 : gridColumns;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: layout === 'grid' ? `repeat(${renderedGridColumns}, minmax(0, 1fr))` : '1fr',
        }}
      >
        {items.map(item => (
          <ItemCard item={item} key={item.id} layout={layout} />
        ))}
      </Box>

      <Stack alignItems="center" sx={{ mt: 'auto', pt: 1 }}>
        <Pagination
          color="primary"
          count={totalPages}
          onChange={(_event, nextPage) => setPage(nextPage)}
          page={page}
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>
    </>
  );
};
