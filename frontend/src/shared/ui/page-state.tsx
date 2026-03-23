import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

type LoaderProps = {
  label?: string;
};

type ErrorProps = {
  message: string;
};

export const PageLoader = ({ label = 'Загрузка...' }: LoaderProps) => (
  <Stack alignItems="center" py={8} spacing={2}>
    <CircularProgress size={28} />
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
  </Stack>
);

export const PageError = ({ message }: ErrorProps) => (
  <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 560 }}>
    {message}
  </Alert>
);
