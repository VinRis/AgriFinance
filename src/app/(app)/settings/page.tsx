import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {

  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
             <CardDescription>
                Manage your application settings and data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Settings for theme, farm details, and data management will be available here soon.</p>
          </CardContent>
        </Card>
    </div>
  );
}
