import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { useItemQuery } from '@/entities/item/api/item-api';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { MuiImagePlaceholder } from '@/shared/ui/mui-image-placeholder';
import { PageError, PageLoader } from '@/shared/ui/page-state';

const getMissingFields = (item: { description?: string; params: Record<string, unknown> }) => {
  const missing: string[] = [];
  if (!item.description?.trim()) missing.push('Описание');

  Object.entries(item.params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') missing.push(key);
  });

  return missing;
};

export const AdDetailsPage = () => {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const query = useItemQuery(id);

  if (!id) return <PageError message="Некорректный id объявления." />;
  if (query.isPending) return <PageLoader />;
  if (query.isError || !query.data) return <PageError message="Не удалось загрузить объявление." />;

  const missingFields = getMissingFields({
    description: query.data.description,
    params: query.data.params,
  });

  return (
    <Stack spacing={2.5}>
      <Stack
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" fontWeight={800} variant="h4">
            {query.data.title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Опубликовано: {formatDate(query.data.createdAt)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Обновлено: {formatDate(query.data.updatedAt)}
          </Typography>
        </Stack>
        <Typography fontWeight={800} variant="h4">
          {formatPrice(query.data.price)}
        </Typography>
      </Stack>

      <Divider />

      <Stack direction="row" spacing={1.2}>
        <Button component={Link} to="/ads" variant="outlined">
          К списку
        </Button>
        <Button component={Link} to={`/ads/${id}/edit`} variant="contained">
          Редактировать
        </Button>
      </Stack>

      {missingFields.length > 0 ? (
        <Alert severity="warning">
          <Typography fontWeight={700} variant="subtitle2">
            Требуются доработки
          </Typography>
          <List dense sx={{ pl: 2 }}>
            {missingFields.map(field => (
              <ListItem key={field} sx={{ display: 'list-item', py: 0 }}>
                <ListItemText primary={field} />
              </ListItem>
            ))}
          </List>
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Paper
          elevation={0}
          sx={{
            alignItems: 'center',
            border: theme => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flex: '0 0 360px',
            justifyContent: 'center',
            minHeight: 320,
            p: 2,
          }}
        >
          <MuiImagePlaceholder iconSize={88} />
        </Paper>

        <Paper elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, flex: 1, p: 2 }}>
          <Stack spacing={1.2}>
            <Typography fontWeight={700} variant="h6">
              Характеристики
            </Typography>
            {Object.entries(query.data.params).map(([key, value]) => (
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                key={key}
                spacing={1}
              >
                <Chip label={key} size="small" variant="outlined" />
                <Typography variant="body2">{String(value)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Box>
        <Typography fontWeight={700} mb={1} variant="h6">
          Описание
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {query.data.description?.trim() || 'Описание пока не заполнено.'}
        </Typography>
      </Box>
    </Stack>
  );
};
