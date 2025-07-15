'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.email !== adminEmail) {
        router.replace('/');
      }
    }
  }, [user, loading, router, adminEmail]);

  if (loading || !user || user.email !== adminEmail) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/40">
       <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
        <div className='flex items-center gap-4'>
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-headline font-bold text-foreground">
                Admin Panel
            </h1>
        </div>
        <Button asChild variant="outline">
            <Link href="/">Back to Chat</Link>
        </Button>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Admin!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This is your admin dashboard. You can add components here to manage users, view statistics, or moderate content.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
