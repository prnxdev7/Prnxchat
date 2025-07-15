
import { AuthForm } from '@/components/auth/auth-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue to RealTime Relay</p>
        </div>
        <AuthForm type="login" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
            </Link>
        </p>
       </div>
    </div>
  );
}
