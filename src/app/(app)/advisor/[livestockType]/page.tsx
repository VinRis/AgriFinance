'use client';
import { useState, useEffect } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Sparkles, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { getAdvisorTips } from '@/ai/flows/advisor-flow';
import { LivestockType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdvisorPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const livestockType = segments[segments.length - 1] as LivestockType;
  
  const { settings, getTransactions, getProduction, isHydrated } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);

  if (livestockType !== 'dairy' && livestockType !== 'poultry') notFound();

  const transactions = getTransactions(livestockType);
  const production = getProduction(livestockType);

  const fetchData = async () => {
    setLoading(true);
    try {
      const financeSummary = {
        totalIncome: transactions.filter(t => t.transactionType === 'income').reduce((a, b) => a + b.amount, 0),
        totalExpenses: transactions.filter(t => t.transactionType === 'expense').reduce((a, b) => a + b.amount, 0),
        netProfit: 0
      };
      financeSummary.netProfit = financeSummary.totalIncome - financeSummary.totalExpenses;

      const result = await getAdvisorTips({
        livestockType,
        farmName: settings.farmName,
        productionHistory: production.slice(-10).map(p => ({ date: p.date, amount: p.amount, unit: p.unit })),
        financeSummary
      });
      setAdvice(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && !advice) {
      fetchData();
    }
  }, [isHydrated]);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="flex justify-between items-center py-4">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    AI Advisor <Sparkles className="h-5 w-5 text-yellow-500" />
                </h2>
                <p className="text-sm text-muted-foreground">Expert insights for your {livestockType} farm.</p>
            </div>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
        </div>

        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        ) : advice ? (
            <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90 leading-relaxed">{advice.summary}</p>
                    </CardContent>
                </Card>

                {advice.alert && (
                    <Card className="bg-destructive/10 border-destructive/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-sm font-medium text-destructive">{advice.alert}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    {advice.advice.map((item: any, i: number) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm font-medium">{item.action}</p>
                                <div className="flex items-start gap-2 text-xs bg-muted p-2 rounded">
                                    <TrendingUp className="h-3 w-3 text-green-600 mt-0.5" />
                                    <span>{item.impact}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
                <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No data to analyze. Add records to get AI insights.</p>
                <Button onClick={fetchData} className="mt-4">Generate Insights</Button>
            </div>
        )}
    </div>
  );
}

import { cn } from '@/lib/utils';
