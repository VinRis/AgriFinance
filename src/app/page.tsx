import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function LivestockSelectionPage() {
  const dairyImage = PlaceHolderImages.find((img) => img.id === 'dairy-selection');
  const poultryImage = PlaceHolderImages.find((img) => img.id === 'poultry-selection');

  const selectionOptions = [
    {
      type: 'Dairy',
      href: '/dashboard/dairy',
      image: dairyImage,
      description: 'Manage finances for your dairy cows and milk production.',
    },
    {
      type: 'Poultry',
      href: '/dashboard/poultry',
      image: poultryImage,
      description: 'Track expenses and income for your egg-laying flock.',
    },
  ];

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4 sm:p-8">
      <div className="w-full max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to AgriFinance Pro
        </h1>
        <p className="mt-4 text-lg text-foreground/80 sm:text-xl">
          Your all-in-one solution for livestock financial management.
        </p>
        <p className="mt-8 font-headline text-2xl font-semibold text-foreground">
          Select your enterprise to begin
        </p>
      </div>
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
        {selectionOptions.map((option) => (
          <Link href={option.href} key={option.type}>
            <Card className="group transform-gpu overflow-hidden border-2 border-transparent transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:scale-105">
              <CardContent className="relative p-0">
                {option.image && (
                  <Image
                    src={option.image.imageUrl}
                    alt={option.image.description}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={option.image.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 w-full p-6">
                  <h2 className="font-headline text-3xl font-bold text-white">{option.type}</h2>
                  <p className="mt-1 text-primary-foreground/90">{option.description}</p>
                  <div className="mt-4 flex items-center text-accent">
                    <span className="font-semibold">Get Started</span>
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
