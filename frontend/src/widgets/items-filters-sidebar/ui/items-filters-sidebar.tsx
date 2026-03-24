import { Button, Card, Checkbox, FormControlLabel, FormGroup, Stack, Switch, Typography } from '@mui/material';

import { itemCategoryLabels } from '@/entities/item/model/presentation';
import { ITEM_CATEGORIES } from '@/entities/item/model/types';
import { useItemsFiltersStore } from '@/features/items-list-filters/model/filters-store';
import { useItemsQueryFilters } from '@/features/items-list-filters/model/selectors';

type Props = {
  onReset: () => void;
  topOffset: { xs: number; md: number };
};

export const ItemsFiltersSidebar = ({ onReset, topOffset }: Props) => {
  const { categories, needsRevision } = useItemsQueryFilters();
  const reset = useItemsFiltersStore(state => state.reset);
  const setNeedsRevision = useItemsFiltersStore(state => state.setNeedsRevision);
  const toggleCategory = useItemsFiltersStore(state => state.toggleCategory);

  return (
    <Card
      elevation={0}
      sx={{
        border: theme => `1px solid ${theme.palette.divider}`,
        p: 2,
        position: 'sticky',
        top: { xs: `${topOffset.xs}px`, md: `${topOffset.md}px` },
      }}
    >
      <Stack spacing={1.5}>
        <Typography fontWeight={700} variant="subtitle1">
          Фильтры
        </Typography>

        <FormGroup>
          {ITEM_CATEGORIES.map(category => (
            <FormControlLabel
              control={
                <Checkbox checked={categories.includes(category)} onChange={() => toggleCategory(category)} size="small" />
              }
              key={category}
              label={itemCategoryLabels[category]}
            />
          ))}
        </FormGroup>

        <FormControlLabel
          control={<Switch checked={needsRevision} onChange={event => setNeedsRevision(event.target.checked)} />}
          label="Только требующие доработок"
          labelPlacement="start"
          sx={{ justifyContent: 'space-between', ml: 0 }}
        />

        <Button
          onClick={() => {
            reset();
            onReset();
          }}
          variant="outlined"
        >
          Сбросить фильтры
        </Button>
      </Stack>
    </Card>
  );
};
