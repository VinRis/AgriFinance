import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function RecordsPage({ params }: { params: { livestockType: string } }) {
  const { livestockType } = params;

  if (livestockType !== 'dairy' && livestockType !== 'poultry') {
    notFound();
  }

  const title = livestockType === 'dairy' ? 'Dairy Records' : 'Poultry Records';

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
                Record management features are coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You will be able to add, view, edit, and delete your financial records here.</p>
          </CardContent>
        </Card>
    </div>
  );
}
