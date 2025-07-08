import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  FileText, 
  Plus,
  Edit2,
  Calendar,
  Phone,
  Mail,
  Building,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddNewLeadForm from './AddNewLeadForm';
import { addFollowUpTask } from '@/utils/salesIntegration';

interface SalesLead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadSource: string;
  assignedTo: string;
  status: 'new' | 'contacted' | 'demo-scheduled' | 'demo-given' | 'quoted' | 'negotiation' | 'closed-won' | 'closed-lost';
  priority?: 'Low' | 'Medium' | 'High';
  demoDate?: string;
  demoNotes?: string;
  quoteAmount?: number;
  quotedDate?: string;
  orderValue?: number;
  closedDate?: string;
  lostReason?: string;
  expectedCloseDate?: string;
  createdDate: string;
  lastUpdated: string;
  notes: string;
  requirement?: string;
  quoteSent?: boolean;
  followUp?: boolean;
  followUpDate?: string;
}

interface SalesTrackingProps {
  user: any;
}

const SalesTracking = ({ user }: SalesTrackingProps) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const leadStatuses = [
    { value: 'new', label: '🆕 New Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: '📞 Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'demo-scheduled', label: '📅 Demo Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'demo-given', label: '🎯 Demo Given', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'quoted', label: '💰 Quoted', color: 'bg-orange-100 text-orange-800' },
    { value: 'negotiation', label: '🤝 In Negotiation', color: 'bg-amber-100 text-amber-800' },
    { value: 'closed-won', label: '🎉 Closed Won', color: 'bg-green-100 text-green-800' },
    { value: 'closed-lost', label: '❌ Closed Lost', color: 'bg-red-100 text-red-800' }
  ];

  const teamMembers = ['John Developer', 'Sarah Trainer', 'Mike Automation', 'Lisa PreSales'];

  useEffect(() => {
    const savedLeads = localStorage.getItem('salesLeads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      const mockLeads: SalesLead[] = [
        {
          id: '1',
          companyName: 'TechCorp Solutions',
          contactPerson: 'Alex Johnson',
          email: 'alex@techcorp.com',
          phone: '+1-555-0123',
          leadSource: 'Website',
          assignedTo: 'Lisa PreSales',
          status: 'demo-given',
          priority: 'High',
          demoDate: '2024-12-05',
          demoNotes: 'Interested in React training for 20 developers',
          quoteAmount: 25000,
          quotedDate: '2024-12-06',
          expectedCloseDate: '2024-12-20',
          createdDate: '2024-12-01',
          lastUpdated: '2024-12-06',
          notes: 'High potential client, decision expected by end of month'
        },
        {
          id: '2',
          companyName: 'StartupXYZ',
          contactPerson: 'Maria Garcia',
          email: 'maria@startupxyz.com',
          phone: '+1-555-0456',
          leadSource: 'Referral',
          assignedTo: 'John Developer',
          status: 'negotiation',
          priority: 'Medium',
          demoDate: '2024-11-28',
          demoNotes: 'Custom development project discussion',
          quoteAmount: 45000,
          quotedDate: '2024-11-30',
          expectedCloseDate: '2024-12-15',
          createdDate: '2024-11-25',
          lastUpdated: '2024-12-03',
          notes: 'Negotiating on timeline and pricing'
        },
        {
          id: '3',
          companyName: 'Enterprise Co',
          contactPerson: 'Robert Smith',
          email: 'robert@enterprise.com',
          phone: '+1-555-0789',
          leadSource: 'Cold Call',
          assignedTo: 'Sarah Trainer',
          status: 'closed-won',
          priority: 'High',
          demoDate: '2024-11-20',
          demoNotes: 'Training program for 50 employees',
          quoteAmount: 75000,
          quotedDate: '2024-11-22',
          orderValue: 72000,
          closedDate: '2024-11-30',
          expectedCloseDate: '2024-11-30',
          createdDate: '2024-11-15',
          lastUpdated: '2024-11-30',
          notes: 'Successfully closed, training starts in January'
        }
      ];
      setLeads(mockLeads);
      localStorage.setItem('salesLeads', JSON.stringify(mockLeads));
    }
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('salesLeads', JSON.stringify(leads));
    }
  }, [leads]);

  const getStatusBadge = (status: string, priority?: string) => {
    const statusConfig = leadStatuses.find(s => s.value === status);
    const priorityColor = priority === 'High' ? 'border-l-4 border-red-500' : 
                         priority === 'Medium' ? 'border-l-4 border-yellow-500' : 
                         'border-l-4 border-green-500';
    
    return statusConfig ? (
      <div className={`flex items-center gap-2 ${priorityColor} pl-2`}>
        <Badge className={statusConfig.color}>
          {statusConfig.label}
        </Badge>
        {priority && (
          <Badge variant="outline" className="text-xs">
            {priority}
          </Badge>
        )}
      </div>
    ) : <Badge>{status}</Badge>;
  };

  const getSalesMetrics = () => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const contacted = leads.filter(lead => lead.status === 'contacted').length;
    const demosScheduled = leads.filter(lead => lead.status === 'demo-scheduled').length;
    const demosGiven = leads.filter(lead => lead.status === 'demo-given').length;
    const quoted = leads.filter(lead => lead.status === 'quoted').length;
    const inNegotiation = leads.filter(lead => lead.status === 'negotiation').length;
    const closedWon = leads.filter(lead => lead.status === 'closed-won').length;
    const closedLost = leads.filter(lead => lead.status === 'closed-lost').length;
    
    const totalOrderValue = leads.filter(lead => lead.orderValue).reduce((sum, lead) => sum + (lead.orderValue || 0), 0);
    const avgOrderValue = closedWon > 0 ? totalOrderValue / closedWon : 0;
    const conversionRate = totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : '0';
    const lossRate = totalLeads > 0 ? ((closedLost / totalLeads) * 100).toFixed(1) : '0';

    return {
      totalLeads, newLeads, contacted, demosScheduled, demosGiven, quoted, inNegotiation,
      closedWon, closedLost, totalOrderValue, avgOrderValue, conversionRate, lossRate
    };
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    if (filterAssignee !== 'all' && lead.assignedTo !== filterAssignee) return false;
    return true;
  });

  const metrics = getSalesMetrics();

  const handleAddNewLead = (newLead: any) => {
    if (newLead.followUp) {
      addFollowUpTask(newLead);
      toast({
        title: '🎯 Follow-up Task Created!',
        description: `A follow-up task has been scheduled for ${newLead.followUpDate}. Stay on top of your sales game! 💪`,
      });
    }

    setLeads(prev => [...prev, newLead]);
    setIsNewLeadModalOpen(false);
    
    toast({
      title: '🚀 New Lead Added to Funnel!',
      description: `${newLead.companyName} is now in your sales pipeline. Time to work some magic! ✨`,
    });
  };

  const handleUpdateLead = (updatedLead: SalesLead) => {
    setLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id 
        ? { ...updatedLead, lastUpdated: new Date().toISOString().split('T')[0] }
        : lead
    ));
    setIsEditModalOpen(false);
    setSelectedLead(null);
    toast({
      title: '✅ Lead Updated Successfully!',
      description: `${updatedLead.companyName} has been updated in your sales funnel!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Funnel Command Center 🎯</h1>
          <p className="text-gray-600 mt-1">Track every lead from first contact to deal closure - master your sales pipeline!</p>
        </div>
        <Button onClick={() => setIsNewLeadModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead 🚀
        </Button>
      </div>

      {/* Sales Funnel ProTip */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">💡 Sales Funnel Mastery!</h3>
              <p className="text-blue-700 text-sm">
                Your complete sales pipeline from new leads to closed deals! Track every stage, identify bottlenecks, 
                and optimize your conversion rates. Each status represents a critical step in your sales journey! 🚀
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Sales Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{metrics.totalLeads}</p>
              <p className="text-xs text-blue-600">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Plus className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">{metrics.newLeads}</p>
              <p className="text-xs text-yellow-600">New Leads</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{metrics.demosGiven}</p>
              <p className="text-xs text-purple-600">Demos Given</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <FileText className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900">{metrics.quoted}</p>
              <p className="text-xs text-orange-600">Quoted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-900">{metrics.inNegotiation}</p>
              <p className="text-xs text-amber-600">In Negotiation</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{metrics.closedWon}</p>
              <p className="text-xs text-green-600">Won</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{metrics.closedLost}</p>
              <p className="text-xs text-red-600">Lost</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <DollarSign className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-indigo-900">${metrics.totalOrderValue.toLocaleString()}</p>
              <p className="text-xs text-indigo-600">Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Win Rate</p>
                <p className="text-3xl font-bold text-teal-900">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">Loss Rate</p>
                <p className="text-3xl font-bold text-rose-900">{metrics.lossRate}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-rose-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Avg Deal Size</p>
                <p className="text-3xl font-bold text-emerald-900">${metrics.avgOrderValue.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {leadStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigneeFilter">Filter by Assignee</Label>
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline ({filteredLeads.length} leads)</CardTitle>
          <CardDescription>Complete overview of your sales funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead className="text-right">Quote Amount</TableHead>
                  <TableHead className="text-right">Order Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.companyName}</p>
                        <p className="text-sm text-gray-600">{lead.leadSource}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.contactPerson}</p>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.assignedTo}</TableCell>
                    <TableCell>{getStatusBadge(lead.status, lead.priority)}</TableCell>
                    <TableCell>{lead.expectedCloseDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      {lead.quoteAmount ? `$${lead.quoteAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.orderValue ? `$${lead.orderValue.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>{lead.lastUpdated}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add New Lead Modal */}
      <Dialog open={isNewLeadModalOpen} onOpenChange={setIsNewLeadModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🚀 Add New Lead to Sales Funnel</DialogTitle>
          </DialogHeader>
          <AddNewLeadForm 
            onSave={handleAddNewLead}
            onCancel={() => setIsNewLeadModalOpen(false)}
            teamMembers={teamMembers}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Lead: {selectedLead?.companyName}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadForm 
              lead={selectedLead} 
              onSave={handleUpdateLead}
              onCancel={() => setIsEditModalOpen(false)}
              teamMembers={teamMembers}
              leadStatuses={leadStatuses}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface LeadFormProps {
  lead: SalesLead;
  onSave: (lead: SalesLead) => void;
  onCancel: () => void;
  teamMembers: string[];
  leadStatuses: Array<{ value: string; label: string; color: string }>;
}

const LeadForm = ({ lead, onSave, onCancel, teamMembers, leadStatuses }: LeadFormProps) => {
  const [formData, setFormData] = useState<SalesLead>(lead);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof SalesLead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company Name</Label>
          <Input
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label>Assigned To</Label>
          <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Demo Date</Label>
          <Input
            type="date"
            value={formData.demoDate || ''}
            onChange={(e) => handleChange('demoDate', e.target.value)}
          />
        </div>
        <div>
          <Label>Quote Amount ($)</Label>
          <Input
            type="number"
            value={formData.quoteAmount || ''}
            onChange={(e) => handleChange('quoteAmount', parseFloat(e.target.value) || undefined)}
          />
        </div>
        <div>
          <Label>Order Value ($)</Label>
          <Input
            type="number"
            value={formData.orderValue || ''}
            onChange={(e) => handleChange('orderValue', parseFloat(e.target.value) || undefined)}
          />
        </div>
        <div>
          <Label>Expected Close Date</Label>
          <Input
            type="date"
            value={formData.expectedCloseDate || ''}
            onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label>Demo Notes</Label>
        <Textarea
          value={formData.demoNotes || ''}
          onChange={(e) => handleChange('demoNotes', e.target.value)}
          placeholder="Notes from demo session..."
          rows={3}
        />
      </div>
      
      <div>
        <Label>General Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Lead
        </Button>
      </div>
    </form>
  );
};

export default SalesTracking;
