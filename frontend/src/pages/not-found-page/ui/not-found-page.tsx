import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <Stack alignItems="center" py={8} spacing={2}>
    <Typography component="h1" variant="h4">
      Страница не найдена
    </Typography>
    <Button component={Link} to="/ads" variant="contained">
      Перейти к объявлениям
    </Button>
  </Stack>
);
