import { Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { useItemQuery } from '@/entities/item/api/item-api';
import {
  getFilledItemCharacteristics,
  getMissingItemCompletionLabels,
} from '@/entities/item/model/characteristics';
import { ItemCharacteristicsSection } from '@/entities/item/ui/item-characteristics-section';
import { ItemDescriptionSection } from '@/entities/item/ui/item-description-section';
import { ItemGallery } from '@/entities/item/ui/item-gallery';
import { ItemRevisionAlert } from '@/entities/item/ui/item-revision-alert';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { PageError, PageLoader } from '@/shared/ui/page-state';

export const AdDetailsPage = () => {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const query = useItemQuery(id);

  if (!id) return <PageError message="Некорректный id объявления." />;
  if (query.isPending) return <PageLoader />;
  if (query.isError || !query.data) return <PageError message="Не удалось загрузить объявление." />;

  const item = query.data;
  const characteristics = getFilledItemCharacteristics(item);
  const missingFields = getMissingItemCompletionLabels(item);

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
          <ItemGallery />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            {item.needsRevision ? <ItemRevisionAlert missingFields={missingFields} /> : null}
            <ItemCharacteristicsSection characteristics={characteristics} />
          </Stack>
        </Grid>
      </Grid>

      <ItemDescriptionSection description={item.description} />
    </Stack>
  );
};
