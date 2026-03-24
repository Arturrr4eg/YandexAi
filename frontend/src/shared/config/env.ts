const required = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value.trim() : fallback;

export const env = {
  apiBaseUrl: required(import.meta.env.VITE_API_BASE_URL, 'http://localhost:8080'),
  openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY?.trim() ?? '',
  openRouterModel: required(import.meta.env.VITE_OPENROUTER_MODEL, 'openai/gpt-4o-mini'),
  llmProxyUrl: import.meta.env.VITE_LLM_PROXY_URL?.trim() ?? '',
};
