import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { memo, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';

import type { ItemEditChatMessage } from '@/features/item-edit-form/model/use-item-edit-chat';

type ItemEditChatProps = {
  error: string;
  input: string;
  isContextStale: boolean;
  isLoading: boolean;
  messages: ItemEditChatMessage[];
  onChangeInput: (value: string) => void;
  onClearError: () => void;
  onSend: () => void;
};

export const ItemEditChat = memo(({
  error,
  input,
  isContextStale,
  isLoading,
  messages,
  onChangeInput,
  onClearError,
  onSend,
}: ItemEditChatProps) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [isLoading, messages]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        borderTop: theme => `1px solid ${theme.palette.divider}`,
        pt: 2,
      }}
    >
      <Stack spacing={0.5}>
        <Typography fontWeight={700} variant="subtitle1">
          Чат с AI
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Задавай уточняющие вопросы по конкретному объявлению. Контекст карточки передаётся автоматически.
        </Typography>
      </Stack>

      {error ? (
        <Alert
          onClose={onClearError}
          severity="error"
          sx={{ alignItems: 'flex-start' }}
        >
          {error}
        </Alert>
      ) : null}

      {isContextStale ? (
        <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
          Контекст объявления изменился. Ответы выше могли устареть, потому что поля формы уже обновлены.
        </Alert>
      ) : null}

      <Stack
        ref={messagesContainerRef}
        spacing={1}
        sx={{
          border: theme => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          maxHeight: 320,
          minHeight: 220,
          overflowY: 'auto',
          p: 1.25,
          pr: 0.75,
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme => (theme.palette.mode === 'dark' ? '#596473' : '#c5ccd6'),
            border: '2px solid transparent',
            borderRadius: 999,
            backgroundClip: 'padding-box',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
            marginBlock: 8,
          },
        }}
      >
        {messages.length > 0 ? (
          messages.map(message => (
            <Box
              key={message.id}
              sx={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor:
                  message.role === 'user'
                    ? 'primary.main'
                    : 'action.hover',
                borderRadius: 2,
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                maxWidth: '88%',
                px: 1.5,
                py: 1,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body2">{message.content}</Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" variant="body2">
            Пока сообщений нет. Например: «Какие детали стоит добавить в описание?» или «Почему такая цена выглядит разумной?»
          </Typography>
        )}

        {isLoading ? (
          <Stack alignItems="flex-start" direction="row" spacing={1}>
            <CircularProgress size={16} />
            <Typography color="text.secondary" variant="body2">
              AI печатает ответ...
            </Typography>
          </Stack>
        ) : null}
      </Stack>

      <TextField
        fullWidth
        label="Сообщение AI"
        multiline
        onChange={event => onChangeInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Например, спроси, чего не хватает в объявлении или что стоит уточнить покупателю."
        rows={4}
        size="small"
        value={input}
      />

      <Stack direction="row" justifyContent="flex-end">
        <Button
          disableElevation
          disabled={!input.trim() || isLoading}
          endIcon={<SendRoundedIcon />}
          onClick={onSend}
          variant="contained"
        >
          Отправить
        </Button>
      </Stack>
    </Stack>
  );
});

ItemEditChat.displayName = 'ItemEditChat';
