import axios from 'axios';

import { env } from '@/shared/config/env';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

const parseGeminiText = (payload: GeminiResponse): string => {
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('LLM вернула пустой ответ.');
  }
  return text.trim();
};

const mapLlmError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return new Error(
        'Превышен лимит запросов к Gemini (429). Подожди немного или проверь квоты API-ключа.',
      );
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return new Error('Ошибка авторизации Gemini. Проверь корректность API-ключа.');
    }

    return new Error(`Ошибка LLM-запроса: ${error.response?.status ?? 'network error'}.`);
  }

  return error instanceof Error ? error : new Error('Неизвестная ошибка LLM-запроса.');
};

const callGemini = async (prompt: string): Promise<string> => {
  try {
    if (env.llmProxyUrl) {
      const { data } = await axios.post<{ text: string }>(env.llmProxyUrl, {
        prompt,
      });
      return data.text;
    }

    if (!env.geminiApiKey) {
      throw new Error(
        'Не задан ключ Gemini. Укажите VITE_GEMINI_API_KEY или настройте VITE_LLM_PROXY_URL.',
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`;
    const { data } = await axios.post<GeminiResponse>(
      `${url}?key=${env.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
    );

    return parseGeminiText(data);
  } catch (error) {
    throw mapLlmError(error);
  }
};

export const llmApi = {
  generateDescription: (input: string) =>
    callGemini(
      `Ты ассистент продавца на Avito. Сгенерируй понятное и продающее описание объявления в 3-6 предложениях. Контекст объявления:\n${input}`,
    ),
  estimatePrice: (input: string) =>
    callGemini(
      `Ты ассистент продавца на Avito. Предложи рыночную цену и кратко объясни расчёт. Контекст объявления:\n${input}`,
    ),
};
