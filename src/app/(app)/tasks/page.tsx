'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { FarmTask, LivestockType } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { TaskForm } from './task-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfToday } from 'date-fns';

export default function TasksPage() {
  const { getTasks, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FarmTask | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('upcoming');
  
  const allTasks = useMemo(() => getTasks(), [getTasks]);

  const uniqueTaskDates = useMemo(() => {
    const dates = allTasks.map(task => format(new Date(task.date), 'yyyy-MM-dd'));
    return [...new Set(dates)].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  }, [allTasks]);
  
  const filteredTasks = useMemo(() => {
    const today = startOfToday();
    if (selectedDateFilter === 'all') {
      return allTasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    if (selectedDateFilter === 'upcoming') {
       return allTasks.filter(task => new Date(task.date) >= today && task.status === 'pending')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return allTasks.filter(task => format(new Date(task.date), 'yyyy-MM-dd') === selectedDateFilter)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allTasks, selectedDateFilter]);


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
  
  const getFilterLabel = () => {
    if (selectedDateFilter === 'upcoming') return 'Upcoming Tasks';
    if (selectedDateFilter === 'all') return 'All Tasks';
    return `Tasks for ${format(new Date(selectedDateFilter), 'PPP')}`;
  }

  const TaskItem = ({ task }: { task: FarmTask }) => (
    <div className="flex items-center space-x-4 py-3 border-b last:border-b-0">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={(checked) => handleStatusChange(task, !!checked)}
      />
      <div className="flex-1">
        <Label htmlFor={`task-${task.id}`} className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </Label>
        <p className="text-sm text-muted-foreground">{format(new Date(task.date), 'PPP')}</p>
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
                <CardTitle>Task Manager</CardTitle>
                <CardDescription>Select a date to view and manage tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a date filter..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="all">All Tasks</SelectItem>
                        {uniqueTaskDates.map(date => (
                            <SelectItem key={date} value={date}>
                                {format(new Date(date), 'PPP')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{getFilterLabel()}</CardTitle>
                 <CardDescription>A list of tasks scheduled for the selected filter.</CardDescription>
            </CardHeader>
            <CardContent>
                 {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-muted-foreground text-center pt-8">No tasks match your filter.</p>
                )}
            </CardContent>
        </Card>

        <TaskForm 
            isOpen={isFormOpen}
            onClose={closeForm}
            task={selectedTask}
            selectedDate={selectedDateFilter !== 'all' && selectedDateFilter !== 'upcoming' ? new Date(selectedDateFilter) : new Date()}
        />
    </div>
  );
}
