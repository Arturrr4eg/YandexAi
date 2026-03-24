import { useEffect, useMemo, useState } from 'react';

import {
  isMissingItemDraftValue,
  normalizeItemParamsForUpdate,
} from '@/entities/item/model/characteristics';
import {
  hasItemEditFormErrors,
  validateItemEditForm,
  type ItemEditFieldErrors,
} from '@/entities/item/model/edit-form-validation';
import type { Item, UpdateItemInput } from '@/entities/item/model/types';
import {
  createDescriptionAiContext,
  createPriceAiContext,
  getItemEditDraftKey,
  mergeItemEditDraft,
  type ItemEditFormState,
} from '@/features/item-edit-form/model/item-edit-draft';

type UseItemEditFormParams = {
  id: number;
  isSubmitting: boolean;
  item: Item;
};

const createEmptyErrors = (): ItemEditFieldErrors => ({
  params: {},
});

export const useItemEditForm = ({ id, isSubmitting, item }: UseItemEditFormParams) => {
  const [form, setForm] = useState<ItemEditFormState>(() =>
    mergeItemEditDraft(item, localStorage.getItem(getItemEditDraftKey(id))),
  );
  const [fieldErrors, setFieldErrors] = useState<ItemEditFieldErrors>(createEmptyErrors);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    localStorage.setItem(getItemEditDraftKey(id), JSON.stringify(form));
  }, [form, id]);

  const descriptionAiContext = useMemo(() => createDescriptionAiContext(item, form), [form, item]);
  const priceAiContext = useMemo(() => createPriceAiContext(item, form), [form, item]);
  const hasDescription = !isMissingItemDraftValue(form.description);
  const isSaveBlocked = !form.title.trim() || !form.price.trim() || isSubmitting;

  const updateFieldError = (key: keyof Omit<ItemEditFieldErrors, 'params'>, value?: string) => {
    setFieldErrors(current => ({
      ...current,
      [key]: value,
    }));
  };

  const updateParamError = (key: string, value?: string) => {
    setFieldErrors(current => ({
      ...current,
      params: value
        ? {
            ...current.params,
            [key]: value,
          }
        : Object.fromEntries(Object.entries(current.params).filter(([entryKey]) => entryKey !== key)),
    }));
  };

  const runFieldValidation = (field: 'title' | 'price' | 'description') => {
    const nextErrors = validateItemEditForm(item.category, form);
    updateFieldError(field, nextErrors[field]);
  };

  const runParamValidation = (key: string) => {
    const nextErrors = validateItemEditForm(item.category, form);
    updateParamError(key, nextErrors.params[key]);
  };

  const setFieldValue = (key: 'title' | 'price' | 'description', value: string) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));
    updateFieldError(key);
    setFormError('');
  };

  const clearFieldValue = (key: 'title' | 'price' | 'description') => {
    setForm(current => ({
      ...current,
      [key]: '',
    }));
    updateFieldError(key);
  };

  const setParamValue = (key: string, value: string) => {
    setForm(current => ({
      ...current,
      params: {
        ...current.params,
        [key]: value,
      },
    }));
    updateParamError(key);
    setFormError('');
  };

  const clearParamValue = (key: string) => {
    setForm(current => ({
      ...current,
      params: {
        ...current.params,
        [key]: '',
      },
    }));
    updateParamError(key);
  };

  const applyAiPrice = (value: string) => {
    setForm(current => ({
      ...current,
      price: value,
    }));
    updateFieldError('price');
  };

  const applyAiDescription = (value: string) => {
    setForm(current => ({
      ...current,
      description: value,
    }));
    updateFieldError('description');
  };

  const buildSubmitInput = (): UpdateItemInput | null => {
    const nextErrors = validateItemEditForm(item.category, form);
    setFieldErrors(nextErrors);

    if (hasItemEditFormErrors(nextErrors)) {
      setFormError('Проверьте поля формы и исправьте ошибки.');
      return null;
    }

    setFormError('');

    return {
      description: form.description.trim(),
      params: normalizeItemParamsForUpdate(item.category, form.params),
      price: Number(form.price),
      title: form.title.trim(),
    };
  };

  const clearDraft = () => {
    localStorage.removeItem(getItemEditDraftKey(id));
  };

  return {
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
  };
};
