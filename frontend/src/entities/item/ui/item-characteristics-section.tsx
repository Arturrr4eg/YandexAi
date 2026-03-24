import { Box, Stack, Typography } from '@mui/material';

import type { ItemCharacteristicViewModel } from '@/entities/item/model/characteristics';

type ItemCharacteristicsSectionProps = {
  characteristics: ItemCharacteristicViewModel[];
};

export const ItemCharacteristicsSection = ({ characteristics }: ItemCharacteristicsSectionProps) => (
  <Stack
    spacing={2}
    sx={{
      borderBottom: theme => `1px solid ${theme.palette.divider}`,
      flexGrow: 1,
      pb: 3,
      pt: 3,
    }}
  >
    <Typography fontWeight={700} variant="h6">
      Характеристики
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
      }}
    >
      {characteristics.length > 0 ? (
        characteristics.map(field => (
          <Stack
            key={field.key}
            spacing={0.75}
            sx={{
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              minHeight: 72,
              pb: 1.25,
            }}
          >
            <Typography color="text.secondary" variant="caption">
              {field.label}
            </Typography>
            <Typography fontWeight={600} variant="body1">
              {field.value}
            </Typography>
          </Stack>
        ))
      ) : (
        <Typography color="text.secondary" variant="body2">
          Характеристики пока не заполнены.
        </Typography>
      )}
    </Box>
  </Stack>
);
