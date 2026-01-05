'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { FarmTask, LivestockType } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { TaskForm } from './task-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TasksPage() {
  const { getTasks, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FarmTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const allTasks = useMemo(() => getTasks(), [getTasks]);

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allTasks.filter(task => {
        const taskDate = new Date(task.date);
        const selDate = new Date(selectedDate);
        return taskDate.getFullYear() === selDate.getFullYear() &&
               taskDate.getMonth() === selDate.getMonth() &&
               taskDate.getDate() === selDate.getDate();
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allTasks, selectedDate]);

  const upcomingTasks = useMemo(() => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return allTasks.filter(task => new Date(task.date) >= today && task.status === 'pending')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
  }, [allTasks]);


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
        case 'dairy': return 'bg-blue-200 text-blue-800';
        case 'poultry': return 'bg-yellow-200 text-yellow-800';
        default: return 'bg-gray-200 text-gray-800';
    }
  }

  const TaskItem = ({ task }: { task: FarmTask }) => (
    <div className="flex items-center space-x-4 py-2 border-b last:border-b-0">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={(checked) => handleStatusChange(task, !!checked)}
      />
      <div className="flex-1">
        <Label htmlFor={`task-${task.id}`} className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </Label>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <Badge variant="outline" className={`mt-1 text-xs ${getLivestockTypeColor(task.livestockType)}`}>{task.livestockType}</Badge>
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

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Task Scheduler</CardTitle>
            <CardDescription>
                Manage your farm tasks and appointments.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-center">
               <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                        hasTask: allTasks.map(task => new Date(task.date)),
                    }}
                    modifiersStyles={{
                        hasTask: { 
                            fontWeight: 'bold', 
                            textDecoration: 'underline',
                            textDecorationColor: 'hsl(var(--primary))'
                        },
                    }}
                />
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Tasks for {selectedDate ? selectedDate.toLocaleDateString() : 'today'}</h3>
                {tasksForSelectedDate.length > 0 ? (
                    tasksForSelectedDate.map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-muted-foreground text-center pt-8">No tasks for this day.</p>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Your next 5 pending tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                 {upcomingTasks.length > 0 ? (
                    upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-muted-foreground text-center pt-8">No upcoming tasks.</p>
                )}
            </CardContent>
        </Card>

        <TaskForm 
            isOpen={isFormOpen}
            onClose={closeForm}
            task={selectedTask}
            selectedDate={selectedDate}
        />
    </div>
  );
}
