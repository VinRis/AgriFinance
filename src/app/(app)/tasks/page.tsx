'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { FarmTask, LivestockType } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { TaskForm } from './task-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format, startOfToday, addDays, subDays, isToday, parseISO } from 'date-fns';

export default function TasksPage() {
  const { getTasks, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FarmTask | null>(null);
  const [currentDate, setCurrentDate] = useState(startOfToday());
  
  const allTasks = useMemo(() => getTasks().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [getTasks]);
  
  const tasksForDate = useMemo(() => {
    const selectedDateString = format(currentDate, 'yyyy-MM-dd');
    return allTasks.filter(task => format(parseISO(task.date), 'yyyy-MM-dd') === selectedDateString);
  }, [allTasks, currentDate]);

  const upcomingTasks = useMemo(() => {
    return allTasks.filter(task => new Date(task.date) > currentDate && task.status === 'pending').slice(0, 5);
  }, [allTasks, currentDate]);


  const handleEdit = (task: FarmTask) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    toast({ title: 'Task Deleted', description: 'The task has been successfully removed.' });
  };
  
  const handleStatusChange = (task: FarmTask, completed: boolean) => {
    const updatedTask = { ...task, status: completed ? 'completed' : 'pending' as 'completed' | 'pending' };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    toast({ title: 'Task Updated', description: `Task marked as ${completed ? 'completed' : 'pending'}.` });
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedTask(null);
  }

  const getLivestockTypeColor = (type: LivestockType | 'general') => {
    switch (type) {
        case 'dairy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/50';
        case 'poultry': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700/50';
    }
  }

  const TaskItem = ({ task, showDate = false }: { task: FarmTask, showDate?: boolean }) => {
     const time = task.time ? format(parseISO(`1970-01-01T${task.time}:00`), 'h:mm a') : 'Any time';
     
     return (
       <div className="flex items-center space-x-4 py-4 border-b last:border-b-0">
         <Checkbox
           id={`task-${task.id}`}
           checked={task.status === 'completed'}
           onCheckedChange={(checked) => handleStatusChange(task, !!checked)}
         />
         <div className="flex-1">
           <Label htmlFor={`task-${task.id}`} className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
             {task.title}
           </Label>
           <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{showDate ? format(parseISO(task.date), 'MMM d') : time}</span>
            <Badge variant="outline" className={`text-xs ${getLivestockTypeColor(task.livestockType)}`}>{task.livestockType}</Badge>
           </div>
           {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
         </div>
         <div className="flex items-center">
           <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
             <Edit className="h-4 w-4" />
           </Button>
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                 <Trash2 className="h-4 w-4" />
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This action cannot be undone. This will permanently delete the task.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction
                   onClick={() => handleDelete(task.id)}
                   className="bg-destructive hover:bg-destructive/90"
                 >
                   Delete
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         </div>
       </div>
     );
  };

  const DayNavigator = () => (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM d, yyyy')}</h3>
        <p className="text-sm text-muted-foreground">{isToday(currentDate) ? "Today" : format(currentDate, 'eeee')}</p>
      </div>
      <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Card>
            <CardHeader>
                <CardTitle>Task Scheduler</CardTitle>
                <CardDescription>Plan and manage your farm activities.</CardDescription>
            </CardHeader>
            <CardContent>
                <DayNavigator />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Tasks for {isToday(currentDate) ? "Today" : format(currentDate, 'MMM d')}</CardTitle>
                 <CardDescription>A list of tasks scheduled for this day.</CardDescription>
            </CardHeader>
            <CardContent>
                 {tasksForDate.length > 0 ? (
                    tasksForDate.map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <div className="text-muted-foreground text-center py-10">
                      <p>No tasks scheduled for this day.</p>
                      <Button variant="link" onClick={() => { setSelectedTask(null); setFormOpen(true); }} className="mt-2">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Add a new task
                      </Button>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {upcomingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>A glance at your next few tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.map(task => <TaskItem key={task.id} task={task} showDate />)}
            </CardContent>
          </Card>
        )}

        <TaskForm 
            isOpen={isFormOpen}
            onClose={closeForm}
            task={selectedTask}
            selectedDate={currentDate}
        />
    </div>
  );
}
