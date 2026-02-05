'use client';
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/app-context';
import { LivestockType, ProductionRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Sun, Sunset, Moon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type ProductionFormProps = {
  livestockType: LivestockType;
  isOpen: boolean;
  onClose: () => void;
  record?: ProductionRecord | null;
};

const formSchema = z.object({
  date: z.string().min(1, 'A date is required.'),
  amount: z.coerce.number().min(0.1, 'Amount must be greater than 0.'),
  collectionTime: z.enum(['morning', 'noon', 'evening']).optional(),
  notes: z.string().optional(),
});

export function ProductionForm({ livestockType, isOpen, onClose, record }: ProductionFormProps) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const unit = livestockType === 'dairy' ? 'Liters' : 'Eggs';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: record
      ? { ...record, date: record.date.split('T')[0] }
      : { amount: 0, date: new Date().toISOString().split('T')[0], notes: '', collectionTime: 'morning' },
  });

  useEffect(() => {
    if (isOpen) {
       form.reset(record
        ? { ...record, date: record.date.split('T')[0] }
        : { amount: 0, notes: '', date: new Date().toISOString().split('T')[0], collectionTime: 'morning' }
      );
    }
  }, [isOpen, record, form]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    const recordData = {
      ...data,
      id: record ? record.id : Math.random().toString(36).substr(2, 9),
      date: new Date(data.date).toISOString(),
      livestockType,
      unit,
    };
    
    if (record) {
      dispatch({ type: 'UPDATE_PRODUCTION', payload: recordData as ProductionRecord });
      toast({ title: 'Record Updated', description: 'Production record successfully updated.' });
    } else {
      dispatch({ type: 'ADD_PRODUCTION', payload: recordData as ProductionRecord });
      toast({ title: 'Record Added', description: 'Daily production logged!' });
    }
    onClose();
  };

  const handleDelete = () => {
    if (record) {
        dispatch({ type: 'DELETE_PRODUCTION', payload: record.id });
        toast({
            variant: 'destructive',
            title: 'Record Deleted',
            description: 'The production record has been removed.',
        });
        onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>{record ? 'Edit' : 'Add'} Production</SheetTitle>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-6">
              <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              
              {livestockType === 'dairy' && (
                <FormField
                  control={form.control}
                  name="collectionTime"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Collection Time</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-2"
                        >
                          <FormItem className="flex-1">
                            <FormControl className="sr-only">
                              <RadioGroupItem value="morning" />
                            </FormControl>
                            <FormLabel className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                              field.value === 'morning' && "border-primary"
                            )}>
                              <Sun className="h-5 w-5" />
                              <span className="text-xs font-semibold">Morning</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex-1">
                            <FormControl className="sr-only">
                              <RadioGroupItem value="noon" />
                            </FormControl>
                            <FormLabel className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                              field.value === 'noon' && "border-primary"
                            )}>
                              <Sunset className="h-5 w-5" />
                              <span className="text-xs font-semibold">Noon</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex-1">
                            <FormControl className="sr-only">
                              <RadioGroupItem value="evening" />
                            </FormControl>
                            <FormLabel className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                              field.value === 'evening' && "border-primary"
                            )}>
                              <Moon className="h-5 w-5" />
                              <span className="text-xs font-semibold">Evening</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({unit})</FormLabel>
                      <FormControl><Input type="number" step="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Any observations about health or quality?" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-6">
               <div className="flex flex-col sm:flex-row gap-2">
                {record && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this production record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </SheetClose>
                <Button type="submit" className="w-full sm:w-auto">Save Record</Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
