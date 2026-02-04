'use client';
import { useState, useMemo } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Milk, Egg, FlaskConical, Plus, Search, TrendingUp, Calendar, History } from 'lucide-react';
import { LivestockType, ProductionRecord } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { ProductionForm } from './production-form';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isYesterday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ProductionPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const livestockType = segments[segments.length - 1] as LivestockType;

  const { getProduction } = useAppContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);
  const [timeFilter, setTimeFilter] = useState<'month' | 'week' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  if (livestockType !== 'dairy' && livestockType !== 'poultry') {
    notFound();
  }

  const allRecords = getProduction(livestockType);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const thisMonth = allRecords.filter(r => {
      const d = new Date(r.date);
      return d >= monthStart && d <= monthEnd;
    }).reduce((acc, r) => acc + r.amount, 0);

    const thisWeek = allRecords.filter(r => {
      const d = new Date(r.date);
      return d >= weekStart && d <= weekEnd;
    }).reduce((acc, r) => acc + r.amount, 0);

    const allTime = allRecords.reduce((acc, r) => acc + r.amount, 0);

    return { thisMonth, thisWeek, allTime };
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    let records = allRecords;

    if (timeFilter === 'week') {
      const now = new Date();
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      records = records.filter(r => {
        const d = new Date(r.date);
        return d >= start && d <= end;
      });
    } else if (timeFilter === 'month') {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      records = records.filter(r => {
        const d = new Date(r.date);
        return d >= start && d <= end;
      });
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      records = records.filter(r => 
        (r.notes?.toLowerCase().includes(query)) || 
        (format(parseISO(r.date), 'MMMM d, yyyy').toLowerCase().includes(query))
      );
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allRecords, timeFilter, searchQuery]);

  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: ProductionRecord[] } = {};
    filteredRecords.forEach(r => {
      const date = parseISO(r.date);
      let key = format(date, 'MMMM d, yyyy');
      if (isToday(date)) key = 'Today';
      else if (isYesterday(date)) key = 'Yesterday';

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [filteredRecords]);

  const handleEdit = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedRecord(null);
  };

  const unit = livestockType === 'dairy' ? 'L' : 'Trays';
  const Icon = livestockType === 'dairy' ? Milk : Egg;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Total Production</p>
        <h2 className="text-4xl font-bold">
          {stats.thisMonth.toLocaleString()} <span className="text-xl font-normal text-muted-foreground">{unit} this month</span>
        </h2>
      </div>

      <div className="flex justify-center p-1 bg-muted rounded-full">
        <Button
          onClick={() => setTimeFilter('month')}
          variant={timeFilter === 'month' ? 'default' : 'ghost'}
          className="w-1/3 rounded-full"
        >
          Month
        </Button>
        <Button
          onClick={() => setTimeFilter('week')}
          variant={timeFilter === 'week' ? 'default' : 'ghost'}
          className="w-1/3 rounded-full"
        >
          Week
        </Button>
        <Button
          onClick={() => setTimeFilter('all')}
          variant={timeFilter === 'all' ? 'default' : 'ghost'}
          className="w-1/3 rounded-full"
        >
          All Time
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="font-bold text-lg">{stats.thisWeek.toLocaleString()} {unit}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">All Time</p>
              <p className="font-bold text-lg">{stats.allTime.toLocaleString()} {unit}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Production
          </h3>
        </div>

        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground px-1">{dateGroup}</p>
              <div className="grid gap-3">
                {items.map(r => (
                  <Card key={r.id} onClick={() => handleEdit(r)} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-full">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{r.amount} {r.unit}</p>
                          {r.notes && <p className="text-sm text-muted-foreground italic truncate max-w-[200px]">"{r.notes}"</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">Edit</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
            <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No production records found.</p>
            <Button variant="link" onClick={() => setFormOpen(true)}>Log production now</Button>
          </div>
        )}
      </div>

      <ProductionForm
        livestockType={livestockType}
        isOpen={isFormOpen}
        onClose={closeForm}
        record={selectedRecord}
      />
    </div>
  );
}
