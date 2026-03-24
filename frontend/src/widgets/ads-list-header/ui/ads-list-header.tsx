import { Card, FormControl, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';

import { useItemsFiltersStore } from '@/features/items-list-filters/model/filters-store';
import { useItemsQueryFilters } from '@/features/items-list-filters/model/selectors';
import { ItemsSearchField } from '@/features/items-list-filters/ui/items-search-field';
import { ItemsLayoutToggle } from '@/features/items-layout-toggle/ui/items-layout-toggle';
import { ThemeToggle } from '@/features/theme-toggle/ui/theme-toggle';

type Props = {
  resetToken: number;
  topOffset: { xs: number; md: number };
  total: number;
};

const sortOptions = [
  { label: 'По новизне (сначала новые)', value: 'createdAt:desc' },
  { label: 'По новизне (сначала старые)', value: 'createdAt:asc' },
  { label: 'По названию (А-Я)', value: 'title:asc' },
  { label: 'По названию (Я-А)', value: 'title:desc' },
] as const;

export const AdsListHeader = ({ resetToken, topOffset, total }: Props) => {
  const { q, sortColumn, sortDirection } = useItemsQueryFilters();
  const setQuery = useItemsFiltersStore(state => state.setQuery);
  const setSort = useItemsFiltersStore(state => state.setSort);

  const onSortChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [column, direction] = event.target.value.split(':') as ['title' | 'createdAt', 'asc' | 'desc'];
    setSort(column, direction);
  };

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        left: { xs: 12, sm: 16, md: 24 },
        p: { xs: 1.5, md: 2 },
        position: 'fixed',
        right: { xs: 12, sm: 16, md: 24 },
        top: { xs: `${topOffset.xs}px`, md: `${topOffset.md}px` },
        zIndex: theme => theme.zIndex.appBar + 1,
      }}
    >
      <Stack spacing={1.2}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Stack spacing={0.25}>
            <Typography component="h1" fontWeight={800} variant="h5">
              Мои объявления
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {total} объявлений
            </Typography>
          </Stack>
          <ThemeToggle />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.8}
          sx={{ alignItems: { xs: 'stretch', md: 'center' }, width: '100%' }}
        >
          <ItemsSearchField
            delayMs={500}
            initialValue={q}
            key={resetToken}
            onDebouncedChange={setQuery}
            queryValue={q}
          />

          <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <ItemsLayoutToggle />
            <FormControl size="small" sx={{ width: { xs: '100%', md: 290 } }}>
              <TextField onChange={onSortChange} select size="small" value={`${sortColumn}:${sortDirection}`}>
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};
