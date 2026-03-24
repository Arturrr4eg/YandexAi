import { Stack, Typography } from '@mui/material';

type ItemDescriptionSectionProps = {
  description?: string;
};

export const ItemDescriptionSection = ({ description }: ItemDescriptionSectionProps) => (
  <Stack
    spacing={1.25}
    sx={{
      pt: 3,
    }}
  >
    <Typography fontWeight={700} variant="h6">
      Описание
    </Typography>
    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }} variant="body1">
      {description?.trim() || 'Описание пока не заполнено.'}
    </Typography>
  </Stack>
);
