
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Target } from 'lucide-react';

interface AddNewLeadFormProps {
  onSave: (lead: any) => void;
  onCancel: () => void;
  teamMembers: string[];
}

const AddNewLeadForm = ({ onSave, onCancel, teamMembers }: AddNewLeadFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    requirement: '',
    salesPerson: '',
    status: 'new' as 'new' | 'contacted' | 'demo-scheduled' | 'demo-given' | 'quoted' | 'negotiation' | 'closed-won' | 'closed-lost',
    leadSource: 'Manual Entry',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    quoteSent: false,
    quoteAmount: '',
    followUp: false,
    followUpDate: '',
    demoDate: '',
    expectedCloseDate: '',
    lostReason: '',
    orderValue: '',
    notes: ''
  });

  const leadStatuses = [
    { value: 'new', label: '🆕 New Lead', description: 'Fresh lead just entered the system' },
    { value: 'contacted', label: '📞 Contacted', description: 'Initial contact has been made' },
    { value: 'demo-scheduled', label: '📅 Demo Scheduled', description: 'Demo meeting is scheduled' },
    { value: 'demo-given', label: '🎯 Demo Given', description: 'Product demo has been completed' },
    { value: 'quoted', label: '💰 Quoted', description: 'Quote has been sent to client' },
    { value: 'negotiation', label: '🤝 In Negotiation', description: 'Actively discussing terms' },
    { value: 'closed-won', label: '🎉 Closed Won', description: 'Deal successfully closed!' },
    { value: 'closed-lost', label: '❌ Closed Lost', description: 'Deal did not proceed' }
  ];

  const leadSources = [
    'Website Inquiry', 'Cold Call', 'Email Campaign', 'Referral', 
    'Trade Show', 'Social Media', 'Partner', 'Manual Entry'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPerson || !formData.salesPerson) {
      toast({
        title: '🎯 Hold On, Sales Champion!',
        description: 'Fill in the company name, contact person, and sales person to get this lead into our amazing sales funnel! 🚀',
        variant: 'destructive',
      });
      return;
    }

    if (formData.followUp && !formData.followUpDate) {
      toast({
        title: '📅 Follow-up Date Missing!',
        description: 'Since you want to follow up, please select when you want to reconnect with this awesome lead! ⏰',
        variant: 'destructive',
      });
      return;
    }

    if (formData.status === 'closed-lost' && !formData.lostReason) {
      toast({
        title: '💡 Why Did We Lose This One?',
        description: 'Help us learn and improve by adding the reason why this lead didn\'t convert. Every insight makes us stronger! 💪',
        variant: 'destructive',
      });
      return;
    }

    const newLead = {
      id: Date.now().toString(),
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      leadSource: formData.leadSource,
      assignedTo: formData.salesPerson,
      status: formData.status,
      priority: formData.priority,
      requirement: formData.requirement,
      quoteSent: formData.quoteSent,
      quoteAmount: formData.quoteAmount ? parseFloat(formData.quoteAmount) : undefined,
      followUp: formData.followUp,
      followUpDate: formData.followUpDate,
      demoDate: formData.demoDate,
      expectedCloseDate: formData.expectedCloseDate,
      lostReason: formData.lostReason,
      orderValue: formData.orderValue ? parseFloat(formData.orderValue) : undefined,
      closedDate: (formData.status === 'closed-won' || formData.status === 'closed-lost') ? new Date().toISOString().split('T')[0] : undefined,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: formData.notes
    };

    onSave(newLead);
  };

  const selectedStatus = leadStatuses.find(s => s.value === formData.status);

  return (
    <div className="space-y-6">
      {/* Sales Funnel ProTip */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 mb-2">🎯 Sales Funnel Mastery!</h3>
              <p className="text-green-700 text-sm leading-relaxed">
                Track your lead from first contact to deal closure! Each stage helps you understand where your opportunities are and optimize your sales process. Let's turn this lead into a success story! 🚀✨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Lead Information</CardTitle>
            <CardDescription>Essential details about your potential client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  placeholder="Primary contact name"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Contact number"
                />
              </div>
            </div>
            
            <div>
              <Label>Requirement</Label>
              <Textarea
                value={formData.requirement}
                onChange={(e) => handleChange('requirement', e.target.value)}
                placeholder="Describe what the client needs..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Process */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Process & Status</CardTitle>
            <CardDescription>Track this lead through your sales funnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sales Person *</Label>
                <Select value={formData.salesPerson} onValueChange={(value) => handleChange('salesPerson', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lead Source</Label>
                <Select value={formData.leadSource} onValueChange={(value) => handleChange('leadSource', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Current Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        <div>
                          <div className="font-medium">{status.label}</div>
                          <div className="text-xs text-gray-500">{status.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStatus && (
                  <p className="text-sm text-gray-600 mt-1">{selectedStatus.description}</p>
                )}
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">🟢 Low Priority</SelectItem>
                    <SelectItem value="Medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="High">🔴 High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
            <CardDescription>Keep track of key milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Demo Date</Label>
                <Input
                  type="date"
                  value={formData.demoDate}
                  onChange={(e) => handleChange('demoDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>Quote amounts and deal values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quote Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.quoteAmount}
                  onChange={(e) => handleChange('quoteAmount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {(formData.status === 'closed-won') && (
                <div>
                  <Label>Order Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.orderValue}
                    onChange={(e) => handleChange('orderValue', e.target.value)}
                    placeholder="Final order value"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="quoteSent"
                checked={formData.quoteSent}
                onCheckedChange={(checked) => handleChange('quoteSent', checked)}
              />
              <Label htmlFor="quoteSent">Quote has been sent to client</Label>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up & Notes</CardTitle>
            <CardDescription>Additional tracking and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUp"
                checked={formData.followUp}
                onCheckedChange={(checked) => handleChange('followUp', checked)}
              />
              <Label htmlFor="followUp">Schedule follow-up for this lead</Label>
            </div>
            
            {formData.followUp && (
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleChange('followUpDate', e.target.value)}
                />
              </div>
            )}

            {formData.status === 'closed-lost' && (
              <div>
                <Label>Reason for Loss</Label>
                <Textarea
                  value={formData.lostReason}
                  onChange={(e) => handleChange('lostReason', e.target.value)}
                  placeholder="Why didn't this lead convert? (pricing, timing, competition, etc.)"
                  rows={2}
                />
              </div>
            )}
            
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional information about this lead..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Add Lead to Funnel! 🎯
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewLeadForm;
