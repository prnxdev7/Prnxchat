
'use client';

import { useEffect, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { MessageBubble } from './message-bubble';
import { MessageSquare } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

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

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12" />
        <p className="mt-4 text-lg">No messages yet</p>
        <p className="mt-1 text-sm">Be the first to say something!</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pr-4">
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
