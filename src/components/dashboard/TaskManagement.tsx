import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Calendar as CalendarIcon,
  User,
  Edit,
  Eye,
  Play,
  Pause,
  AlertCircle,
  UserX,
  Timer,
  ChartGantt
} from 'lucide-react';
import TaskAssignmentDialog from './TaskAssignmentDialog';
import TaskDetailsDialog from './TaskDetailsDialog';
import TaskEditDialog from './TaskEditDialog';
import TaskGanttChart from './TaskGanttChart';
import { tasksApi, profilesApi } from '@/lib/supabase-api';
import type { Task, Profile } from '@/lib/supabase-types';

interface TaskManagementProps {
  user: any;
}

const TaskManagement = ({ user }: TaskManagementProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null
  });
  const [escalationData, setEscalationData] = useState({
    reason: '',
    reassignTo: ''
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    loadTeamMembers();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll(user.id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const profiles = await profilesApi.getAll();
      setTeamMembers(profiles);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await tasksApi.create({
        ...taskData,
        assigned_by_id: user.id,
        actual_hours: 0,
        is_overdue: false,
        overdue_minutes: 0,
        comments: []
      });
      
      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: 'Task Created',
        description: `Task "${newTask.title}" has been assigned to ${newTask.assignee_id}`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksApi.update(taskId, updates);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const startTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startTime = new Date().toISOString();
    await updateTask(taskId, { 
      status: 'in-progress',
      started_at: startTime
    });
    
    toast({
      title: 'Task Started',
      description: `Task "${task.title}" started and is now being tracked`,
    });
  };

  const completeTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completionTime = new Date();
    const startTime = task.started_at ? new Date(task.started_at) : completionTime;
    const actualHours = (completionTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Check if task is overdue (for time-based tasks)
    let isOverdue = false;
    let overdueMinutes = 0;
    
    if (task.due_time) {
      const today = new Date().toISOString().split('T')[0];
      const dueDateTime = new Date(`${today}T${task.due_time}`);
      
      if (completionTime > dueDateTime) {
        isOverdue = true;
        overdueMinutes = Math.floor((completionTime.getTime() - dueDateTime.getTime()) / (1000 * 60));
      }
    }
    
    await updateTask(taskId, { 
      status: 'completed',
      completed_at: completionTime.toISOString(),
      actual_hours: Math.round(actualHours * 4) / 4,
      is_overdue: isOverdue,
      overdue_minutes: overdueMinutes
    });
    
    let message = `Task "${task.title}" has been completed`;
    if (isOverdue) {
      message += ` (${overdueMinutes} minutes late)`;
    }
    
    toast({
      title: 'Task Completed',
      description: message,
      variant: isOverdue ? 'destructive' : 'default'
    });
  };

  const escalateTask = async () => {
    if (!escalationDialog.task || !escalationData.reason) {
      toast({
        title: 'Missing Information',
        description: 'Please provide an escalation reason.',
        variant: 'destructive',
      });
      return;
    }

    const updates: Partial<Task> = {
      status: 'escalated',
      escalation_reason: escalationData.reason
    };

    if (escalationData.reassignTo) {
      updates.assignee_id = escalationData.reassignTo;
    }

    await updateTask(escalationDialog.task.id, updates);
    
    toast({
      title: 'Task Escalated',
      description: `Task "${escalationDialog.task.title}" has been escalated${escalationData.reassignTo ? ` and reassigned` : ''}`,
    });

    setEscalationDialog({ open: false, task: null });
    setEscalationData({ reason: '', reassignTo: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'escalated':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'demo': 'bg-indigo-100 text-indigo-700',
      'prePostPresentation': 'bg-purple-100 text-purple-700',
      'corporateConsultingTraining': 'bg-emerald-100 text-emerald-700',
      'project': 'bg-blue-100 text-blue-700',
      'consultingContentPrep': 'bg-orange-100 text-orange-700',
      'techSupport': 'bg-red-100 text-red-700',
      'meeting': 'bg-slate-100 text-slate-700',
      'devLearning': 'bg-cyan-100 text-cyan-700',
      'misc': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      demo: 'Demo',
      prePostPresentation: 'Pre/Post Presentation',
      corporateConsultingTraining: 'Corporate Training',
      project: 'Project',
      consultingContentPrep: 'Content Prep',
      techSupport: 'Tech Support',
      meeting: 'Meeting',
      devLearning: 'Dev/Learning',
      misc: 'Miscellaneous'
    };
    return labels[category] || category;
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.due_date === dateString);
  };

  const getDatesWithTasks = () => {
    return tasks.map(task => new Date(task.due_date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'admin' ? 'Assign and track team tasks with automatic daily report integration' : 'Your assigned tasks with automatic daily report tracking and DCR scoring'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button
            variant={viewMode === 'gantt' ? 'default' : 'outline'}
            onClick={() => setViewMode('gantt')}
          >
            <ChartGantt className="h-4 w-4 mr-2" />
            Gantt View
          </Button>
          {user.role === 'admin' && (
            <TaskAssignmentDialog onTaskCreate={createTask} teamMembers={teamMembers}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            </TaskAssignmentDialog>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'escalated').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <TaskGanttChart tasks={tasks} />
      )}

      {/* Calendar View or List View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
              <CardDescription>View tasks by due date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasTasks: getDatesWithTasks()
                }}
                modifiersStyles={{
                  hasTasks: { 
                    backgroundColor: '#3b82f6', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Tasks for {selectedDate?.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-sm">No tasks due on this date</p>
                  ) : (
                    getTasksForDate(selectedDate).map((task) => (
                      <div key={task.id} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <h4 className="font-medium text-sm">{task.title}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center justify-between mb-2">Let me start by creating the database schema for all the entities we need:

<boltArtifact id="supabase-migration-schema" title="Create Supabase Database Schema">