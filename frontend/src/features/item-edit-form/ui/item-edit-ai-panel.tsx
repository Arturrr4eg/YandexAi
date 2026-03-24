import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import type { AiRequestState, AiRequestStatus } from '@/features/item-edit-form/model/use-item-edit-ai';
import { ItemEditDescriptionDiff } from '@/features/item-edit-form/ui/item-edit-description-diff';

type AiBubbleProps = {
  actionLabel?: string;
  actionText: string;
  children?: ReactNode;
  error?: boolean;
  onAction?: () => void;
  onClose: () => void;
  title: string;
};

type ItemEditAiPanelProps = {
  descriptionAiState: AiRequestState;
  hasDescription: boolean;
  onApplyDescription: () => void;
  onApplyPrice: () => void;
  onAskDescription: () => void;
  onAskPrice: () => void;
  onCloseDescription: () => void;
  onClosePrice: () => void;
  priceAiState: AiRequestState;
};

const aiButtonStyles = {
  backgroundColor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#3A2B1C' : '#F9F1E6'),
  borderRadius: 999,
  boxShadow: 'none',
  color: (theme: Theme) => (theme.palette.mode === 'dark' ? '#FFB65C' : '#FFA940'),
  fontWeight: 600,
  minHeight: 40,
  minWidth: 156,
  px: 1.5,
  py: 0.75,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#473321' : '#F4E4CB'),
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    backgroundColor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#3A2B1C' : '#F9F1E6'),
    boxShadow: 'none',
    color: (theme: Theme) => (theme.palette.mode === 'dark' ? '#FFB65C' : '#FFA940'),
    opacity: 0.72,
  },
} as const;

const speechBubbleStyles = {
  backgroundColor: 'background.paper',
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  borderRadius: 3,
  boxShadow: (theme: Theme) => theme.shadows[4],
  left: 0,
  maxHeight: 280,
  maxWidth: '100%',
  minWidth: 0,
  overflowY: 'auto',
  p: 2,
  position: 'absolute',
  top: 'calc(100% + 10px)',
  width: '100%',
  zIndex: 2,
  '&::after': {
    backgroundColor: 'background.paper',
    borderRight: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    content: '""',
    height: 12,
    left: 24,
    position: 'absolute',
    top: -7,
    transform: 'rotate(45deg)',
    width: 12,
  },
} as const;

const getPriceButtonLabel = (status: AiRequestStatus) => {
  if (status === 'loading') {
    return 'Выполняется запрос';
  }

  if (status === 'success' || status === 'error') {
    return 'Повторить запрос';
  }

  return 'Узнать рыночную цену';
};

const getDescriptionButtonLabel = (status: AiRequestStatus, hasDescription: boolean) => {
  if (status === 'loading') {
    return 'Выполняется запрос';
  }

  if (status === 'success' || status === 'error') {
    return 'Повторить запрос';
  }

  return hasDescription ? 'Улучшить описание' : 'Придумать описание';
};

const createAiButtonIcon = (status: AiRequestStatus) => {
  if (status === 'loading') {
    return <CircularProgress size={16} sx={{ color: '#FFA940' }} thickness={5} />;
  }

  if (status === 'success' || status === 'error') {
    return <AutorenewRoundedIcon fontSize="small" />;
  }

  return <LightbulbOutlinedIcon fontSize="small" />;
};

const AiBubble = ({
  actionLabel,
  actionText,
  children,
  error = false,
  onAction,
  onClose,
  title,
}: AiBubbleProps) => (
  <Box
    sx={{
      ...speechBubbleStyles,
      backgroundColor: error ? '#FFF1F0' : 'background.paper',
      border: (theme: Theme) => (error ? '1px solid #FFCCC7' : `1px solid ${theme.palette.divider}`),
      color: error ? '#CF1322' : 'inherit',
      '&::after': {
        ...speechBubbleStyles['&::after'],
        backgroundColor: error ? '#FFF1F0' : 'background.paper',
        borderRight: error ? '1px solid #FFCCC7' : speechBubbleStyles['&::after'].borderRight,
        borderTop: error ? '1px solid #FFCCC7' : speechBubbleStyles['&::after'].borderTop,
      },
    }}
  >
    <Stack spacing={1.5}>
      <Typography fontWeight={700} variant="subtitle2">
        {title}
      </Typography>

      <Typography color={error ? '#CF1322' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }} variant="body2">
        {actionText}
      </Typography>

      {children}

      <Stack direction="row" spacing={1}>
        {actionLabel && onAction ? (
          <Button disableElevation onClick={onAction} size="small" variant="contained">
            {actionLabel}
          </Button>
        ) : null}
        <Button color={error ? 'error' : 'primary'} onClick={onClose} size="small" variant="outlined">
          Закрыть
        </Button>
      </Stack>
    </Stack>
  </Box>
);

export const ItemEditAiPanel = ({
  descriptionAiState,
  hasDescription,
  onApplyDescription,
  onApplyPrice,
  onAskDescription,
  onAskPrice,
  onCloseDescription,
  onClosePrice,
  priceAiState,
}: ItemEditAiPanelProps) => (
  <Stack spacing={1.5} sx={{ minWidth: 0, mt: { xs: 3, lg: 0 }, width: '100%' }}>
    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start', width: '100%' }}>
      <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', minWidth: 0, position: 'relative' }}>
        {priceAiState.isTooltipOpen ? (
          <AiBubble
            actionLabel={priceAiState.status === 'success' ? 'Применить' : undefined}
            actionText={
              priceAiState.status === 'error'
                ? `${priceAiState.message}\n\nПопробуйте повторить запрос или закройте уведомление`
                : priceAiState.message
            }
            error={priceAiState.status === 'error'}
            onAction={priceAiState.status === 'success' ? onApplyPrice : undefined}
            onClose={onClosePrice}
            title={priceAiState.status === 'error' ? 'Произошла ошибка при запросе к AI' : 'Ответ AI'}
          />
        ) : null}

        <Button
          disableElevation
          disabled={priceAiState.status === 'loading'}
          onClick={onAskPrice}
          startIcon={createAiButtonIcon(priceAiState.status)}
          sx={aiButtonStyles}
          variant="contained"
        >
          {getPriceButtonLabel(priceAiState.status)}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', minWidth: 0, position: 'relative' }}>
        {descriptionAiState.isTooltipOpen ? (
          <AiBubble
            actionLabel={descriptionAiState.status === 'success' ? 'Применить' : undefined}
            actionText={
              descriptionAiState.status === 'error'
                ? `${descriptionAiState.message}\n\nПопробуйте повторить запрос или закройте уведомление`
                : descriptionAiState.message
            }
            error={descriptionAiState.status === 'error'}
            onAction={descriptionAiState.status === 'success' ? onApplyDescription : undefined}
            onClose={onCloseDescription}
            title={descriptionAiState.status === 'error' ? 'Произошла ошибка при запросе к AI' : 'Ответ AI'}
          >
            {descriptionAiState.status === 'success' && descriptionAiState.sourceValue.trim() ? (
              <ItemEditDescriptionDiff
                after={descriptionAiState.appliedValue}
                before={descriptionAiState.sourceValue}
              />
            ) : null}
          </AiBubble>
        ) : null}

        <Button
          disableElevation
          disabled={descriptionAiState.status === 'loading'}
          onClick={onAskDescription}
          startIcon={createAiButtonIcon(descriptionAiState.status)}
          sx={aiButtonStyles}
          variant="contained"
        >
          {getDescriptionButtonLabel(descriptionAiState.status, hasDescription)}
        </Button>
      </Box>
    </Stack>
  </Stack>
);
