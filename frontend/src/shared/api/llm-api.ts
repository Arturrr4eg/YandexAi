import axios from 'axios';

import { env } from '@/shared/config/env';

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export type ParsedAiResponse = {
  displayText: string;
  value: string;
};

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, match => match.replace(/```/g, '').trim())
    .replace(/^\s*[-*]\s+/gm, '')
    .trim();

const parseTaggedResponse = (text: string, marker: string): ParsedAiResponse | null => {
  const normalized = stripMarkdown(text);
  const regex = new RegExp(`${marker}:\\s*([\\s\\S]+)$`, 'i');
  const match = normalized.match(regex);

  if (!match) {
    return null;
  }

  const value = match[1].trim();
  const displayText = normalized.replace(regex, '').trim();

  if (!value) {
    throw new Error('LLM вернула пустое итоговое значение.');
  }

  return {
    displayText,
    value,
  };
};

const parsePriceResponse = (text: string): ParsedAiResponse => {
  const normalized = stripMarkdown(text);
  const parsed = parseTaggedResponse(text, 'FINAL_PRICE');
  const sourceValue = parsed?.value ?? normalized;
  const digits = sourceValue.match(/\d[\d\s]*/)?.[0]?.replace(/\s+/g, '');

  if (!digits) {
    throw new Error('LLM не вернула цену в числовом формате.');
  }

  return {
    displayText: parsed?.displayText || normalized,
    value: digits,
  };
};

const parseDescriptionResponse = (text: string): ParsedAiResponse => {
  const normalized = stripMarkdown(text);
  const parsed = parseTaggedResponse(text, 'FINAL_DESCRIPTION');

  if (parsed) {
    return parsed;
  }

  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const fallbackValue = lines.at(-1) ?? normalized;

  if (!fallbackValue) {
    throw new Error('LLM вернула пустой текст описания.');
  }

  return {
    displayText: normalized,
    value: fallbackValue,
  };
};

const parseOpenRouterText = (payload: OpenRouterResponse): string => {
  const text = payload.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error(payload.error?.message || 'OpenRouter вернула пустой ответ.');
  }

  return text.trim();
};

const mapLlmError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return new Error('Превышен лимит запросов к OpenRouter (429). Подожди немного или проверь квоты API-ключа.');
    }

    if (error.response?.status === 401) {
      return new Error('OpenRouter вернула 401 Unauthorized. Скорее всего ключ неверный, отозван или неактивен.');
    }

    if (error.response?.status === 403) {
      return new Error('OpenRouter вернула 403 Forbidden. У ключа или аккаунта нет доступа к этой модели или провайдеру.');
    }

    const details =
      typeof error.response?.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response?.data ?? {});

    return new Error(`Ошибка LLM-запроса: ${error.response?.status ?? 'network error'}. ${details}`);
  }

  return error instanceof Error ? error : new Error('Неизвестная ошибка LLM-запроса.');
};

const callOpenRouter = async (prompt: string, maxTokens = 220): Promise<string> => {
  try {
    if (env.llmProxyUrl) {
      const { data } = await axios.post<{ text: string }>(env.llmProxyUrl, {
        prompt,
      });

      return data.text;
    }

    if (!env.openRouterApiKey) {
      throw new Error('Не задан ключ OpenRouter. Укажите VITE_OPENROUTER_API_KEY или настройте VITE_LLM_PROXY_URL.');
    }

    const { data } = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'Строго следуй инструкциям пользователя и отвечай обычным текстом без markdown, если не просят иное.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Avito Test App',
        },
        timeout: 20_000,
      },
    );

    return parseOpenRouterText(data);
  } catch (error) {
    throw mapLlmError(error);
  }
};

export const llmApi = {
  generateDescription: (input: string) =>
    callOpenRouter(
      [
        'Ты помогаешь продавцу подготовить объявление для Avito.',
        'Используй только факты из переданного контекста объявления.',
        'Ничего не выдумывай, не добавляй характеристики, состояние, комплект, гарантию, дефекты, город, цену, опыт использования и любые другие детали, которых нет в контексте.',
        'Если данных мало, прямо так и скажи кратко, без догадок.',
        'Качество описания напрямую влияет на скорость продажи: чем подробнее и привлекательнее текст, тем больше откликов получает продавец.',
        'Сначала дай полезный и достаточно подробный ответ на русском языке.',
        'В ответе кратко разберись, что в текущем описании хорошо, чего не хватает, и как сделать текст более конкретным и продающим.',
        'Дай 3-5 коротких и понятных рекомендаций, без воды и без повторов.',
        'После этого в самом конце отдельной строкой обязательно верни финальный текст для вставки в поле описания в формате:',
        'FINAL_DESCRIPTION: <готовый текст>',
        'Финальный текст должен быть без markdown, без приветствий, без списков и без дополнительных пояснений вокруг.',
        'Финальный текст должен быть емким, убедительным и состоять примерно из 5-7 предложений.',
        'Контекст объявления:',
        input,
      ].join('\n'),
      420,
    ).then(parseDescriptionResponse),
  estimatePrice: (input: string) =>
    callOpenRouter(
      [
        'Ты помогаешь продавцу оценить рыночную цену объявления для Avito.',
        'Используй только факты из переданного контекста объявления.',
        'Ничего не выдумывай и не опирайся на детали, которых нет в контексте.',
        'Если данных недостаточно для уверенной оценки, скажи об этом кратко и всё равно предложи осторожную цену только на основе имеющихся данных.',
        'Сначала дай короткое, но чуть более подробное объяснение на русском языке: 3-4 предложения о том, какие факторы из контекста влияют на цену и почему ты предлагаешь именно такую оценку.',
        'После этого в самом конце отдельной строкой обязательно верни итоговую цену для вставки в поле в формате:',
        'FINAL_PRICE: <целое число в рублях без пробелов>',
        'Контекст объявления:',
        input,
      ].join('\n'),
      280,
    ).then(parsePriceResponse),
};
