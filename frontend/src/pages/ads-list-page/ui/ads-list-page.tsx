import { Box, Grid } from '@mui/material';
import { useState } from 'react';

import { useItemsQuery } from '@/entities/item/api/item-api';
import { useItemsQueryFilters } from '@/features/items-list-filters/model/selectors';
import { PageError, PageLoader } from '@/shared/ui/page-state';
import { AdsListHeader } from '@/widgets/ads-list-header/ui/ads-list-header';
import { ItemsCatalog } from '@/widgets/items-catalog/ui/items-catalog';
import { ItemsFiltersSidebar } from '@/widgets/items-filters-sidebar/ui/items-filters-sidebar';

const listHeaderTop = { xs: 12, md: 16 };
const listHeaderHeight = { xs: 148, md: 128 };
const leftStickyTop = {
  xs: listHeaderTop.xs + listHeaderHeight.xs + 22,
  md: listHeaderTop.md + listHeaderHeight.md + 22,
};

export const AdsListPage = () => {
  const [searchResetToken, setSearchResetToken] = useState(0);
  const filters = useItemsQueryFilters();

  const query = useItemsQuery({
    q: filters.q,
    categories: filters.categories,
    limit: filters.limit,
    needsRevision: filters.needsRevision,
    skip: (filters.page - 1) * filters.limit,
    sortColumn: filters.sortColumn,
    sortDirection: filters.sortDirection,
  });

  if (query.isPending && !query.data) return <PageLoader />;
  if (query.isError) return <PageError message="Не удалось загрузить список объявлений." />;

  return (
    <Box
      sx={{
        minHeight: { xs: 'calc(100vh - 24px)', md: 'calc(100vh - 48px)' },
        pt: {
          xs: `${listHeaderHeight.xs + 12}px`,
          md: `${listHeaderHeight.md + 14}px`,
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.default',
          height: {
            xs: `${listHeaderTop.xs + listHeaderHeight.xs + 4}px`,
            md: `${listHeaderTop.md + listHeaderHeight.md + 4}px`,
          },
          left: 0,
          pointerEvents: 'none',
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: theme => theme.zIndex.appBar,
        }}
      />

      <AdsListHeader resetToken={searchResetToken} topOffset={listHeaderTop} total={query.data.total} />

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ItemsFiltersSidebar
            onReset={() => setSearchResetToken(previous => previous + 1)}
            topOffset={leftStickyTop}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <ItemsCatalog items={query.data.items} total={query.data.total} />
        </Grid>
      </Grid>
    </Box>
  );
};
