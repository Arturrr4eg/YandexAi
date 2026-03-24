import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItemQuery, useUpdateItemMutation } from '@/entities/item/api/item-api';
import {
  createItemParamsDraft,
  getItemCharacteristicDefinitions,
  normalizeItemParamsForUpdate,
} from '@/entities/item/model/characteristics';
import {
  hasItemEditFormErrors,
  MAX_ITEM_PRICE,
  validateItemEditForm,
} from '@/entities/item/model/edit-form-validation';
import { itemCategoryLabels } from '@/entities/item/model/presentation';
import { llmApi } from '@/shared/api/llm-api';
import { PageError, PageLoader } from '@/shared/ui/page-state';

type FormState = {
  description: string;
  params: Record<string, string>;
  price: string;
  title: string;
};

const draftKey = (id: number) => `draft_item_${id}`;

export const AdEditPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ? Number(params.id) : null;
  const itemQuery = useItemQuery(id);
  const updateMutation = useUpdateItemMutation();

  const [form, setForm] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    params: {},
  } as ReturnType<typeof validateItemEditForm>);
  const [aiResponse, setAiResponse] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [formError, setFormError] = useState('');

  const item = itemQuery.data;
  const characteristicFields = item ? getItemCharacteristicDefinitions(item.category) : [];

  useEffect(() => {
    if (!id || !item) return;

    const initialForm: FormState = {
      description: item.description ?? '',
      params: createItemParamsDraft(item),
      price: item.price?.toString() ?? '0',
      title: item.title,
    };

    const saved = localStorage.getItem(draftKey(id));
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<FormState>;

      setForm({
        ...initialForm,
        ...parsed,
        params: {
          ...initialForm.params,
          ...(parsed.params ?? {}),
        },
      });
      return;
    }

    setForm(initialForm);
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
        description: form.description,
        params: normalizeItemParamsForUpdate(item.category, form.params),
        price: form.price,
        title: form.title,
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

    const nextErrors = validateItemEditForm(item.category, form);
    setFieldErrors(nextErrors);

    if (hasItemEditFormErrors(nextErrors)) {
      setFormError('Проверьте поля формы и исправьте ошибки.');
      return;
    }

    const normalizedPrice = Number(form.price);

    try {
      await updateMutation.mutateAsync({
        id,
        category: item.category,
        input: {
          title: form.title.trim(),
          price: normalizedPrice,
          description: form.description.trim(),
          params: normalizeItemParamsForUpdate(item.category, form.params),
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
        <Paper elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField disabled fullWidth label="Категория" value={itemCategoryLabels[item.category]} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Цена"
                onChange={event => {
                  setForm(current => (current ? { ...current, price: event.target.value } : current));
                  setFieldErrors(current => ({ ...current, price: undefined }));
                  setFormError('');
                }}
                error={Boolean(fieldErrors.price)}
                helperText={fieldErrors.price}
                required
                slotProps={{ htmlInput: { max: MAX_ITEM_PRICE, min: 0 } }}
                type="number"
                value={form.price}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Название"
                onChange={event => {
                  setForm(current => (current ? { ...current, title: event.target.value } : current));
                  setFieldErrors(current => ({ ...current, title: undefined }));
                  setFormError('');
                }}
                error={Boolean(fieldErrors.title)}
                helperText={fieldErrors.title}
                required
                value={form.title}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                helperText={fieldErrors.description ?? `${form.description.length} / 1000`}
                label="Описание"
                multiline
                onChange={event => {
                  setForm(current => (current ? { ...current, description: event.target.value } : current));
                  setFieldErrors(current => ({ ...current, description: undefined }));
                  setFormError('');
                }}
                error={Boolean(fieldErrors.description)}
                rows={8}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                value={form.description}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
          <Stack spacing={2}>
            <Typography fontWeight={700} variant="h6">
              Характеристики
            </Typography>

            <Grid container spacing={1.5}>
              {characteristicFields.map(field => (
                <Grid key={field.key} size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    error={Boolean(fieldErrors.params[field.key])}
                    helperText={fieldErrors.params[field.key]}
                    label={field.label}
                    onChange={event => {
                      setForm(current =>
                        current
                          ? {
                              ...current,
                              params: {
                                ...current.params,
                                [field.key]: event.target.value,
                              },
                            }
                          : current,
                      );
                      setFieldErrors(current => ({
                        ...current,
                        params: Object.fromEntries(
                          Object.entries(current.params).filter(([key]) => key !== field.key),
                        ),
                      }));
                      setFormError('');
                    }}
                    placeholder={field.placeholder}
                    select={field.kind === 'select'}
                    slotProps={
                      field.kind === 'number'
                        ? {
                            htmlInput: {
                              min: 0,
                            },
                          }
                        : undefined
                    }
                    type={field.kind === 'number' ? 'number' : 'text'}
                    value={form.params[field.key] ?? ''}
                  >
                    {field.kind === 'select'
                      ? [
                          <MenuItem key="empty" value="">
                            Не выбрано
                          </MenuItem>,
                          ...(field.options ?? []).map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          )),
                        ]
                      : undefined}
                  </TextField>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <Button color="warning" disabled={isAskingAi} onClick={askDescription} variant="contained">
            {isAskingAi ? 'Запрос к AI...' : 'Придумать / улучшить описание'}
          </Button>
          <Button color="warning" disabled={isAskingAi} onClick={askPrice} variant="contained">
            {isAskingAi ? 'Запрос к AI...' : 'Узнать рыночную цену'}
          </Button>
        </Stack>

        {aiResponse ? (
          <Paper elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
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
