import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  createChatAiContext,
  createDescriptionAiContext,
  createPriceAiContext,
  getItemEditDraftKey,
  mergeItemEditDraft,
  type ItemEditFormState,
} from '@/features/item-edit-form/model/item-edit-draft';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';

type UseItemEditFormParams = {
  id: number;
  isSubmitting: boolean;
  item: Item;
};

const createEmptyErrors = (): ItemEditFieldErrors => ({
  params: {},
});

const hasFormStateChanged = (current: ItemEditFormState, next: ItemEditFormState) =>
  current.title !== next.title ||
  current.price !== next.price ||
  current.description !== next.description ||
  current.params !== next.params;

export const useItemEditForm = ({ id, isSubmitting, item }: UseItemEditFormParams) => {
  const [form, setForm] = useState<ItemEditFormState>(() =>
    mergeItemEditDraft(item, localStorage.getItem(getItemEditDraftKey(id))),
  );
  const [fieldErrors, setFieldErrors] = useState<ItemEditFieldErrors>(createEmptyErrors);
  const [formError, setFormError] = useState('');
  const debouncedForm = useDebouncedValue(form, 300);
  const undoStackRef = useRef<ItemEditFormState[]>([]);
  const redoStackRef = useRef<ItemEditFormState[]>([]);

  useEffect(() => {
    localStorage.setItem(getItemEditDraftKey(id), JSON.stringify(debouncedForm));
  }, [debouncedForm, id]);

  const descriptionAiContext = useMemo(() => createDescriptionAiContext(item, debouncedForm), [debouncedForm, item]);
  const priceAiContext = useMemo(() => createPriceAiContext(item, debouncedForm), [debouncedForm, item]);
  const rawChatAiContext = useMemo(() => createChatAiContext(item, debouncedForm), [debouncedForm, item]);
  const chatAiContext = useDebouncedValue(rawChatAiContext, 700);
  const hasDescription = !isMissingItemDraftValue(form.description);
  const isSaveBlocked = !form.title.trim() || !form.price.trim() || isSubmitting;

  const updateFieldError = useCallback((key: keyof Omit<ItemEditFieldErrors, 'params'>, value?: string) => {
    setFieldErrors(current => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const updateParamError = useCallback((key: string, value?: string) => {
    setFieldErrors(current => ({
      ...current,
      params: value
        ? {
            ...current.params,
            [key]: value,
          }
        : Object.fromEntries(Object.entries(current.params).filter(([entryKey]) => entryKey !== key)),
    }));
  }, []);

  const pushHistoryEntry = useCallback((snapshot: ItemEditFormState) => {
    undoStackRef.current.push(snapshot);

    if (undoStackRef.current.length > 100) {
      undoStackRef.current.shift();
    }

    redoStackRef.current = [];
  }, []);

  const setNextFormState = useCallback((updater: (current: ItemEditFormState) => ItemEditFormState) => {
    setForm(current => {
      const next = updater(current);

      if (hasFormStateChanged(current, next)) {
        pushHistoryEntry(current);
      }

      return next;
    });
  }, [pushHistoryEntry]);

  const runFieldValidation = useCallback((field: 'title' | 'price' | 'description') => {
    const nextErrors = validateItemEditForm(item.category, form);
    updateFieldError(field, nextErrors[field]);
  }, [form, item.category, updateFieldError]);

  const runParamValidation = useCallback((key: string) => {
    const nextErrors = validateItemEditForm(item.category, form);
    updateParamError(key, nextErrors.params[key]);
  }, [form, item.category, updateParamError]);

  const setFieldValue = useCallback((key: 'title' | 'price' | 'description', value: string) => {
    setNextFormState(current => ({
      ...current,
      [key]: value,
    }));
    updateFieldError(key);
    setFormError('');
  }, [setNextFormState, updateFieldError]);

  const clearFieldValue = useCallback((key: 'title' | 'price' | 'description') => {
    setNextFormState(current => ({
      ...current,
      [key]: '',
    }));
    updateFieldError(key);
  }, [setNextFormState, updateFieldError]);

  const setParamValue = useCallback((key: string, value: string) => {
    setNextFormState(current => ({
      ...current,
      params: {
        ...current.params,
        [key]: value,
      },
    }));
    updateParamError(key);
    setFormError('');
  }, [setNextFormState, updateParamError]);

  const clearParamValue = useCallback((key: string) => {
    setNextFormState(current => ({
      ...current,
      params: {
        ...current.params,
        [key]: '',
      },
    }));
    updateParamError(key);
  }, [setNextFormState, updateParamError]);

  const applyAiPrice = useCallback((value: string) => {
    setNextFormState(current => ({
      ...current,
      price: value,
    }));
    updateFieldError('price');
  }, [setNextFormState, updateFieldError]);

  const applyAiDescription = useCallback((value: string) => {
    setNextFormState(current => ({
      ...current,
      description: value,
    }));
    updateFieldError('description');
  }, [setNextFormState, updateFieldError]);

  const buildSubmitInput = useCallback((): UpdateItemInput | null => {
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
  }, [form, item.category]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(getItemEditDraftKey(id));
  }, [id]);

  const undo = useCallback(() => {
    const previous = undoStackRef.current.pop();

    if (!previous) {
      return;
    }

    redoStackRef.current.push(form);
    setForm(previous);
    setFieldErrors(createEmptyErrors());
    setFormError('');
  }, [form]);

  const redo = useCallback(() => {
    const next = redoStackRef.current.pop();

    if (!next) {
      return;
    }

    undoStackRef.current.push(form);
    setForm(next);
    setFieldErrors(createEmptyErrors());
    setFormError('');
  }, [form]);

  return {
    applyAiDescription,
    applyAiPrice,
    buildSubmitInput,
    chatAiContext,
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
    redo,
    runFieldValidation,
    runParamValidation,
    setFieldValue,
    setFormError,
    setParamValue,
    undo,
  };
};
