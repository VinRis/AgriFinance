'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function PWALifecycle() {
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
      const wb = window.workbox;

      const showUpdateToast = () => {
         toast({
            title: "Update Available",
            description: "A new version of the app is available. Please update for the latest features.",
            action: (
              <Button onClick={() => {
                wb.addEventListener('controlling', () => {
                    window.location.reload();
                });
                wb.messageSkipWaiting();
              }}>Update Now</Button>
            ),
            duration: Infinity // Keep the toast open until user acts
        });
      };
      
      // A new service worker has been found, but it's waiting to activate.
      wb.addEventListener('waiting', showUpdateToast);

      // This fires when the service worker has been successfully installed.
      wb.addEventListener('installed', (event) => {
        if (!event.isUpdate) {
            console.log('Service worker installed for the first time!');
        } else {
            console.log('New service worker installed.');
        }
      });
      
      // Add an event listener to detect when a new service worker has been found.
      wb.register();
    }
  }, [toast]);

  return null;
}
