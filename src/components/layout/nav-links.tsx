// NavLinks component with added Production and AI Advisor links
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, FileText, LayoutDashboard, Settings, Home, CalendarDays, FlaskConical, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect } from 'react';

export function NavLinks() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [lastSelectedType, setLastSelectedType] = useLocalStorage<string>('last-livestock-type', 'dairy');
  
  const pathLivestockType = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;
  
  useEffect(() => {
    if (pathLivestockType) {
      setLastSelectedType(pathLivestockType);
    }
  }, [pathLivestockType, setLastSelectedType]);

  if (pathname === '/home' || pathname === '/login' || pathname === '/') return null;

  const livestockType = pathLivestockType || lastSelectedType;

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
