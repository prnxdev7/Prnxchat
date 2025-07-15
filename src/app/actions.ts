
'use server';

import { suggestEmoji } from '@/ai/flows/suggest-emoji';

/**
 * Server action to suggest an emoji based on the input text.
 * It ensures that empty or short texts don't trigger the AI model.
 * @param text The text to analyze.
 * @returns An object containing the suggested emoji or null if none could be suggested.
 */
export async function suggestEmojiAction(text: string): Promise<{ emoji: string | null }> {
  // Return early if text is too short to have meaningful sentiment
  if (!text || text.trim().length < 3) {
    return { emoji: null };
  }

  try {
    const result = await suggestEmoji(text);
    return result || { emoji: null };
  } catch (error) {
    console.error('Error suggesting emoji:', error);
    // Avoid crashing the app if the AI service fails
    return { emoji: null };
  }
}
