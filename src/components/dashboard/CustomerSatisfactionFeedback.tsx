
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Star, Send, Plus, X } from 'lucide-react';

interface CustomerSatisfactionFeedbackProps {
  taskId: number;
  taskTitle: string;
  children: React.ReactNode;
}

const CustomerSatisfactionFeedback = ({ taskId, taskTitle, children }: CustomerSatisfactionFeedbackProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>(['']);
  const [customMessage, setCustomMessage] = useState('');

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const sendFeedbackForm = () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter at least one valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Generate feedback link (in real app, this would be a unique link)
    const feedbackLink = `${window.location.origin}/feedback/${taskId}`;
    
    // Store feedback request in localStorage (in real app, this would be sent to backend)
    const feedbackRequest = {
      taskId,
      taskTitle,
      emails: validEmails,
      customMessage,
      feedbackLink,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    console.log('Sending feedback form to:', validEmails);
    console.log('Feedback request:', feedbackRequest);

    const existingRequests = JSON.parse(localStorage.getItem('feedback-requests') || '[]');
    existingRequests.push(feedbackRequest);
    localStorage.setItem('feedback-requests', JSON.stringify(existingRequests));

    toast({
      title: 'Feedback Form Sent Successfully! 🎉',
      description: `Feedback form sent to ${validEmails.length} recipient(s). They will receive the survey link via email.`,
    });

    setOpen(false);
    setEmails(['']);
    setCustomMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Send Customer Satisfaction Survey
          </DialogTitle>
          <DialogDescription>
            Send a feedback form to customers for: <strong>{taskTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="emails">Customer Email Addresses</Label>
            <div className="space-y-2 mt-2">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="customer@company.com"
                    className="flex-1"
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmailField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmailField}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Email
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to include with the feedback form..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Feedback Form Will Include:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Training satisfaction rating (1-5 stars)</li>
              <li>• Content quality assessment</li>
              <li>• Trainer effectiveness rating</li>
              <li>• Additional comments section</li>
              <li>• Overall recommendation score</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendFeedbackForm}>
              <Send className="h-4 w-4 mr-2" />
              Send Feedback Form
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSatisfactionFeedback;
