
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { LogoutButton } from '../auth/logout-button';

// Hardcoded chat ID for this example
const CHAT_ID = 'general';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

export function ChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;

    const messagesCollection = collection(db, 'chats', CHAT_ID, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
        <h1 className="text-xl font-headline font-bold text-foreground">
          RealTime Relay
        </h1>
        <LogoutButton />
      </header>
      <main className="flex-1 overflow-y-auto">
        <MessageList messages={messages} currentUserId={user.uid} />
      </main>
      <footer className="border-t bg-card p-4">
        <MessageForm chatId={CHAT_ID} />
      </footer>
    </div>
  );
}
