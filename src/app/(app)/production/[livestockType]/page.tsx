'use client';
import { useMemo } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LivestockType, ProductionRecord } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { FlaskConical, Milk, Egg } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductionPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const livestockType = segments[segments.length - 1] as LivestockType;
  const { getProduction } = useAppContext();

  if (livestockType !== 'dairy' && livestockType !== 'poultry') notFound();

  const records = getProduction(livestockType);

  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: ProductionRecord[] } = {};
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sorted.forEach(r => {
        const date = parseISO(r.date);
        let key = format(date, 'MMMM d, yyyy');
        if (isToday(date)) key = 'Today';
        else if (isYesterday(date)) key = 'Yesterday';

        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
    });
    return groups;
  }, [records]);

  const unit = livestockType === 'dairy' ? 'Liters' : 'Trays';
  const Icon = livestockType === 'dairy' ? Milk : Egg;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="text-center space-y-2 py-4">
            <h2 className="text-3xl font-bold">{livestockType === 'dairy' ? 'Milk' : 'Egg'} Production</h2>
            <p className="text-sm text-muted-foreground">Keep track of your daily farm output.</p>
        </div>

        <div className="space-y-6">
            {Object.keys(groupedRecords).length > 0 ? (
                Object.entries(groupedRecords).map(([dateGroup, items]) => (
                    <div key={dateGroup} className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground px-1">{dateGroup}</p>
                        <div className="grid gap-3">
                            {items.map(r => (
                                <Card key={r.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{r.amount} {r.unit}</p>
                                                {r.notes && <p className="text-sm text-muted-foreground italic">"{r.notes}"</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-muted/50 rounded-lg border-2 border-dashed">
                    <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No production records yet. Click '+' to log today's harvest!</p>
                </div>
            )}
        </div>
    </div>
  );
}
