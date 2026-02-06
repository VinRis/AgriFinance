'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Home, CalendarDays, FlaskConical, BrainCircuit, BookCopy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function NavLinks() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [lastSelectedType] = useLocalStorage<string>('last-livestock-type', 'dairy');
  
  // Detect if we are currently in a poultry or dairy path
  const pathLivestockType = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;
  
  // Use path type if available, otherwise fallback to stored preference
  const livestockType = pathLivestockType || lastSelectedType;

  if (pathname === '/home' || pathname === '/login' || pathname === '/') return null;

  const isNavItemActive = (href: string) => {
    const baseHref = href.split('?')[0];
    return pathname.startsWith(baseHref);
  };
  
   const navItems = [
    { href: `/dashboard/${livestockType}`, icon: LayoutDashboard, label: 'Board' },
    { href: `/finances/${livestockType}`, icon: BookCopy, label: 'Cash' },
    { href: `/production/${livestockType}`, icon: FlaskConical, label: 'Produce' },
    { href: `/advisor/${livestockType}`, icon: BrainCircuit, label: 'AI Tips' },
    { href: `/tasks`, icon: CalendarDays, label: 'Tasks' },
    { href: `/settings`, icon: Settings, label: 'Tools' },
   ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur-sm p-2 no-print">
      <div className="mx-auto grid max-w-2xl grid-cols-7 items-center justify-items-center gap-1">
          <Link href="/home" className={cn('flex flex-col items-center justify-center text-muted-foreground w-full gap-1 p-2', pathname === '/home' && 'text-primary font-bold')}>
              <Home className="h-5 w-5" />
              <span className="text-[10px]">Home</span>
          </Link>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors w-full', isNavItemActive(item.href) && 'text-primary font-bold')}>
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
