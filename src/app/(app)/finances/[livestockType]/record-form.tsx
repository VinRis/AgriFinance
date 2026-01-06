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
import { LivestockType, AgriTransaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

type RecordFormProps = {
  livestockType: LivestockType;
  isOpen: boolean;
  onClose: () => void;
  transaction?: AgriTransaction | null;
};

const formSchema = z.object({
  date: z.string().min(1, 'A date is required.'),
  transactionType: z.enum(['income', 'expense'], { required_error: 'Please select a transaction type.'}),
  category: z.string().min(1, 'Category is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  description: z.string().optional(),
});


const dairyIncomeCategories = ['Milk Sales', 'Livestock Sales', 'Government Subsidy', 'Other'];
const poultryIncomeCategories = ['Egg Sales', 'Meat Sales', 'Livestock Sales', 'Other'];
const expenseCategories = ['Feed', 'Veterinary', 'Labor', 'Utilities', 'Maintenance', 'Rent/Mortgage', 'Other'];

export function RecordForm({ livestockType, isOpen, onClose, transaction }: RecordFormProps) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction
      ? { ...transaction, date: transaction.date.split('T')[0] }
      : { transactionType: 'expense', amount: 0, description: '' },
  });

  const transactionType = form.watch('transactionType');

  const incomeCategories = livestockType === 'poultry' ? poultryIncomeCategories : dairyIncomeCategories;
  const categories = transactionType === 'income' ? incomeCategories : expenseCategories;
  
  useEffect(() => {
    if (isOpen) {
       form.reset(transaction
        ? { ...transaction, date: new Date(transaction.date).toISOString().split('T')[0] }
        : { transactionType: 'expense', amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
      );
    }
  }, [isOpen, transaction, form]);

  useEffect(() => {
    // Reset category if it's not in the new list of categories
    if (!categories.includes(form.getValues('category'))) {
      form.setValue('category', '');
    }
  }, [transactionType, form, categories, livestockType]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    const transactionData = {
      ...data,
      id: transaction ? transaction.id : new Date().toISOString() + Math.random(),
      date: new Date(data.date).toISOString(),
      livestockType: livestockType,
      description: data.description || '',
    };
    
    if (transaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transactionData as AgriTransaction });
      toast({ title: 'Transaction Updated', description: 'Your transaction has been successfully updated.' });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transactionData as AgriTransaction });
      toast({ title: 'Transaction Added', description: 'A new transaction has been created.' });
    }
    onClose();
  };

  const handleDelete = () => {
    if (transaction) {
        dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
        toast({
            variant: 'destructive',
            title: 'Transaction Deleted',
            description: 'The transaction has been removed.',
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
              <SheetTitle>{transaction ? 'Edit' : 'Add'} Transaction</SheetTitle>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-4">
               <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="income" />
                            </FormControl>
                            <FormLabel className="font-normal">Income</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="expense" />
                            </FormControl>
                            <FormLabel className="font-normal">Expense</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                       <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="E.g., Sale of 50L of milk" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:w-full">
              {transaction && (
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
                        This action cannot be undone. This will permanently delete this transaction from your records.
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
                <Button type="submit">Save</Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
