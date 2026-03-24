import { memo } from 'react';

import { useItemEditChat } from '@/features/item-edit-form/model/use-item-edit-chat';
import { ItemEditChat } from '@/features/item-edit-form/ui/item-edit-chat';

type ItemEditChatPanelProps = {
  context: string;
};

export const ItemEditChatPanel = memo(({ context }: ItemEditChatPanelProps) => {
  const {
    error,
    input,
    isContextStale,
    isLoading,
    messages,
    sendMessage,
    setError,
    setInput,
  } = useItemEditChat({
    context,
  });

  return (
    <ItemEditChat
      error={error}
      input={input}
      isContextStale={isContextStale}
      isLoading={isLoading}
      messages={messages}
      onChangeInput={setInput}
      onClearError={() => setError('')}
      onSend={sendMessage}
    />
  );
});

ItemEditChatPanel.displayName = 'ItemEditChatPanel';
