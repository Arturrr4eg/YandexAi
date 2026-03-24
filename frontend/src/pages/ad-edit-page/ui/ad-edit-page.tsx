import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

import { useItemQuery, useUpdateItemMutation } from '@/entities/item/api/item-api';
import { MAX_ITEM_PRICE } from '@/entities/item/model/edit-form-validation';
import { itemCategoryLabels } from '@/entities/item/model/presentation';
import type { Item } from '@/entities/item/model/types';
import { useItemEditAi } from '@/features/item-edit-form/model/use-item-edit-ai';
import { useItemEditForm } from '@/features/item-edit-form/model/use-item-edit-form';
import { ItemEditAiPanel } from '@/features/item-edit-form/ui/item-edit-ai-panel';
import { ItemEditCategoryFields } from '@/features/item-edit-form/ui/item-edit-category-fields';
import {
  getItemCharacteristicDefinitions,
  isMissingItemDraftValue,
} from '@/entities/item/model/characteristics';
import { PageError, PageLoader } from '@/shared/ui/page-state';

type AdEditPageContentProps = {
  id: number;
  item: Item;
};

const getFieldWarningStyles = (isActive: boolean) => (isActive ? { borderColor: '#FFA940' } : {});

const AdEditPageContent = ({ id, item }: AdEditPageContentProps) => {
  const navigate = useNavigate();
  const updateMutation = useUpdateItemMutation();

  const {
    applyAiDescription,
    applyAiPrice,
    buildSubmitInput,
    clearDraft,
    clearFieldValue,
    clearParamValue,
    descriptionAiContext,
    fieldErrors,
    form,
    formError,
    hasDescription,
    isSaveBlocked,
    priceAiContext,
    runFieldValidation,
    runParamValidation,
    setFieldValue,
    setFormError,
    setParamValue,
  } = useItemEditForm({
    id,
    isSubmitting: updateMutation.isPending,
    item,
  });

  const {
    askDescription,
    askPrice,
    closeDescriptionBubble,
    closePriceBubble,
    descriptionAiState,
    priceAiState,
  } = useItemEditAi({
    currentDescription: form.description,
    descriptionContext: descriptionAiContext,
    priceContext: priceAiContext,
  });

  const characteristicFields = getItemCharacteristicDefinitions(item.category);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const submitInput = buildSubmitInput();

    if (!submitInput) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        category: item.category,
        input: submitInput,
      });

      clearDraft();
      navigate(`/ads/${id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    }
  };

  return (
    <Stack component="section" spacing={3.5}>
      <Typography component="h1" fontWeight={800} variant="h4">
        Редактирование объявления
      </Typography>

      {formError ? <Alert severity="error">{formError}</Alert> : null}

      <Box
        sx={{
          display: { lg: 'grid' },
          gap: { lg: 4 },
          gridTemplateColumns: { lg: 'minmax(0, 1fr) minmax(332px, 1fr)' },
          position: 'relative',
        }}
      >
        <Stack component="form" onSubmit={handleSubmit} spacing={0} sx={{ maxWidth: { xs: '100%', lg: '100%' } }}>
          <Stack
            spacing={2}
            sx={{
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              pb: 3,
            }}
          >
            <TextField disabled fullWidth label="Категория" size="small" value={itemCategoryLabels[item.category]} />

            <TextField
              error={Boolean(fieldErrors.title)}
              fullWidth
              helperText={fieldErrors.title}
              label="Название"
              onBlur={() => runFieldValidation('title')}
              onChange={event => setFieldValue('title', event.target.value)}
              required
              size="small"
              value={form.title}
            />

            <TextField
              error={Boolean(fieldErrors.price)}
              fullWidth
              helperText={fieldErrors.price}
              label="Цена"
              onBlur={() => runFieldValidation('price')}
              onChange={event => setFieldValue('price', event.target.value)}
              required
              size="small"
              slotProps={{ htmlInput: { max: MAX_ITEM_PRICE, min: 0 } }}
              type="number"
              value={form.price}
            />

            <TextField
              error={Boolean(fieldErrors.description)}
              fullWidth
              helperText={fieldErrors.description ?? `${form.description.length} / 1000`}
              label="Описание"
              multiline
              onBlur={() => runFieldValidation('description')}
              onChange={event => setFieldValue('description', event.target.value)}
              rows={8}
              size="small"
              slotProps={{
                htmlInput: { maxLength: 1000 },
                input: form.description
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => clearFieldValue('description')} size="small">
                            <ClearRoundedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : undefined,
              }}
              sx={{
                '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': getFieldWarningStyles(
                  isMissingItemDraftValue(form.description) && !fieldErrors.description,
                ),
              }}
              value={form.description}
            />
          </Stack>

          <ItemEditCategoryFields
            errors={fieldErrors.params}
            fields={characteristicFields}
            onBlurField={runParamValidation}
            onChangeField={setParamValue}
            onClearField={clearParamValue}
            values={form.params}
          />

          <Stack direction="row" spacing={1.2} sx={{ pt: 3 }}>
            <Button disabled={isSaveBlocked} type="submit" variant="contained">
              {updateMutation.isPending ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            <Button component={Link} to={`/ads/${id}`} variant="outlined">
              Отменить
            </Button>
          </Stack>
        </Stack>

        <ItemEditAiPanel
          descriptionAiState={descriptionAiState}
          hasDescription={hasDescription}
          onApplyDescription={() => {
            applyAiDescription(descriptionAiState.appliedValue);
            closeDescriptionBubble();
          }}
          onApplyPrice={() => {
            applyAiPrice(priceAiState.appliedValue);
            closePriceBubble();
          }}
          onAskDescription={askDescription}
          onAskPrice={askPrice}
          onCloseDescription={closeDescriptionBubble}
          onClosePrice={closePriceBubble}
          priceAiState={priceAiState}
        />
      </Box>
    </Stack>
  );
};

export const AdEditPage = () => {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const itemQuery = useItemQuery(id);

  if (!id) {
    return <PageError message="Некорректный id объявления." />;
  }

  if (itemQuery.isPending) {
    return <PageLoader />;
  }

  if (itemQuery.isError || !itemQuery.data) {
    return <PageError message="Не удалось загрузить данные объявления." />;
  }

  return <AdEditPageContent id={id} item={itemQuery.data} />;
};
