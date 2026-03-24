import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { useItemQuery } from '@/entities/item/api/item-api';
import { getItemCharacteristics } from '@/entities/item/model/characteristics';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { MuiImagePlaceholder } from '@/shared/ui/mui-image-placeholder';
import { PageError, PageLoader } from '@/shared/ui/page-state';

const getMissingFields = (description: string | undefined, fields: ReturnType<typeof getItemCharacteristics>) => {
  const missing: string[] = [];

  if (!description?.trim()) {
    missing.push('Описание');
  }

  fields.forEach(field => {
    if (field.isMissing) {
      missing.push(field.label);
    }
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

  const item = query.data;
  const characteristics = getItemCharacteristics(item);
  const missingFields = getMissingFields(item.description, characteristics);

  return (
    <Stack spacing={2.5}>
      <Stack
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Stack spacing={0.75}>
          <Typography component="h1" fontWeight={800} variant="h4">
            {item.title}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.4, sm: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Опубликовано: {formatDate(item.createdAt)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Обновлено: {formatDate(item.updatedAt)}
            </Typography>
          </Stack>
        </Stack>

        <Typography fontWeight={800} variant="h4">
          {formatPrice(item.price)}
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

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              alignItems: 'center',
              backgroundColor: 'action.hover',
              border: theme => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              display: 'flex',
              height: '100%',
              justifyContent: 'center',
              minHeight: { xs: 280, md: 420 },
              overflow: 'hidden',
              p: 3,
            }}
          >
            <MuiImagePlaceholder iconSize={132} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            {item.needsRevision ? (
              <Alert
                severity="warning"
                sx={{
                  alignItems: 'flex-start',
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? '#3A2E1F' : '#F9F1E6'),
                  borderRadius: 3,
                }}
              >
                <Typography fontWeight={700} gutterBottom variant="subtitle2">
                  Требуются доработки
                </Typography>
                <Typography variant="body2">
                  Заполните недостающие поля, чтобы карточка выглядела полной и аккуратной.
                </Typography>
                {missingFields.length > 0 ? (
                  <Box component="ul" sx={{ m: 0, pl: 2.5, pt: 1 }}>
                    {missingFields.map(field => (
                      <Box component="li" key={field} sx={{ color: 'text.secondary' }}>
                        <Typography color="inherit" variant="body2">
                          {field}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Alert>
            ) : null}

            <Paper
              elevation={0}
              sx={{
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                flexGrow: 1,
                p: { xs: 2, md: 2.5 },
              }}
            >
              <Stack spacing={2}>
                <Typography fontWeight={700} variant="h6">
                  Характеристики
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.25,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {characteristics.map(field => (
                    <Box
                      key={field.key}
                      sx={{
                        backgroundColor: field.isMissing ? 'action.hover' : 'background.default',
                        border: theme => `1px solid ${theme.palette.divider}`,
                        borderRadius: 2.5,
                        minHeight: 84,
                        p: 1.5,
                      }}
                    >
                      <Stack spacing={0.9}>
                        <Typography color="text.secondary" variant="caption">
                          {field.label}
                        </Typography>
                        <Typography fontWeight={600} variant="body1">
                          {field.value}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          border: theme => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Typography fontWeight={700} mb={1.25} variant="h6">
          Описание
        </Typography>
        <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }} variant="body1">
          {item.description?.trim() || 'Описание пока не заполнено.'}
        </Typography>
      </Paper>
    </Stack>
  );
};
