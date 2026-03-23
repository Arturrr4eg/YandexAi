import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { MouseEvent } from 'react';

import { useItemsFiltersStore } from '@/features/items-list-filters/model/filters-store';

export const ItemsLayoutToggle = () => {
  const layout = useItemsFiltersStore(state => state.layout);
  const setLayout = useItemsFiltersStore(state => state.setLayout);

  const onChange = (_event: MouseEvent<HTMLElement>, value: 'grid' | 'list' | null) => {
    if (!value) return;
    setLayout(value);
  };

  return (
    <ToggleButtonGroup color="primary" exclusive onChange={onChange} size="small" value={layout}>
      <ToggleButton value="grid">
        <GridViewOutlinedIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="list">
        <ViewListOutlinedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
