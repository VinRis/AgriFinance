'use client';
import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md text-center">
        <WifiOff className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          You Are Offline
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          It looks like you've lost your connection. This app has offline capabilities, but the page you requested isn't available right now.
        </p>
        <p className="mt-2 text-foreground/80">
          Please check your connection or try returning to the home page.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </main>
  );
}
