import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  isMissingItemDraftValue,
  type ItemCharacteristicDefinition,
} from '@/entities/item/model/characteristics';
import type { ItemEditFieldErrors } from '@/entities/item/model/edit-form-validation';

type ItemEditCategoryFieldsProps = {
  errors: ItemEditFieldErrors['params'];
  fields: ItemCharacteristicDefinition[];
  onBlurField: (key: string) => void;
  onChangeField: (key: string, value: string) => void;
  onClearField: (key: string) => void;
  values: Record<string, string>;
};

const getFieldWarningStyles = (isActive: boolean) => (isActive ? { borderColor: '#FFA940' } : {});

export const ItemEditCategoryFields = ({
  errors,
  fields,
  onBlurField,
  onChangeField,
  onClearField,
  values,
}: ItemEditCategoryFieldsProps) => (
  <Stack
    spacing={2}
    sx={{
      borderBottom: theme => `1px solid ${theme.palette.divider}`,
      pb: 3,
      pt: 3,
    }}
  >
    <Typography fontWeight={700} variant="h6">
      Характеристики
    </Typography>

    {fields.map(field => {
      const value = values[field.key] ?? '';
      const isEmpty = isMissingItemDraftValue(value);
      const hasError = Boolean(errors[field.key]);
      const isSelect = field.kind === 'select';

      return (
        <TextField
          key={field.key}
          error={hasError}
          fullWidth
          helperText={errors[field.key]}
          label={field.label}
          onBlur={() => onBlurField(field.key)}
          onChange={event => onChangeField(field.key, event.target.value)}
          placeholder={field.placeholder}
          select={isSelect}
          size="small"
          slotProps={{
            htmlInput: field.kind === 'number' ? { min: 0 } : undefined,
            input:
              !isSelect && value
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => onClearField(field.key)} size="small">
                          <ClearRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined,
          }}
          sx={{
            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': getFieldWarningStyles(
              isEmpty && !hasError,
            ),
          }}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={value}
        >
          {isSelect
            ? [
                <MenuItem key="empty" value="">
                  Не выбрано
                </MenuItem>,
                ...(field.options ?? []).map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )),
              ]
            : undefined}
        </TextField>
      );
    })}
  </Stack>
);
