
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ChatView } from '@/components/chat/chat-view';
import { Loader2 } from 'lucide-react';

export default function ChatPage({ params }: { params: { type: string, id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (params.type !== 'group' && params.type !== 'private') {
    // Or redirect to a 404 page
    router.replace('/');
    return null;
  }

  return <ChatView chatType={params.type as 'group' | 'private'} chatId={params.id} />;
}
