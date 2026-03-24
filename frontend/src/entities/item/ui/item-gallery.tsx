import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { MuiImagePlaceholder } from '@/shared/ui/mui-image-placeholder';

type ItemGalleryProps = {
  previewCount?: number;
};

type GalleryPreview = {
  id: number;
  label: string;
};

export const ItemGallery = ({ previewCount = 5 }: ItemGalleryProps) => {
  const previews = useMemo<GalleryPreview[]>(
    () =>
      Array.from({ length: Math.max(previewCount, 1) }, (_, index) => ({
        id: index,
        label: `Изображение ${index + 1}`,
      })),
    [previewCount],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activePreview = previews[activeIndex] ?? previews[0];
  const thumbnails = previews.slice(1);

  const openPreview = (index: number) => {
    setActiveIndex(index);
    setIsDialogOpen(true);
  };

  return (
    <>
    <Stack
      spacing={1.5}
      sx={{
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        height: '100%',
        pb: 3,
        }}
      >
        <Box
          onClick={() => openPreview(activeIndex)}
          sx={{
            alignItems: 'center',
            backgroundColor: 'action.hover',
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            cursor: 'zoom-in',
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
            minHeight: { xs: 280, md: 340 },
            overflow: 'hidden',
            p: 3,
          }}
        >
          <MuiImagePlaceholder iconSize={132} label={activePreview.label} />
        </Box>

        {thumbnails.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridAutoColumns: { xs: '88px', md: '104px' },
            gridAutoFlow: 'column',
            overflowX: 'auto',
            pb: 0.5,
            pt: 0.5,
            scrollbarWidth: 'thin',
          }}
        >
            {thumbnails.map((item, index) => {
              const previewIndex = index + 1;

              return (
                <Box
                  key={item.id}
                  onClick={() => openPreview(previewIndex)}
                  sx={{
                    alignItems: 'center',
                    aspectRatio: '1 / 1',
                    backgroundColor: 'action.hover',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'zoom-in',
                    display: 'flex',
                    flexShrink: 0,
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: 1.25,
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <MuiImagePlaceholder iconSize={40} label={item.label} />
                </Box>
              );
            })}
          </Box>
        ) : null}
      </Stack>

      <Dialog
        disableRestoreFocus
        fullWidth
        maxWidth="lg"
        onClose={() => setIsDialogOpen(false)}
        open={isDialogOpen}
        slotProps={{
          paper: {
            sx: {
              backgroundImage: 'none',
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setIsDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              zIndex: 1,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>

          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'action.hover',
              display: 'flex',
              justifyContent: 'center',
              minHeight: { xs: 360, md: 640 },
              p: { xs: 5, md: 8 },
            }}
          >
            <MuiImagePlaceholder iconSize={220} label={activePreview.label} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
