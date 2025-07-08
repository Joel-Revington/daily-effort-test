import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Clock, MessageSquare, Star } from 'lucide-react';
import CustomerSatisfactionFeedback from './CustomerSatisfactionFeedback';

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

interface TaskDetailsDialogProps {
  task: Task;
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
  children: React.ReactNode;
  currentUser: any;
}

const TaskDetailsDialog = ({ task, onTaskUpdate, children, currentUser }: TaskDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      case 'escalated': return 'destructive';
      default: return 'outline';
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      author: currentUser.name || 'Unknown User',
      text: newComment,
      time: 'Just now'
    };

    onTaskUpdate(task.id, {
      comments: [...(task.comments || []), comment]
    });

    setNewComment('');
  };

  const isTrainingTask = task.category === 'corporateConsultingTraining' || task.category === 'demo';
  const isCompletedTraining = task.status === 'completed' && isTrainingTask;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <DialogDescription>
                Task Details and Progress
              </DialogDescription>
            </div>
            {isCompletedTraining && (
              <CustomerSatisfactionFeedback 
                taskId={task.id} 
                taskTitle={task.title}
              >
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Get Feedback
                </Button>
              </CustomerSatisfactionFeedback>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Assigned to:</strong> {task.assignee}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Assigned by:</strong> {task.assignedBy}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Due Date:</strong> {task.dueDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Time:</strong> {task.actualHours}h / {task.estimatedHours}h
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority} priority
                </Badge>
                <Badge variant={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <div>
                <Badge variant={task.type === 'billable' ? 'default' : 'secondary'}>
                  {task.type}
                </Badge>
              </div>
              {task.client && (
                <div>
                  <span className="text-sm"><strong>Client:</strong> {task.client}</span>
                </div>
              )}
            </div>
          </div>

          {/* Show feedback notification for completed training */}
          {isCompletedTraining && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Training Completed - Get Customer Feedback</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                This training session is complete. You can now send a satisfaction survey to your customers.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Info */}
          {task.status === 'escalated' && task.escalationReason && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h4 className="font-medium mb-2 text-red-800">Escalation Reason</h4>
              <p className="text-sm text-red-700">{task.escalationReason}</p>
            </div>
          )}

          <Separator />

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <h4 className="font-medium">Comments ({task.comments?.length || 0})</h4>
            </div>
            
            {/* Existing Comments */}
            <div className="space-y-3 mb-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <Button onClick={addComment} size="sm">
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
