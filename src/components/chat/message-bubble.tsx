
'use client';

import { cn } from '@/lib/utils';
import type { Message } from './chat-view';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const { text, senderName, timestamp } = message;
  const date = timestamp ? timestamp.toDate() : new Date();

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
            {senderName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xs rounded-lg p-3 lg:max-w-md',
          isCurrentUser
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-card'
        )}
      >
        <div className="flex items-baseline gap-2">
           <p className="text-sm font-bold">{isCurrentUser ? 'You' : senderName}</p>
           <time className="text-xs opacity-70">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
        <p className="mt-1 text-base">{text}</p>
      </div>
       {isCurrentUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {senderName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
