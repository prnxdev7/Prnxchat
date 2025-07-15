
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from './profile-settings';
import { AppearanceSettings } from './appearance-settings';
import { LogoutButton } from '../auth/logout-button';
import { Separator } from '../ui/separator';

export function SettingsDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                    Manage your account settings and preferences.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings onSave={() => setIsOpen(false)} />
                </TabsContent>
                <TabsContent value="appearance">
                    <AppearanceSettings />
                </TabsContent>
            </Tabs>
            <Separator className="my-4" />
            <DialogFooter>
                <LogoutButton />
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
