
import { AuthForm } from '@/components/auth/auth-form';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-md">
       <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold text-foreground">Create an Account</h1>
            <p className="text-muted-foreground mt-2">Join RealTime Relay to start chatting</p>
        </div>
        <AuthForm type="signup" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
            </Link>
        </p>
       </div>
    </div>
  );
}
