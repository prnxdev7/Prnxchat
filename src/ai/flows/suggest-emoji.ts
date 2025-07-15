// src/ai/flows/suggest-emoji.ts
'use server';

/**
 * @fileOverview Provides an emoji suggestion based on the sentiment of the input text.
 *
 * - suggestEmoji - A function that takes text as input and returns an emoji suggestion.
 * - SuggestEmojiInput - The input type for the suggestEmoji function.
 * - SuggestEmojiOutput - The return type for the suggestEmoji function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEmojiInputSchema = z.string().describe('The text to analyze for sentiment and suggest an emoji for.');
export type SuggestEmojiInput = z.infer<typeof SuggestEmojiInputSchema>;

const SuggestEmojiOutputSchema = z.object({
  emoji: z.string().describe('An emoji that represents the sentiment of the text.'),
});
export type SuggestEmojiOutput = z.infer<typeof SuggestEmojiOutputSchema>;

export async function suggestEmoji(text: SuggestEmojiInput): Promise<SuggestEmojiOutput> {
  return suggestEmojiFlow(text);
}

const prompt = ai.definePrompt({
  name: 'suggestEmojiPrompt',
  input: {schema: SuggestEmojiInputSchema},
  output: {schema: SuggestEmojiOutputSchema},
  prompt: `Analyze the sentiment of the following text and suggest a single emoji that represents that sentiment:

Text: {{{text}}}

Emoji suggestion:`,
});

const suggestEmojiFlow = ai.defineFlow(
  {
    name: 'suggestEmojiFlow',
    inputSchema: SuggestEmojiInputSchema,
    outputSchema: SuggestEmojiOutputSchema,
  },
  async text => {
    const {output} = await prompt(text);
    return output!;
  }
);
