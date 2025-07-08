
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, Filter, ChartGantt } from 'lucide-react';

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
}

interface TaskGanttChartProps {
  tasks: Task[];
}

const TaskGanttChart = ({ tasks }: TaskGanttChartProps) => {
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('all');
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month'>('week');

  // Get unique team members
  const teamMembers = useMemo(() => {
    const members = Array.from(new Set(tasks.map(task => task.assignee)));
    return members.sort();
  }, [tasks]);

  // Generate date range based on view period
  const dateRange = useMemo(() => {
    const today = new Date();
    const dates = [];
    
    if (viewPeriod === 'week') {
      // Show current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
    } else {
      // Show current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      for (let i = 1; i <= endOfMonth.getDate(); i++) {
        dates.push(new Date(today.getFullYear(), today.getMonth(), i));
      }
    }
    
    return dates;
  }, [viewPeriod]);

  // Filter tasks based on selected team member
  const filteredTasks = useMemo(() => {
    return selectedTeamMember === 'all' 
      ? tasks 
      : tasks.filter(task => task.assignee === selectedTeamMember);
  }, [tasks, selectedTeamMember]);

  // Group tasks by assignee
  const tasksByAssignee = useMemo(() => {
    const grouped = filteredTasks.reduce((acc, task) => {
      if (!acc[task.assignee]) {
        acc[task.assignee] = [];
      }
      acc[task.assignee].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    
    return grouped;
  }, [filteredTasks]);

  // Get task for specific date and assignee
  const getTaskForDate = (assignee: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const assigneeTasks = tasksByAssignee[assignee] || [];
    
    return assigneeTasks.filter(task => {
      const taskDate = task.dueDate;
      return taskDate === dateString;
    });
  };

  // Get workload intensity for a date
  const getWorkloadIntensity = (tasks: Task[]) => {
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    if (totalHours === 0) return 'free';
    if (totalHours <= 4) return 'light';
    if (totalHours <= 8) return 'normal';
    return 'heavy';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'free': return 'bg-gray-100';
      case 'light': return 'bg-green-200';
      case 'normal': return 'bg-yellow-200';
      case 'heavy': return 'bg-red-200';
      default: return 'bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'escalated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(viewPeriod === 'week' ? { weekday: 'short' } : {})
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChartGantt className="h-6 w-6 text-blue-600" />
            Team Workload Gantt Chart
          </h2>
          <p className="text-gray-600 mt-1">Visual overview of team member workloads and task schedules</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={viewPeriod} onValueChange={(value: 'week' | 'month') => setViewPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-sm">Free (0h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm">Light (≤4h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span className="text-sm">Normal (≤8h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span className="text-sm">Heavy (&gt;8h)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header with dates */}
              <div className="flex border-b bg-gray-50">
                <div className="w-48 p-4 font-medium text-gray-900 border-r">Team Member</div>
                {dateRange.map((date, index) => (
                  <div key={index} className="w-32 p-2 text-center text-sm font-medium text-gray-700 border-r">
                    {formatDate(date)}
                  </div>
                ))}
              </div>

              {/* Team member rows */}
              {Object.entries(tasksByAssignee).map(([assignee, assigneeTasks]) => (
                <div key={assignee} className="flex border-b hover:bg-gray-50">
                  <div className="w-48 p-4 font-medium text-gray-900 border-r flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {assignee}
                  </div>
                  
                  {dateRange.map((date, dateIndex) => {
                    const dayTasks = getTaskForDate(assignee, date);
                    const intensity = getWorkloadIntensity(dayTasks);
                    const totalHours = dayTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
                    
                    return (
                      <div key={dateIndex} className={`w-32 p-1 border-r ${getIntensityColor(intensity)} relative`}>
                        {dayTasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-center">
                              {totalHours}h
                            </div>
                            <div className="space-y-1">
                              {dayTasks.slice(0, 2).map((task) => (
                                <div
                                  key={task.id}
                                  className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(task.priority)} bg-white shadow-sm`}
                                  title={`${task.title} - ${task.estimatedHours}h - ${task.status}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                                    <span className="truncate">{task.title.substring(0, 15)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-2 w-2 text-gray-500" />
                                    <span className="text-gray-600">{task.estimatedHours}h</span>
                                    {task.type === 'billable' && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">B</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-center text-gray-500">
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
              </div>
              <ChartGantt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{Object.keys(tasksByAssignee).length}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">
                  {filteredTasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredTasks.filter(task => task.isOverdue).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskGanttChart;
