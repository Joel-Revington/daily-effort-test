
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Clock, Calendar } from 'lucide-react';

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

interface TaskAssignmentDialogProps {
  children: React.ReactNode;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'actualHours'>) => void;
}

const TaskAssignmentDialog = ({ children, onTaskCreate }: TaskAssignmentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [taskType, setTaskType] = useState<'date-based' | 'time-based'>('date-based');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as const,
    type: 'billable' as const,
    category: 'project' as const,
    client: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    estimatedHours: 8,
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState('');

  // Mock team members - in real app this would come from your user management system
  const teamMembers = [
    'John Developer',
    'Sarah Trainer', 
    'Mike Automation',
    'Lisa Designer',
    'Tom Support'
  ];

  const categoryOptions = [
    { value: 'demo', label: 'Demo' },
    { value: 'prePostPresentation', label: 'Pre/Post Presentation' },
    { value: 'corporateConsultingTraining', label: 'Corporate Training' },
    { value: 'project', label: 'Project' },
    { value: 'consultingContentPrep', label: 'Content Preparation' },
    { value: 'techSupport', label: 'Tech Support' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'devLearning', label: 'Development/Learning' },
    { value: 'misc', label: 'Miscellaneous' }
  ];

  const handleSubmit = () => {
    if (!formData.title || !formData.assignee || !formData.dueDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const taskData = {
      ...formData,
      assignedBy: 'Admin User', // In real app, get from current user context
      status: 'pending' as const,
      taskType,
      dueTime: taskType === 'time-based' ? formData.dueTime : undefined
    };

    onTaskCreate(taskData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      type: 'billable',
      category: 'project',
      client: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '09:00',
      estimatedHours: 8,
      tags: [],
    });
    setCurrentTag('');
    setTaskType('date-based');
    setOpen(false);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogDescription>
            Create and assign a new task to team members
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Task Type Selection */}
          <div>
            <Label>Task Type</Label>
            <Select value={taskType} onValueChange={(value: 'date-based' | 'time-based') => setTaskType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-based">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date-based Task (Full day/multiple days)
                  </div>
                </SelectItem>
                <SelectItem value="time-based">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time-based Task (Specific hours)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="assignee">Assign To *</Label>
              <Select value={formData.assignee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client">Client (Optional)</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Client name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billable">Billable</SelectItem>
                  <SelectItem value="non-billable">Non-Billable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {taskType === 'time-based' && (
              <div>
                <Label htmlFor="dueTime">Due Time</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Assign Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAssignmentDialog;
