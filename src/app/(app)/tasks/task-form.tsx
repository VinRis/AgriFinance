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
import { FarmTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TaskFormProps = {
  isOpen: boolean;
  onClose: () => void;
  task?: FarmTask | null;
  selectedDate?: Date;
};

const formSchema = z.object({
  date: z.string().min(1, 'A date is required.'),
  title: z.string().min(1, 'Title is required.'),
  livestockType: z.enum(['dairy', 'poultry', 'general'], { required_error: 'Please select an enterprise association.'}),
  description: z.string().optional(),
});


export function TaskForm({ isOpen, onClose, task, selectedDate }: TaskFormProps) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();

  const getDefaultDate = () => {
    if (task) return new Date(task.date).toISOString().split('T')[0];
    if (selectedDate) return selectedDate.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? { ...task, date: new Date(task.date).toISOString().split('T')[0] }
      : { livestockType: 'general', title: '', description: '', date: getDefaultDate() },
  });

  useEffect(() => {
    if (isOpen) {
       form.reset(task
        ? { ...task, date: new Date(task.date).toISOString().split('T')[0] }
        : { livestockType: 'general', title: '', description: '', date: getDefaultDate() }
      );
    }
  }, [isOpen, task, selectedDate, form]);


  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    const taskData = {
      ...data,
      id: task ? task.id : new Date().toISOString() + Math.random(),
      date: new Date(data.date).toISOString(),
      status: task ? task.status : 'pending',
      description: data.description || '',
    };
    
    if (task) {
      dispatch({ type: 'UPDATE_TASK', payload: taskData as FarmTask });
      toast({ title: 'Task Updated', description: 'Your task has been successfully updated.' });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData as FarmTask });
      toast({ title: 'Task Added', description: 'A new task has been scheduled.' });
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>{task ? 'Edit' : 'Add'} Task</SheetTitle>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-4">
               <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Vaccinate herd" {...field} />
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
                name="livestockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enterprise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associate with an enterprise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
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
                      <Textarea placeholder="Add more details about the task..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Task</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
