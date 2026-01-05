import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardPage({ params }: { params: { livestockType: string } }) {
  const { livestockType } = params;

  if (livestockType !== 'dairy' && livestockType !== 'poultry') {
    notFound();
  }

  const title = livestockType === 'dairy' ? 'Dairy Dashboard' : 'Poultry Dashboard';

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">KPIs</div>
                    <p className="text-xs text-muted-foreground">Detailed metrics will be shown here.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
