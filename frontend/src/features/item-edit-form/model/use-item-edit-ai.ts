import { useState } from 'react';

import { llmApi } from '@/shared/api/llm-api';

export type AiRequestStatus = 'idle' | 'loading' | 'success' | 'error';

export type AiRequestState = {
  appliedValue: string;
  isTooltipOpen: boolean;
  message: string;
  sourceValue: string;
  status: AiRequestStatus;
};

const createIdleAiState = (): AiRequestState => ({
  appliedValue: '',
  isTooltipOpen: false,
  message: '',
  sourceValue: '',
  status: 'idle',
});

type UseItemEditAiParams = {
  currentDescription: string;
  descriptionContext: string;
  priceContext: string;
};

export const useItemEditAi = ({ currentDescription, descriptionContext, priceContext }: UseItemEditAiParams) => {
  const [priceAiState, setPriceAiState] = useState<AiRequestState>(createIdleAiState);
  const [descriptionAiState, setDescriptionAiState] = useState<AiRequestState>(createIdleAiState);

  const askPrice = async () => {
    setPriceAiState({
      appliedValue: '',
      isTooltipOpen: false,
      message: '',
      sourceValue: '',
      status: 'loading',
    });

    try {
      const result = await llmApi.estimatePrice(priceContext);

      setPriceAiState({
        appliedValue: result.value,
        isTooltipOpen: true,
        message: result.displayText || `Предлагаемая цена: ${result.value} ₽`,
        sourceValue: '',
        status: 'success',
      });
    } catch (error) {
      setPriceAiState({
        appliedValue: '',
        isTooltipOpen: true,
        message:
          error instanceof Error ? error.message : 'Попробуйте повторить запрос или закройте уведомление',
        sourceValue: '',
        status: 'error',
      });
    }
  };

  const askDescription = async () => {
    setDescriptionAiState({
      appliedValue: '',
      isTooltipOpen: false,
      message: '',
      sourceValue: currentDescription,
      status: 'loading',
    });

    try {
      const result = await llmApi.generateDescription(descriptionContext);

      setDescriptionAiState({
        appliedValue: result.value,
        isTooltipOpen: true,
        message: result.displayText || result.value,
        sourceValue: currentDescription,
        status: 'success',
      });
    } catch (error) {
      setDescriptionAiState({
        appliedValue: '',
        isTooltipOpen: true,
        message:
          error instanceof Error ? error.message : 'Попробуйте повторить запрос или закройте уведомление',
        sourceValue: currentDescription,
        status: 'error',
      });
    }
  };

  const closePriceBubble = () => {
    setPriceAiState(current => ({
      ...current,
      isTooltipOpen: false,
    }));
  };

  const closeDescriptionBubble = () => {
    setDescriptionAiState(current => ({
      ...current,
      isTooltipOpen: false,
    }));
  };

  return {
    askDescription,
    askPrice,
    closeDescriptionBubble,
    closePriceBubble,
    descriptionAiState,
    priceAiState,
  };
};
