import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import type { ItemListCard } from '@/entities/item/model/types';
import { formatPrice } from '@/shared/lib/format';
import { MuiImagePlaceholder } from '@/shared/ui/mui-image-placeholder';

type Props = {
  item: ItemListCard;
  layout: 'grid' | 'list';
};

const categoryLabel: Record<ItemListCard['category'], string> = {
  auto: 'Авто',
  electronics: 'Электроника',
  real_estate: 'Недвижимость',
};

export const ItemCard = ({ item, layout }: Props) => (
  <Card
    elevation={0}
    sx={{
      border: theme => `1px solid ${theme.palette.divider}`,
      display: 'flex',
      flexDirection: layout === 'list' ? 'row' : 'column',
      overflow: 'hidden',
    }}
  >
    <CardActionArea
      component={Link}
      sx={{
        alignItems: 'stretch',
        display: 'flex',
        flexDirection: layout === 'list' ? 'row' : 'column',
        justifyContent: 'stretch',
        width: '100%',
      }}
      to={`/ads/${item.id}`}
    >
      <Stack
        alignItems="center"
        bgcolor="action.hover"
        justifyContent="center"
        sx={{
          minHeight: layout === 'list' ? 136 : 148,
          minWidth: layout === 'list' ? 152 : '100%',
        }}
      >
        <MuiImagePlaceholder
          iconSize={layout === 'list' ? 44 : 48}
          label="Превью объявления"
        />
      </Stack>
      <CardContent sx={{ flexGrow: 1, p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack spacing={0.75}>
          <Chip label={categoryLabel[item.category]} size="small" sx={{ width: 'fit-content' }} />
          <Typography lineHeight={1.25} variant="body2">
            {item.title}
          </Typography>
          <Typography fontWeight={700} variant="body2">
            {formatPrice(item.price)}
          </Typography>
          {item.needsRevision ? (
            <Chip
              color="warning"
              label={
                <Stack alignItems="center" direction="row" spacing={0.75}>
                  <span
                    style={{
                      backgroundColor: 'currentColor',
                      borderRadius: '50%',
                      display: 'inline-block',
                      height: 6,
                      width: 6,
                    }}
                  />
                  <span>Требует доработок</span>
                </Stack>
              }
              size="small"
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />
          ) : null}
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);
