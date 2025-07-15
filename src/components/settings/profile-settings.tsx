
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { updateDisplayName } from '@/app/settings/actions';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
    onSave?: () => void;
}

export function ProfileSettings({ onSave }: ProfileSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateDisplayName(data.displayName);
      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your display name has been changed.',
        });
        if (onSave) onSave();
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <Card className='border-none shadow-none'>
        <CardHeader className='p-0 pb-4'>
            <CardTitle className='text-lg'>Profile</CardTitle>
            <CardDescription>Update your public display name.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className='p-0 space-y-4'>
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className='p-0 pt-6 flex justify-end'>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
      </Form>
    </Card>
  );
}
