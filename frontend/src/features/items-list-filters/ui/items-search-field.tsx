import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';
import { memo, useEffect, useState } from 'react';

import { useDebouncedValue } from '@/shared/lib/use-debounced-value';

type Props = {
  delayMs: number;
  initialValue: string;
  onDebouncedChange: (value: string) => void;
  queryValue: string;
};

export const ItemsSearchField = memo(({ delayMs, initialValue, onDebouncedChange, queryValue }: Props) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(inputValue, delayMs);

  useEffect(() => {
    if (debouncedValue !== queryValue) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange, queryValue]);

  return (
    <TextField
      fullWidth
      onChange={event => setInputValue(event.target.value)}
      placeholder="Найти объявление..."
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="disabled" fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      size="small"
      sx={{ flex: 1, minWidth: 0 }}
      value={inputValue}
    />
  );
});
