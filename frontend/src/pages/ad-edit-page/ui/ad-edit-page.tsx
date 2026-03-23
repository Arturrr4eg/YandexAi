import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItemQuery, useUpdateItemMutation } from '@/entities/item/api/item-api';
import { llmApi } from '@/shared/api/llm-api';
import { PageError, PageLoader } from '@/shared/ui/page-state';

type FormState = {
  title: string;
  price: string;
  description: string;
};

const draftKey = (id: number) => `draft_item_${id}`;

export const AdEditPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ? Number(params.id) : null;
  const itemQuery = useItemQuery(id);
  const updateMutation = useUpdateItemMutation();

  const [form, setForm] = useState<FormState | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [formError, setFormError] = useState('');

  const item = itemQuery.data;

  useEffect(() => {
    if (!id || !item) return;

    const saved = localStorage.getItem(draftKey(id));
    if (saved) {
      setForm(JSON.parse(saved) as FormState);
      return;
    }

    setForm({
      title: item.title,
      price: item.price?.toString() ?? '0',
      description: item.description ?? '',
    });
  }, [id, item]);

  useEffect(() => {
    if (!id || !form) return;
    localStorage.setItem(draftKey(id), JSON.stringify(form));
  }, [form, id]);

  const llmContext = useMemo(() => {
    if (!item || !form) return '';
    return JSON.stringify(
      {
        category: item.category,
        title: form.title,
        description: form.description,
        price: form.price,
        params: item.params,
      },
      null,
      2,
    );
  }, [form, item]);

  if (!id) return <PageError message="Некорректный id объявления." />;
  if (itemQuery.isPending || !form) return <PageLoader />;
  if (itemQuery.isError || !item) return <PageError message="Не удалось загрузить данные объявления." />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');

    try {
      await updateMutation.mutateAsync({
        id,
        category: item.category,
        input: {
          title: form.title.trim(),
          price: Number(form.price),
          description: form.description.trim(),
          params: item.params,
        },
      });
      localStorage.removeItem(draftKey(id));
      navigate(`/ads/${id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    }
  };

  const askDescription = async () => {
    setIsAskingAi(true);
    try {
      const answer = await llmApi.generateDescription(llmContext);
      setAiResponse(answer);
    } catch (error) {
      setAiResponse(error instanceof Error ? error.message : 'Ошибка AI-запроса.');
    } finally {
      setIsAskingAi(false);
    }
  };

  const askPrice = async () => {
    setIsAskingAi(true);
    try {
      const answer = await llmApi.estimatePrice(llmContext);
      setAiResponse(answer);
    } catch (error) {
      setAiResponse(error instanceof Error ? error.message : 'Ошибка AI-запроса.');
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <Stack component="section" spacing={2.5}>
      <Typography component="h1" fontWeight={800} variant="h4">
        Редактирование объявления
      </Typography>

      {formError ? <Alert severity="error">{formError}</Alert> : null}

      <Stack component="form" onSubmit={onSubmit} spacing={1.6}>
        <TextField disabled label="Категория" value={item.category} />
        <TextField
          label="Название"
          onChange={event =>
            setForm(current => (current ? { ...current, title: event.target.value } : current))
          }
          required
          value={form.title}
        />
        <TextField
          label="Цена"
          onChange={event =>
            setForm(current => (current ? { ...current, price: event.target.value } : current))
          }
          required
          slotProps={{ htmlInput: { min: 0 } }}
          type="number"
          value={form.price}
        />
        <TextField
          helperText={`${form.description.length} / 1000`}
          label="Описание"
          multiline
          onChange={event =>
            setForm(current => (current ? { ...current, description: event.target.value } : current))
          }
          rows={8}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          value={form.description}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <Button color="warning" disabled={isAskingAi} onClick={askDescription} variant="contained">
            {isAskingAi ? 'Запрос к AI...' : 'Придумать / улучшить описание'}
          </Button>
          <Button color="warning" disabled={isAskingAi} onClick={askPrice} variant="contained">
            {isAskingAi ? 'Запрос к AI...' : 'Узнать рыночную цену'}
          </Button>
        </Stack>

        {aiResponse ? (
          <Paper
            elevation={0}
            sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}
          >
            <Stack spacing={1.2}>
              <Typography fontWeight={700} variant="subtitle1">
                Ответ AI
              </Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }} variant="body2">
                {aiResponse}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() =>
                    setForm(current => (current ? { ...current, description: aiResponse } : current))
                  }
                  variant="contained"
                >
                  Применить в описание
                </Button>
                <Button onClick={() => setAiResponse('')} variant="outlined">
                  Закрыть
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button disabled={updateMutation.isPending} type="submit" variant="contained">
            {updateMutation.isPending ? 'Сохраняем...' : 'Сохранить'}
          </Button>
          <Button component={Link} to={`/ads/${id}`} variant="outlined">
            Отменить
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};
