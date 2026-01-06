'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const dairyImage = PlaceHolderImages.find((img) => img.id === 'dairy-selection');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Login Successful', description: 'Welcome back!' });
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Account Created', description: 'Welcome to Agri Finance!' });
      }
      router.push('/home');
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">
       <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gray-900 text-white md:flex">
          {dairyImage && (
             <Image
                src={dairyImage.imageUrl}
                alt={dairyImage.description}
                layout="fill"
                objectFit="cover"
                className="opacity-20"
                data-ai-hint={dairyImage.imageHint}
             />
           )}
           <div className="relative z-10 text-center p-8">
             <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Agri Finance
             </h1>
             <p className="mt-4 text-lg text-white/80 sm:text-xl">
                Your all-in-one solution for livestock financial management.
             </p>
           </div>
        </div>

      <div className="flex w-full items-center justify-center bg-background p-4 md:w-1/2">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{isLoginView ? 'Welcome Back!' : 'Create an Account'}</CardTitle>
            <CardDescription>
              {isLoginView
                ? "Sign in to access your farm's data."
                : 'Get started by creating a new account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="manager@myfarm.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoginView ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <Button variant="link" onClick={() => setIsLoginView(!isLoginView)}>
                {isLoginView ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
