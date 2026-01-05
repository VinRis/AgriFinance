'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, FileText, LayoutDashboard, Milk, Settings, Bird } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LivestockType } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';

export function NavLinks() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const livestockType = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;

  if (!livestockType) return null;

  const navItems = [
    {
      href: `/dashboard/${livestockType}`,
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: `/records/${livestockType}`,
      icon: BookCopy,
      label: 'Records',
    },
    {
      href: `/reports/${livestockType}`,
      icon: FileText,
      label: 'Reports',
    },
    {
      href: `/settings`,
      icon: Settings,
      label: 'Settings',
    },
  ];

  const enterpriseIcon = livestockType === 'dairy' ? Milk : Bird;

  const isNavItemActive = (href: string) => {
    if (href.includes('dashboard')) return pathname.includes('dashboard');
    if (href.includes('records')) return pathname.includes('records');
    if (href.includes('reports')) return pathname.includes('reports');
    return pathname === href;
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <TooltipProvider>
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex no-print">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <enterpriseIcon className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">AgriFinance Pro</span>
            </Link>
            {navItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      isNavItemActive(item.href) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
              <ThemeToggle />
          </nav>
        </aside>
      </TooltipProvider>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-2 sm:hidden no-print">
        <div className="grid grid-cols-5 items-center justify-items-center gap-2">
            <Link
                href="/"
                className='flex flex-col items-center justify-center text-muted-foreground'
            >
                <enterpriseIcon className="h-6 w-6" />
                <span className="text-xs">{livestockType === 'dairy' ? 'Dairy' : 'Poultry'}</span>
            </Link>
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground',
                isNavItemActive(item.href) ? 'text-primary' : ''
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
