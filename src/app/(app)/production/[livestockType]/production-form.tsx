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
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type ProductionFormProps = {
  livestockType: LivestockType;
  isOpen: boolean;
  onClose: () => void;
  record?: ProductionRecord | null;
};

const formSchema = z.object({
  date: z.string().min(1, 'A date is required.'),
  amount: z.coerce.number().min(0.1, 'Amount must be greater than 0.'),
  notes: z.string().optional(),
});

export function ProductionForm({ livestockType, isOpen, onClose, record }: ProductionFormProps) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const unit = livestockType === 'dairy' ? 'Liters' : 'Trays';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: record
      ? { ...record, date: record.date.split('T')[0] }
      : { amount: 0, date: new Date().toISOString().split('T')[0], notes: '' },
  });

  useEffect(() => {
    if (isOpen) {
       form.reset(record
        ? { ...record, date: record.date.split('T')[0] }
        : { amount: 0, notes: '', date: new Date().toISOString().split('T')[0] }
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
            <div className="flex-1 py-6 space-y-4">
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
              <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({unit})</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
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
            <SheetFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:w-full">
               {record && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="sm:w-auto">
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
              <div className="flex gap-2 justify-end col-start-2 sm:col-start-auto">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Record</Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
