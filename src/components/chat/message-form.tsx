
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SendHorizontal } from 'lucide-react';
import { suggestEmojiAction } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const messageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty.'),
});

interface MessageFormProps {
  chatId: string;
}

// Debounce utility
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export function MessageForm({ chatId }: MessageFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestedEmoji, setSuggestedEmoji] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: '' },
  });

  const debouncedSuggestEmoji = useCallback(debounce(async (text: string) => {
    if (text.trim().length < 5) {
      setSuggestedEmoji(null);
      setIsSuggesting(false);
      return;
    }
    setIsSuggesting(true);
    const result = await suggestEmojiAction(text);
    setSuggestedEmoji(result.emoji);
    setIsSuggesting(false);
  }, 1000), []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      form.setValue('text', text);
      debouncedSuggestEmoji(text);
  }

  const addEmoji = () => {
    if(suggestedEmoji) {
        form.setValue('text', `${form.getValues('text')} ${suggestedEmoji}`);
        setSuggestedEmoji(null);
    }
  }

  async function onSubmit(values: z.infer<typeof messageSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to send a message.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const messagesCollection = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesCollection, {
          text: values.text,
          senderId: user.uid,
          senderName: user.displayName || 'Anonymous',
          timestamp: serverTimestamp(),
        });
        form.reset();
        setSuggestedEmoji(null);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Message Failed',
          description: 'Could not send message. Please try again.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
        <div className="relative w-full">
            <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
                <FormItem>
                <FormControl>
                    <Input
                     {...field}
                     onChange={handleTextChange}
                     placeholder="Type a message..."
                     className="pr-20"
                     autoComplete="off"
                    />
                </FormControl>
                </FormItem>
            )}
            />
            {(isSuggesting || suggestedEmoji) && (
                 <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    {isSuggesting ? (
                         <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ): suggestedEmoji && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={addEmoji}
                                        className="text-xl transition-transform duration-200 hover:scale-125"
                                    >
                                        {suggestedEmoji}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Add suggestion</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                 </div>
            )}
        </div>

        <Button type="submit" size="icon" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Send Message</span>
        </Button>
      </form>
    </Form>
  );
}
