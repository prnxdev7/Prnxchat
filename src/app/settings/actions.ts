
'use server';

import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function updateDisplayName(displayName: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must be logged in to update your profile.');
  }

  try {
    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Update Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { displayName });
    
    // Revalidate the path to ensure the UI updates with the new name
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating display name:', error);
    return { success: false, error: error.message };
  }
}
