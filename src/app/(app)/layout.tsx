
'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavLinks } from '@/components/layout/nav-links';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Plus, Loader } from 'lucide-react';
import { RecordForm } from './finances/[livestockType]/record-form';
import { TaskForm } from './tasks/task-form';
import { ProductionForm } from './production/[livestockType]/production-form';
import { LivestockType } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useExitPrompt } from '@/hooks/use-exit-prompt';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/app-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isHydrated } = useAppContext();
  useExitPrompt(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const segments = pathname.split('/');
  
  const [lastSelectedType] = useLocalStorage<string>('last-livestock-type', 'dairy');
  const pathLivestockType = segments.includes('dairy') ? 'dairy' : segments.includes('poultry') ? 'poultry' : null;
  const livestockType = (pathLivestockType || lastSelectedType) as LivestockType;
  
  const showNav = !pathname.includes('/home');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-dairy', 'theme-poultry');
    
    // We only apply enterprise themes if we are NOT on the home page.
    // This ensures the home page always retains its default blue accent color.
    if (pathname !== '/home' && pathname !== '/') {
      if (pathLivestockType) {
        root.classList.add(`theme-${pathLivestockType}`);
      } else if (lastSelectedType) {
        root.classList.add(`theme-${lastSelectedType}`);
      }
    }
  }, [pathLivestockType, lastSelectedType, pathname]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your farm...</p>
      </div>
    );
  }

  const isFinancesPage = pathname.includes('/finances');
  const isTasksPage = pathname.includes('/tasks');
  const isProductionPage = pathname.includes('/production');

  const renderForm = () => {
    if (isTasksPage) return <TaskForm isOpen={isFormOpen} onClose={() => setFormOpen(false)} />;
    if (isFinancesPage) return <RecordForm livestockType={livestockType} isOpen={isFormOpen} onClose={() => setFormOpen(false)} />;
    if (isProductionPage) return <ProductionForm livestockType={livestockType} isOpen={isFormOpen} onClose={() => setFormOpen(false)} />;
    return null;
  }

  const fabClasses = cn(
    "fixed bottom-20 right-6 rounded-full shadow-lg z-20 no-print transition-all duration-300 h-16 w-16 bg-primary hover:opacity-90 flex items-center justify-center text-white"
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {showNav && <Header />}
      <div className="flex flex-col sm:gap-4 flex-grow">
        <main className={cn("grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3", showNav && "p-4 sm:px-6 sm:py-0 mb-20")}>
          {children}
        </main>
      </div>
      {showNav && <NavLinks />}
      {(isFinancesPage || isTasksPage || isProductionPage) && (
         <>
            <Button onClick={() => setFormOpen(true)} className={fabClasses} size="icon">
              <Plus className="h-8 w-8" />
            </Button>
            {renderForm()}
         </>
      )}
    </div>
  );
}
