import {
  createItemParamsDraft,
  normalizeItemParamsForUpdate,
} from '@/entities/item/model/characteristics';
import type { Item } from '@/entities/item/model/types';
import type { ItemEditFormValues } from '@/entities/item/model/edit-form-validation';

export type ItemEditFormState = ItemEditFormValues;

export const getItemEditDraftKey = (id: number) => `draft_item_${id}`;

export const createInitialItemEditForm = (item: Item): ItemEditFormState => ({
  description: item.description ?? '',
  params: createItemParamsDraft(item),
  price: item.price?.toString() ?? '',
  title: item.title,
});

export const mergeItemEditDraft = (
  item: Item,
  savedDraft: string | null,
): ItemEditFormState => {
  const initialForm = createInitialItemEditForm(item);

  if (!savedDraft) {
    return initialForm;
  }

  const parsedDraft = JSON.parse(savedDraft) as Partial<ItemEditFormState>;

  return {
    ...initialForm,
    ...parsedDraft,
    params: {
      ...initialForm.params,
      ...(parsedDraft.params ?? {}),
    },
  };
};

export const createDescriptionAiContext = (item: Item, form: ItemEditFormState) =>
  JSON.stringify(
    {
      category: item.category,
      currentDescription: form.description.trim() || undefined,
      params: normalizeItemParamsForUpdate(item.category, form.params),
      title: form.title.trim(),
    },
    null,
    2,
  );

export const createPriceAiContext = (item: Item, form: ItemEditFormState) =>
  JSON.stringify(
    {
      category: item.category,
      currentPrice: form.price.trim() || undefined,
      description: form.description.trim() || undefined,
      params: normalizeItemParamsForUpdate(item.category, form.params),
      title: form.title.trim(),
    },
    null,
    2,
  );
