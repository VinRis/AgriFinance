'use client';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/app-context';
import { Bird, Milk, SettingsIcon, CalendarCheck } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function Header() {
    const pathname = usePathname();
    const { settings, isHydrated } = useAppContext();
    const [lastSelectedType] = useLocalStorage<string>('last-livestock-type', 'dairy');
    const segments = pathname.split('/');
    let livestockType: string | null = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;
    
    if (pathname.includes('/settings') || pathname.includes('/tasks')) {
        livestockType = lastSelectedType;
    }

    let title = '';
    if(pathname.includes('dashboard')) title = 'Dashboard';
    else if(pathname.includes('records')) title = 'Records';
    else if(pathname.includes('reports')) title = 'Reports';
    else if(pathname.includes('settings')) title = 'Settings';
    else if(pathname.includes('tasks')) title = 'Task Scheduler';


    if (!livestockType && !pathname.includes('settings') && !pathname.includes('tasks')) return null;

    const getIcon = () => {
      if (pathname.includes('/tasks')) return CalendarCheck;
      if (pathname.includes('/settings')) return SettingsIcon;
      if (livestockType === 'dairy') return Milk;
      if (livestockType === 'poultry') return Bird;
      return SettingsIcon;
    }

    const EnterpriseIcon = getIcon();

    const getEnterpriseName = () => {
        if(pathname.includes('/tasks')) return null;
        if(pathname.includes('/settings')) return null;
        return livestockType === 'dairy' ? 'Dairy' : 'Poultry';
    }
    const enterpriseName = getEnterpriseName();

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 no-print">
            <div className="flex items-center gap-2">
                <EnterpriseIcon className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold md:text-xl">
                    {isHydrated ? settings.farmName : '...'} {enterpriseName && `- ${enterpriseName}`}
                </h1>
            </div>
            {title && <div className="hidden md:block ml-auto text-lg font-semibold">{title}</div>}
      </header>
    );
}
