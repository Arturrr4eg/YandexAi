const required = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value.trim() : fallback;

export const env = {
  apiBaseUrl: required(import.meta.env.VITE_API_BASE_URL, 'http://localhost:8080'),
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '',
  geminiModel: required(import.meta.env.VITE_GEMINI_MODEL, 'gemini-2.0-flash'),
  llmProxyUrl: import.meta.env.VITE_LLM_PROXY_URL?.trim() ?? '',
};
