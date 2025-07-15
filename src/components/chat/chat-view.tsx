
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDocs,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type AppUser } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

interface ChatHeaderInfo {
    name: string;
    avatarFallback: string;
    isOnline?: boolean;
}

interface ChatViewProps {
    chatId: string;
    chatType: 'group' | 'private';
}

export function ChatView({ chatId, chatType }: ChatViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHeaderInfo, setChatHeaderInfo] = useState<ChatHeaderInfo | null>(null);

  useEffect(() => {
    if (!user || !chatId || !chatType) return;
    
    let messagesCollection;
    if (chatType === 'group') {
        messagesCollection = collection(db, 'chats', chatId, 'messages');
        setChatHeaderInfo({ name: 'General Chat', avatarFallback: 'G' });
    } else {
        messagesCollection = collection(db, 'privateChats', chatId, 'messages');
        
        // Fetch other participant's info for header
        const getHeaderInfo = async () => {
            const chatDocRef = doc(db, 'privateChats', chatId);
            const chatDoc = await getDoc(chatDocRef);
            if (chatDoc.exists()) {
                const participants = chatDoc.data().participants;
                const otherUserId = participants.find((p: string) => p !== user.uid);
                if (otherUserId) {
                    const userDocRef = doc(db, 'users', otherUserId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as AppUser;
                        setChatHeaderInfo({
                            name: userData.displayName,
                            avatarFallback: userData.displayName.charAt(0).toUpperCase(),
                            isOnline: true // Simplified
                        });
                    }
                }
            }
        };
        getHeaderInfo();
    }

    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, chatId, chatType]);

  if (!user) return null;

  return (
    <div className='flex flex-col h-screen bg-secondary/40'>
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <Button asChild variant="ghost" className="hidden md:inline-flex">
                 <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chats
                </Link>
            </Button>
            {chatHeaderInfo && (
                <div className="flex items-center gap-3">
                    {chatType === 'private' ? (
                        <div className="relative">
                            <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">
                                    {chatHeaderInfo.avatarFallback}
                                </AvatarFallback>
                            </Avatar>
                            {chatHeaderInfo.isOnline && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                            )}
                        </div>
                    ) : (
                        <Users className='h-7 w-7 text-muted-foreground' />
                    )}
                    <h1 className="text-xl font-headline font-bold text-foreground">
                        {chatHeaderInfo.name}
                    </h1>
                </div>
            )}
        </div>
        </header>
        <main className="flex-1 overflow-y-auto">
            <MessageList messages={messages} currentUserId={user.uid} />
        </main>
        <footer className="border-t bg-card p-4">
            <MessageForm chatId={chatId} chatType={chatType} />
        </footer>
    </div>
  );
}
