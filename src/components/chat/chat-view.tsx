'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { MessageSquare, Users, Settings, LogOut, Loader2, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppUser, getPrivateChatId } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarInset,
    useSidebar,
    SidebarFooter,
    SidebarMenuSkeleton,
    SidebarGroup,
    SidebarGroupLabel
} from '@/components/ui/sidebar';
import { SettingsDialog } from '../settings/settings-dialog';
import { LogoutButton } from '../auth/logout-button';
import Link from 'next/link';

export function ChatView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<{ type: 'group'; id: string } | { type: 'private'; id: string; name: string } | null>({ id: 'general', type: 'group' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();
  const { toast } = useToast();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.email === adminEmail;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setIsUsersLoading(true);
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs
        .map(doc => doc.data() as AppUser)
        .filter(u => u.uid !== user.uid);
      setUsers(userList);
      setIsUsersLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch user list.',
      });
      setIsUsersLoading(false);
    });
    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    if (!user || !activeChat) {
      setMessages([]);
      return;
    }
    
    setIsMessagesLoading(true);
    let messagesCollection;
    if (activeChat.type === 'group') {
        messagesCollection = collection(db, 'chats', activeChat.id, 'messages');
    } else {
        messagesCollection = collection(db, 'privateChats', activeChat.id, 'messages');
    }

    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(msgs);
      setIsMessagesLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch messages for this chat.',
        });
        setIsMessagesLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeChat, toast]);

  const handleSelectChat = (chat: { type: 'group'; id: string } | { type: 'private'; id: string, name: string }) => {
    setActiveChat(chat);
    if(isMobile) {
        setOpenMobile(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const getChatName = () => {
    if (!activeChat) return '';
    if (activeChat.type === 'group') return 'General Chat';
    return activeChat.name;
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
            <div className='flex items-center gap-2'>
                 <MessageCircle className="h-7 w-7 text-primary" />
                <h2 className="text-xl font-headline font-bold">RealTime Relay</h2>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                 <SidebarGroup>
                    <SidebarGroupLabel>Chats</SidebarGroupLabel>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => handleSelectChat({ type: 'group', id: 'general' })}
                            isActive={activeChat?.id === 'general'}
                        >
                            <Users />
                            General Chat
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarGroup>
                 <SidebarGroup>
                     <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                    {isUsersLoading ? (
                        <>
                            <SidebarMenuSkeleton showIcon />
                            <SidebarMenuSkeleton showIcon />
                            <SidebarMenuSkeleton showIcon />
                        </>
                    ) : (
                        users.map(u => {
                            const privateChatId = getPrivateChatId(user.uid, u.uid);
                            return (
                                <SidebarMenuItem key={u.uid}>
                                    <SidebarMenuButton
                                        onClick={() => handleSelectChat({ type: 'private', id: privateChatId, name: u.displayName })}
                                        isActive={activeChat?.id === privateChatId}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="text-xs">{u.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-sidebar" />
                                        </div>
                                        {u.displayName}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })
                    )}
                 </SidebarGroup>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='border-t py-2'>
            <SettingsDialog>
                <div className='flex items-center p-2 rounded-md hover:bg-muted cursor-pointer'>
                    <Avatar className="h-9 w-9 border mr-3">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <p className='font-semibold truncate'>{user.displayName}</p>
                        <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                    </div>
                    <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0'>
                        <Settings className='h-5 w-5' />
                    </Button>
                </div>
            </SettingsDialog>
             <LogoutButton />
             {isAdmin && (
                <Button asChild variant="outline" className='w-full'>
                    <Link href="/admin">
                        <Shield />
                        Admin Panel
                    </Link>
                </Button>
            )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className='flex flex-col h-screen bg-background'>
            <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className='md:hidden' />
                     <h1 className="text-xl font-headline font-bold text-foreground">
                        {getChatName()}
                    </h1>
                </div>
                {activeChat?.type === 'private' && (
                     <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                         <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                         Online
                     </div>
                )}
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                {isMessagesLoading ? (
                     <div className="flex h-full w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                ) : (
                    activeChat ? <MessageList messages={messages} currentUserId={user.uid} /> : <div className='flex h-full w-full flex-col items-center justify-center text-center'><MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" /><p className='text-muted-foreground'>Select a chat to start messaging.</p></div>
                )}
            </main>
            {activeChat && (
                <footer className="border-t bg-card p-4">
                    <MessageForm chatId={activeChat.id} chatType={activeChat.type} />
                </footer>
            )}
        </div>
      </SidebarInset>
    </>
  );
}

// Re-export Message interface for use in other components
export type { Message } from './message-list';