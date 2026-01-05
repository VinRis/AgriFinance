'use client';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/app-context';
import { Bird, Milk } from 'lucide-react';

export function Header() {
    const pathname = usePathname();
    const { settings } = useAppContext();
    const segments = pathname.split('/');
    const livestockType = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;
    
    let title = '';
    if(pathname.includes('dashboard')) title = 'Dashboard';
    else if(pathname.includes('records')) title = 'Records';
    else if(pathname.includes('reports')) title = 'Reports';
    else if(pathname.includes('settings')) title = 'Settings';


    if (!livestockType) return null;

    const EnterpriseIcon = livestockType === 'dairy' ? Milk : Bird;
    const enterpriseName = livestockType === 'dairy' ? 'Dairy' : 'Poultry';

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 no-print">
            <div className="flex items-center gap-2">
                <EnterpriseIcon className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold md:text-xl">
                    {settings.farmName} - {enterpriseName}
                </h1>
            </div>
            {title && <div className="hidden md:block ml-auto text-lg font-semibold">{title}</div>}
      </header>
    );
}
