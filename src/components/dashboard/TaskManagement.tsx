import { useState } from 'react';
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
import { addTaskToReport, completeTaskInReport } from '@/utils/taskDailyReportIntegration';
import TaskGanttChart from './TaskGanttChart';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assignedBy: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'escalated';
  type: 'billable' | 'non-billable';
  category: 'demo' | 'prePostPresentation' | 'corporateConsultingTraining' | 'project' | 'consultingContentPrep' | 'techSupport' | 'meeting' | 'devLearning' | 'misc';
  client?: string;
  dueDate: string;
  dueTime?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  createdAt: string;
  taskType: 'date-based' | 'time-based';
  startedAt?: string;
  completedAt?: string;
  isOverdue?: boolean;
  overdueMinutes?: number;
  escalationReason?: string;
  comments?: Array<{ author: string; text: string; time: string; }>;
}

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

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Implement user authentication system',
      description: 'Build secure login/logout functionality with role-based access control',
      assignee: user.role === 'admin' ? 'John Developer' : user.name,
      assignedBy: 'Admin User',
      priority: 'high',
      status: 'in-progress',
      type: 'billable',
      category: 'project',
      client: 'Acme Corp',
      dueDate: '2024-12-08',
      dueTime: '15:00',
      estimatedHours: 16,
      actualHours: 12,
      tags: ['frontend', 'security', 'react'],
      createdAt: '2024-12-05',
      taskType: 'time-based',
      startedAt: '2024-12-07T09:00:00Z',
      comments: [
        { author: 'John Developer', text: 'Started implementing the login component', time: '2 hours ago' },
        { author: 'Admin User', text: 'Please ensure proper validation', time: '1 day ago' }
      ]
    },
    {
      id: 2,
      title: 'Client product demonstration',
      description: 'Present the new features to potential client',
      assignee: user.role === 'admin' ? 'Sarah Trainer' : user.name,
      assignedBy: 'Admin User',
      priority: 'medium',
      status: 'pending',
      type: 'billable',
      category: 'demo',
      client: 'Tech Solutions',
      dueDate: '2024-12-09',
      dueTime: '14:00',
      estimatedHours: 4,
      actualHours: 0,
      tags: ['demo', 'client', 'presentation'],
      createdAt: '2024-12-06',
      taskType: 'time-based'
    },
    {
      id: 3,
      title: 'Team training session',
      description: 'Conduct training session on new development practices',
      assignee: user.role === 'admin' ? 'Mike Automation' : user.name,
      assignedBy: 'Admin User',
      priority: 'high',
      status: 'escalated',
      type: 'non-billable',
      category: 'corporateConsultingTraining',
      dueDate: '2024-12-08',
      estimatedHours: 8,
      actualHours: 0,
      tags: ['training', 'team', 'development'],
      createdAt: '2024-12-04',
      taskType: 'date-based',
      escalationReason: 'Resource conflict - need to reassign',
      isOverdue: true,
      overdueMinutes: 120
    }
  ]);

  const teamMembers = [
    'John Developer',
    'Sarah Trainer', 
    'Mike Automation',
    'Lisa Designer',
    'Tom Support'
  ];

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualHours'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      actualHours: 0
    };
    setTasks(prev => [...prev, newTask]);
    console.log('New task created:', newTask);
    
    toast({
      title: 'Task Created',
      description: `Task "${newTask.title}" has been assigned to ${newTask.assignee}`,
    });
  };

  const updateTask = (taskId: number, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    console.log('Task updated:', taskId, updates);
  };

  const startTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startTime = new Date().toISOString();
    updateTask(taskId, { 
      status: 'in-progress',
      startedAt: startTime
    });
    
    addTaskToReport(taskId, task.title, task.category, user, task);
    
    toast({
      title: 'Task Started',
      description: `Task "${task.title}" started and is now being tracked in your daily report`,
    });
  };

  const completeTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completionData = completeTaskInReport(taskId, user, task.dueTime);
    
    updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualHours: completionData?.actualHours || 0,
      isOverdue: completionData?.isOverdue || false,
      overdueMinutes: completionData?.overdueMinutes
    });
    
    let message = `Task "${task.title}" has been completed`;
    if (completionData?.isOverdue) {
      message += ` (${completionData.overdueMinutes} minutes late)`;
    }
    
    toast({
      title: 'Task Completed',
      description: message,
      variant: completionData?.isOverdue ? 'destructive' : 'default'
    });
  };

  const escalateTask = () => {
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
      escalationReason: escalationData.reason
    };

    if (escalationData.reassignTo) {
      updates.assignee = escalationData.reassignTo;
    }

    updateTask(escalationDialog.task.id, updates);
    
    toast({
      title: 'Task Escalated',
      description: `Task "${escalationDialog.task.title}" has been escalated${escalationData.reassignTo ? ` and reassigned to ${escalationData.reassignTo}` : ''}`,
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
    switch (category) {
      case 'demo':
        return 'bg-indigo-100 text-indigo-700';
      case 'prePostPresentation':
        return 'bg-purple-100 text-purple-700';
      case 'corporateConsultingTraining':
        return 'bg-emerald-100 text-emerald-700';
      case 'project':
        return 'bg-blue-100 text-blue-700';
      case 'consultingContentPrep':
        return 'bg-orange-100 text-orange-700';
      case 'techSupport':
        return 'bg-red-100 text-red-700';
      case 'meeting':
        return 'bg-slate-100 text-slate-700';
      case 'devLearning':
        return 'bg-cyan-100 text-cyan-700';
      case 'misc':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
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
    return labels[category as keyof typeof labels] || category;
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateString);
  };

  const getDatesWithTasks = () => {
    return tasks.map(task => new Date(task.dueDate));
  };

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
            <TaskAssignmentDialog onTaskCreate={createTask}>
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
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        </div>
                        {task.dueTime && (
                          <div className="flex items-center gap-1 mb-2">
                            <Timer className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Due: {task.dueTime}</span>
                          </div>
                        )}
                        <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                          {getCategoryLabel(task.category)}
                        </Badge>
                        {task.isOverdue && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            Overdue: {task.overdueMinutes}min
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : viewMode === 'list' ? (
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          {task.taskType === 'time-based' && (
                            <Badge variant="outline" className="text-xs">
                              <Timer className="h-3 w-3 mr-1" />
                              Time-based
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">{task.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={task.type === 'billable' ? 'default' : 'secondary'}>
                          {task.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Due: {task.dueDate}</span>
                        {task.dueTime && <span className="text-sm text-blue-600">at {task.dueTime}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{task.actualHours}/{task.estimatedHours}h</span>
                      </div>
                      {task.client && (
                        <div>
                          <span className="text-sm font-medium">Client: {task.client}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                        {getCategoryLabel(task.category)}
                      </Badge>
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {task.isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue: {task.overdueMinutes}min
                        </Badge>
                      )}
                    </div>

                    {task.escalationReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-sm font-medium text-red-800">Escalation Reason:</p>
                        <p className="text-sm text-red-700">{task.escalationReason}</p>
                      </div>
                    )}

                    {task.comments && task.comments.length > 0 && (
                      <div className="border-t pt-3 mb-4">
                        <p className="text-sm font-medium mb-2">Recent Comments:</p>
                        {task.comments.slice(0, 2).map((comment, index) => (
                          <div key={index} className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">{comment.author}:</span> {comment.text}
                            <span className="text-gray-400 ml-2">{comment.time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <TaskDetailsDialog task={task} onTaskUpdate={updateTask} currentUser={user}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TaskDetailsDialog>
                      
                      {user.role === 'admin' && (
                        <>
                          <TaskEditDialog task={task} onTaskUpdate={updateTask}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Task
                            </Button>
                          </TaskEditDialog>
                          
                          {(task.status === 'in-progress' || task.status === 'pending') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEscalationDialog({ open: true, task })}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Escalate
                            </Button>
                          )}
                        </>
                      )}
                      
                      {task.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => startTask(task.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button 
                          size="sm"
                          onClick={() => completeTask(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : null}

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog.open} onOpenChange={(open) => setEscalationDialog({ open, task: escalationDialog.task })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Task</DialogTitle>
            <DialogDescription>
              Escalate "{escalationDialog.task?.title}" and optionally reassign to another team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalationReason">Escalation Reason *</Label>
              <Textarea
                id="escalationReason"
                value={escalationData.reason}
                onChange={(e) => setEscalationData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this task is being escalated..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="reassignTo">Reassign To (Optional)</Label>
              <Select value={escalationData.reassignTo} onValueChange={(value) => setEscalationData(prev => ({ ...prev, reassignTo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member to reassign" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.filter(member => member !== escalationDialog.task?.assignee).map(member => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEscalationDialog({ open: false, task: null })}>
              Cancel
            </Button>
            <Button onClick={escalateTask} variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              Escalate Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
