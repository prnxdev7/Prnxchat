
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
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { LogoutButton } from '../auth/logout-button';
import { MessageCircle, Shield, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog } from '@/components/settings/settings-dialog';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

interface Chat {
    id: string;
    type: 'group' | 'private';
    name: string;
    participants?: string[];
}

interface AppUser {
    uid: string;
    displayName: string;
    email: string;
    // A simple online status, could be enhanced with realtime presence
    online: boolean; 
}

// Function to create a consistent private chat ID
const getPrivateChatId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export function ChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [activeChat, setActiveChat] = useState<Chat>({ id: 'general', type: 'group', name: 'General Chat' });
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch all users
  useEffect(() => {
    if (!user) return;
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("uid", "!=", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));
        setUsers(userList);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for messages in the active chat
  useEffect(() => {
    if (!user || !activeChat.id) return;
    
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
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, activeChat]);


  const handleUserSelect = (selectedUser: AppUser) => {
    if(!user) return;
    const chatId = getPrivateChatId(user.uid, selectedUser.uid);
    setActiveChat({
        id: chatId,
        type: 'private',
        name: selectedUser.displayName,
        participants: [user.uid, selectedUser.uid]
    });
  }

  const handleGroupSelect = () => {
    setActiveChat({ id: 'general', type: 'group', name: 'General Chat' });
  }

  if (!user) return null;

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center justify-between gap-2">
                    <div className='flex items-center gap-2'>
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                                {user.displayName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className='font-semibold text-foreground text-base'>{user.displayName}</span>
                            <span className='text-xs text-muted-foreground'>{user.email}</span>
                        </div>
                    </div>
                    <SettingsDialog>
                        <Button variant="ghost" size="icon" className='h-8 w-8'>
                            <Settings className='h-4 w-4'/>
                        </Button>
                    </SettingsDialog>
                 </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleGroupSelect} isActive={activeChat.id === 'general'}>
                            <MessageCircle />
                            General Chat
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarSeparator />
                     <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">Direct Messages</div>
                     {users.map(u => (
                         <SidebarMenuItem key={u.uid}>
                             <SidebarMenuButton onClick={() => handleUserSelect(u)} isActive={activeChat.id === getPrivateChatId(user.uid, u.uid)}>
                                <div className="relative">
                                    <Avatar className="h-7 w-7 border">
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                                            {u.displayName?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
                                </div>
                                {u.displayName}
                            </SidebarMenuButton>
                         </SidebarMenuItem>
                     ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className='border-t'>
                 <div className="flex items-center justify-between gap-2 w-full">
                    {isAdmin && (
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/admin">
                                <Shield />
                                Admin
                            </Link>
                        </Button>
                    )}
                    <LogoutButton />
                </div>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset className='flex flex-col h-screen bg-secondary/40'>
             <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                     <div className="flex items-center gap-3">
                        {activeChat.type === 'private' ? (
                             <div className="relative">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">
                                        {activeChat.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                            </div>
                        ) : (
                            <Users className='h-7 w-7 text-muted-foreground' />
                        )}
                        <h1 className="text-xl font-headline font-bold text-foreground">
                            {activeChat.name}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:hidden">
                    <LogoutButton />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                <MessageList messages={messages} currentUserId={user.uid} />
            </main>
            <footer className="border-t bg-card p-4">
                <MessageForm chatId={activeChat.id} chatType={activeChat.type} />
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
