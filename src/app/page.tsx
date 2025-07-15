
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, MessageSquarePlus, Users, MessageCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs, collectionGroup, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPrivateChatId, type AppUser } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatItem {
  id: string;
  type: 'group' | 'private';
  name: string;
  lastMessage?: {
    text: string;
    timestamp: Date | null;
  };
  otherParticipant?: AppUser;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setIsChatsLoading(true);

    const privateChatsQuery = query(
      collection(db, 'privateChats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(privateChatsQuery, async (snapshot) => {
      const usersCache: Record<string, AppUser> = {};
      const fetchUser = async (uid: string) => {
        if (usersCache[uid]) return usersCache[uid];
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
        if (!userDoc.empty) {
            const userData = userDoc.docs[0].data() as AppUser;
            usersCache[uid] = userData;
            return userData;
        }
        return null;
      }
      
      const privateChatsPromises = snapshot.docs.map(async (doc): Promise<ChatItem | null> => {
        const chatData = doc.data();
        const otherParticipantId = chatData.participants.find((p: string) => p !== user.uid);
        if (!otherParticipantId) return null;

        const otherParticipant = await fetchUser(otherParticipantId);
        if(!otherParticipant) return null;

        // Fetch last message
        const messagesQuery = query(collection(db, 'privateChats', doc.id, 'messages'), orderBy('timestamp', 'desc'), where('timestamp', '!=', null));
        const lastMessageSnapshot = await getDocs(messagesQuery);
        const lastMessage = lastMessageSnapshot.docs[0]?.data();
        
        return {
          id: doc.id,
          type: 'private',
          name: otherParticipant.displayName,
          otherParticipant: otherParticipant,
          lastMessage: lastMessage ? {
              text: lastMessage.text,
              timestamp: lastMessage.timestamp?.toDate()
          } : undefined
        };
      });

      const privateChatItems = (await Promise.all(privateChatsPromises)).filter(Boolean) as ChatItem[];
      
      const generalChat: ChatItem = {
          id: 'general',
          type: 'group',
          name: 'General Chat',
      };
      // Fetch last message for general chat
      const generalMessagesQuery = query(collection(db, 'chats', 'general', 'messages'), orderBy('timestamp', 'desc'), where('timestamp', '!=', null));
      const generalLastMessageSnapshot = await getDocs(generalMessagesQuery);
      const generalLastMessage = generalLastMessageSnapshot.docs[0]?.data();
      if (generalLastMessage) {
          generalChat.lastMessage = {
              text: generalLastMessage.text,
              timestamp: generalLastMessage.timestamp?.toDate()
          }
      }

      setChats([generalChat, ...privateChatItems]);
      setIsChatsLoading(false);
    });

    return () => unsubscribe();

  }, [user]);
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/40">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-headline font-bold text-foreground">
                Conversations
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Group
            </Button>
            <SettingsDialog>
                <Button variant="ghost" size="icon" className='h-9 w-9'>
                    <Settings className='h-5 w-5'/>
                </Button>
            </SettingsDialog>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        {isChatsLoading ? (
             <div className="flex w-full items-center justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
        ) : (
        <div className="grid grid-cols-1 gap-4">
            {chats.map(chat => (
                <Link key={chat.id} href={`/chat/${chat.type}/${chat.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-12 w-12 border">
                                {chat.type === 'private' && chat.otherParticipant ? (
                                    <AvatarFallback className='bg-secondary text-secondary-foreground text-xl font-bold'>{chat.name.charAt(0).toUpperCase()}</AvatarFallback>
                                ) : (
                                    <AvatarFallback className='bg-secondary text-secondary-foreground'><Users className="h-6 w-6" /></AvatarFallback>
                                )}
                            </Avatar>
                            <div className='flex-1'>
                                <div className='flex justify-between items-start'>
                                    <h3 className="font-semibold text-lg">{chat.name}</h3>
                                    {chat.lastMessage?.timestamp && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text || 'No messages yet'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
        )}
      </main>
    </div>
  );
}
