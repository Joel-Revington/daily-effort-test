
interface TaskReportEntry {
  taskId: number;
  taskTitle: string;
  category: string;
  startTime: string;
  endTime?: string;
  actualHours: number;
  status: 'started' | 'completed' | 'overdue' | 'escalated';
  isOverdue: boolean;
  overdueMinutes?: number;
  assignee?: string;
  priority?: 'high' | 'medium' | 'low';
  type?: 'billable' | 'non-billable';
  client?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
  tags?: string[];
  taskType?: 'date-based' | 'time-based';
}

interface User {
  id: string;
  name: string;
  role: string;
}

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

// Track task time in daily reports with enhanced data
export const addTaskToReport = (taskId: number, taskTitle: string, category: string, user: User, taskData?: Partial<Task>) => {
  console.log('Adding task to daily report:', {
    taskId,
    taskTitle,
    category,
    user: user.name,
    startTime: new Date().toISOString()
  });
  
  const existingEntries = JSON.parse(localStorage.getItem(`task-entries-${user.id}`) || '[]');
  
  const newEntry: TaskReportEntry = {
    taskId,
    taskTitle,
    category,
    startTime: new Date().toISOString(),
    actualHours: 0,
    status: 'started',
    isOverdue: false,
    assignee: taskData?.assignee || user.name,
    priority: taskData?.priority,
    type: taskData?.type,
    client: taskData?.client,
    dueDate: taskData?.dueDate,
    dueTime: taskData?.dueTime,
    estimatedHours: taskData?.estimatedHours,
    tags: taskData?.tags,
    taskType: taskData?.taskType
  };
  
  existingEntries.push(newEntry);
  localStorage.setItem(`task-entries-${user.id}`, JSON.stringify(existingEntries));
  
  return newEntry;
};

// Complete task and calculate time difference
export const completeTaskInReport = (taskId: number, user: User, dueTime?: string) => {
  const existingEntries: TaskReportEntry[] = JSON.parse(localStorage.getItem(`task-entries-${user.id}`) || '[]');
  
  const entryIndex = existingEntries.findIndex(entry => entry.taskId === taskId && !entry.endTime);
  
  if (entryIndex !== -1) {
    const entry = existingEntries[entryIndex];
    const endTime = new Date();
    const startTime = new Date(entry.startTime);
    
    // Calculate actual hours
    const actualHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Check if task is overdue (for time-based tasks)
    let isOverdue = false;
    let overdueMinutes = 0;
    
    if (dueTime) {
      const today = new Date().toISOString().split('T')[0];
      const dueDateTime = new Date(`${today}T${dueTime}`);
      
      if (endTime > dueDateTime) {
        isOverdue = true;
        overdueMinutes = Math.floor((endTime.getTime() - dueDateTime.getTime()) / (1000 * 60));
      }
    }
    
    existingEntries[entryIndex] = {
      ...entry,
      endTime: endTime.toISOString(),
      actualHours: Math.round(actualHours * 4) / 4, // Round to nearest 0.25
      status: 'completed',
      isOverdue,
      overdueMinutes: isOverdue ? overdueMinutes : undefined
    };
    
    localStorage.setItem(`task-entries-${user.id}`, JSON.stringify(existingEntries));
    
    console.log('Task completed in report:', {
      taskId,
      actualHours: existingEntries[entryIndex].actualHours,
      isOverdue,
      overdueMinutes
    });
    
    return existingEntries[entryIndex];
  }
  
  return null;
};

// Get task entries for a specific date
export const getTaskEntriesForDate = (user: User, date: string): TaskReportEntry[] => {
  const allEntries: TaskReportEntry[] = JSON.parse(localStorage.getItem(`task-entries-${user.id}`) || '[]');
  
  return allEntries.filter(entry => {
    const entryDate = new Date(entry.startTime).toISOString().split('T')[0];
    return entryDate === date;
  });
};

// Calculate DCR score based on task completion and timeliness
export const calculateDCRScore = (user: User, date: string): number => {
  const taskEntries = getTaskEntriesForDate(user, date);
  
  if (taskEntries.length === 0) return 1; // No tasks = poor score
  
  let score = 5; // Start with perfect score
  let completedTasks = 0;
  let totalOverdueMinutes = 0;
  
  taskEntries.forEach(entry => {
    if (entry.status === 'completed') {
      completedTasks++;
      if (entry.isOverdue && entry.overdueMinutes) {
        totalOverdueMinutes += entry.overdueMinutes;
      }
    }
  });
  
  // Completion rate factor
  const completionRate = completedTasks / taskEntries.length;
  if (completionRate < 1) {
    score -= (1 - completionRate) * 2; // Lose up to 2 points for incomplete tasks
  }
  
  // Timeliness factor
  if (totalOverdueMinutes > 0) {
    const overdueHours = totalOverdueMinutes / 60;
    score -= Math.min(overdueHours * 0.5, 2); // Lose up to 2 points for being late
  }
  
  // Ensure score is between 1 and 5
  return Math.max(1, Math.min(5, Math.round(score * 10) / 10));
};

// Get DCR insights for display
export const getDCRInsights = (user: User, date: string) => {
  const taskEntries = getTaskEntriesForDate(user, date);
  const score = calculateDCRScore(user, date);
  
  const completed = taskEntries.filter(e => e.status === 'completed').length;
  const overdue = taskEntries.filter(e => e.isOverdue).length;
  const totalOverdueMinutes = taskEntries
    .filter(e => e.isOverdue && e.overdueMinutes)
    .reduce((sum, e) => sum + (e.overdueMinutes || 0), 0);
  
  let message = '';
  if (score >= 4.5) {
    message = 'Excellent performance! Keep up the great work.';
  } else if (score >= 3.5) {
    message = 'Good performance with room for improvement.';
  } else if (score >= 2.5) {
    message = 'Average performance. Focus on completing tasks on time.';
  } else {
    message = 'Performance needs improvement. Consider better time management.';
  }
  
  return {
    score,
    totalTasks: taskEntries.length,
    completed,
    overdue,
    totalOverdueMinutes,
    message
  };
};
