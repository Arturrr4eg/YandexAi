import { useEffect, useRef, useState } from 'react';

import { llmApi } from '@/shared/api/llm-api';

export type ItemEditChatMessage = {
  content: string;
  id: string;
  role: 'assistant' | 'user';
};

type UseItemEditChatParams = {
  context: string;
};

const createMessage = (
  role: ItemEditChatMessage['role'],
  content: string,
): ItemEditChatMessage => ({
  content,
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
});

export const useItemEditChat = ({ context }: UseItemEditChatParams) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ItemEditChatMessage[]>([]);
  const [error, setError] = useState('');
  const [isContextStale, setIsContextStale] = useState(false);
  const lastContextRef = useRef(context);

  useEffect(() => {
    if (lastContextRef.current !== context && messages.length > 0) {
      setIsContextStale(true);
    }

    lastContextRef.current = context;
  }, [context, messages.length]);

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    const nextUserMessage = createMessage('user', question);
    setMessages(current => [...current, nextUserMessage]);
    setInput('');
    setError('');
    setIsContextStale(false);
    setIsLoading(true);

    try {
      const answer = await llmApi.chatAboutItem(
        context,
        messages.map(message => ({
          content: message.content,
          role: message.role,
        })),
        question,
      );

      setMessages(current => [...current, createMessage('assistant', answer)]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : 'Не удалось получить ответ AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    input,
    isContextStale,
    isLoading,
    messages,
    sendMessage,
    setError,
    setInput,
  };
};
