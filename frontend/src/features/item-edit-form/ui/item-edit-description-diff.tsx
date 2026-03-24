import { Box, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import { getTextDiff } from '@/shared/lib/text-diff';

type ItemEditDescriptionDiffProps = {
  after: string;
  before: string;
};

const diffTextStyles = {
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  borderRadius: 2,
  color: 'text.secondary',
  minHeight: 132,
  p: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
} as const;

export const ItemEditDescriptionDiff = ({ after, before }: ItemEditDescriptionDiffProps) => {
  const diff = getTextDiff(before, after);

  return (
    <Stack spacing={1.25}>
      <Typography fontWeight={700} variant="subtitle2">
        Было → Стало
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="caption">
            Было
          </Typography>
          <Typography component="div" sx={diffTextStyles} variant="body2">
            {diff.map((part, index) => (
              <Box
                component="span"
                key={`before-${index}`}
                sx={
                  part.type === 'removed'
                    ? {
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.22)' : '#FFF1F0',
                        color: theme => (theme.palette.mode === 'dark' ? '#FF9C96' : '#CF1322'),
                      }
                    : undefined
                }
              >
                {part.type === 'added' ? null : part.value}
              </Box>
            ))}
          </Typography>
        </Stack>

        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="caption">
            Стало
          </Typography>
          <Typography component="div" sx={diffTextStyles} variant="body2">
            {diff.map((part, index) => (
              <Box
                component="span"
                key={`after-${index}`}
                sx={
                  part.type === 'added'
                    ? {
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.22)' : '#F6FFED',
                        color: theme => (theme.palette.mode === 'dark' ? '#B7EB8F' : '#389E0D'),
                      }
                    : undefined
                }
              >
                {part.type === 'removed' ? null : part.value}
              </Box>
            ))}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};
