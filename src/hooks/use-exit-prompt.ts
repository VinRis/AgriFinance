'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export function useExitPrompt(active: boolean): void {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [lastBackPress, setLastBackPress] = useState(0);

  const handleBackPress = useCallback((e: PopStateEvent) => {
    // Only apply on top-level routes and when the feature is active
    const isTopLevelRoute = ['/dashboard/dairy', '/dashboard/poultry', '/records/dairy', '/records/poultry', '/tasks', '/reports/dairy', '/reports/poultry', '/settings'].includes(pathname);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (active && isTopLevelRoute && isStandalone) {
      const now = new Date().getTime();
      if (now - lastBackPress < 2000) {
        // Allow the default back action (exit)
        return;
      } else {
        // Prevent immediate exit
        e.preventDefault();
        history.pushState(null, '', pathname); 
        setLastBackPress(now);
        toast({
          description: 'Press back again to exit.',
          duration: 2000,
        });
      }
    }
  }, [active, lastBackPress, pathname, toast]);

  useEffect(() => {
    // We need to push a state to the history to be able to intercept the popstate event.
    history.pushState(null, '', pathname);
    
    window.addEventListener('popstate', handleBackPress);

    return () => {
      window.removeEventListener('popstate', handleBackPress);
    };
  }, [pathname, handleBackPress]);
}
