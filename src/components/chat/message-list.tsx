
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from './chat-view';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
