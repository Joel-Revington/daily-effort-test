
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Clock, 
  Award, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  Plus,
  Calendar,
  Trophy,
  Target
} from 'lucide-react';
import { getDCRInsights } from '@/utils/taskDailyReportIntegration';

interface KPIEntry {
  id: string;
  date: string;
  customerSatisfaction: number;
  timelyDelivery: number;
  certifications: string;
  leadGeneration: number;
  dcrMaintenance: number;
  technicalEscalations: number;
  notes: string;
}

interface KPITrackingProps {
  user: any;
}

const KPITracking = ({ user }: KPITrackingProps) => {
  const { toast } = useToast();
  
  const [kpiEntries, setKpiEntries] = useState<KPIEntry[]>([
    {
      id: '1',
      date: '2024-12-06',
      customerSatisfaction: 4.5,
      timelyDelivery: 5,
      certifications: 'AutoCAD Advanced Module',
      leadGeneration: 3,
      dcrMaintenance: 4,
      technicalEscalations: 0,
      notes: 'Completed training for TechCorp, good feedback received'
    },
    {
      id: '2',
      date: '2024-12-05',
      customerSatisfaction: 4.2,
      timelyDelivery: 4,
      certifications: '',
      leadGeneration: 2,
      dcrMaintenance: 5,
      technicalEscalations: 1,
      notes: 'Minor technical issue resolved quickly'
    }
  ]);

  const [formData, setFormData] = useState({
    customerSatisfaction: '',
    timelyDelivery: '',
    certifications: '',
    leadGeneration: '',
    dcrMaintenance: '',
    technicalEscalations: '',
    notes: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [todayDCR, setTodayDCR] = useState<any>(null);

  // Load today's DCR score
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dcrInsights = getDCRInsights(user, today);
    setTodayDCR(dcrInsights);
  }, [user]);

  const handleSubmit = () => {
    if (!formData.customerSatisfaction || !formData.timelyDelivery) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the required KPI fields.',
        variant: 'destructive',
      });
      return;
    }

    // Auto-populate DCR score from task tracking system
    const todayDCRScore = todayDCR ? todayDCR.score : 3;

    const newEntry: KPIEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      customerSatisfaction: Number(formData.customerSatisfaction),
      timelyDelivery: Number(formData.timelyDelivery),
      certifications: formData.certifications,
      leadGeneration: Number(formData.leadGeneration) || 0,
      dcrMaintenance: todayDCRScore, // Auto-populated from task tracking
      technicalEscalations: Number(formData.technicalEscalations) || 0,
      notes: formData.notes
    };

    setKpiEntries(prev => [newEntry, ...prev]);
    setFormData({
      customerSatisfaction: '',
      timelyDelivery: '',
      certifications: '',
      leadGeneration: '',
      dcrMaintenance: '',
      technicalEscalations: '',
      notes: ''
    });
    setIsDialogOpen(false);

    toast({
      title: 'KPI Entry Added',
      description: `Your performance metrics have been recorded with DCR score of ${todayDCRScore.toFixed(1)}/5.`,
    });
  };

  // Calculate average KPIs
  const avgKPIs = {
    customerSatisfaction: kpiEntries.reduce((sum, entry) => sum + entry.customerSatisfaction, 0) / kpiEntries.length,
    timelyDelivery: kpiEntries.reduce((sum, entry) => sum + entry.timelyDelivery, 0) / kpiEntries.length,
    leadGeneration: kpiEntries.reduce((sum, entry) => sum + entry.leadGeneration, 0),
    dcrMaintenance: kpiEntries.reduce((sum, entry) => sum + entry.dcrMaintenance, 0) / kpiEntries.length,
    technicalEscalations: kpiEntries.reduce((sum, entry) => sum + entry.technicalEscalations, 0)
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return 'default';
    if (score >= 3.5) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI Performance Tracking</h2>
          <p className="text-gray-600 mt-1">Track and monitor your key performance indicators with automated DCR scoring</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add KPI Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record KPI Performance</DialogTitle>
              <DialogDescription>
                Enter your performance metrics for today. DCR score will be auto-populated from your task completion data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* DCR Score Display */}
              {todayDCR && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Today's DCR Score (Auto-populated)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getScoreColor(todayDCR.score)}`}>
                      {todayDCR.score}/5
                    </span>
                    <div className="flex-1">
                      <Progress value={(todayDCR.score / 5) * 100} className="h-2" />
                      <p className="text-sm text-gray-600 mt-1">{todayDCR.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerSatisfaction">Customer Satisfaction (1-5) *</Label>
                  <Select 
                    value={formData.customerSatisfaction} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerSatisfaction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} - {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timelyDelivery">Timely Delivery (1-5) *</Label>
                  <Select 
                    value={formData.timelyDelivery} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timelyDelivery: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} - {rating === 5 ? 'Always On Time' : rating === 4 ? 'Mostly On Time' : rating === 3 ? 'Sometimes Late' : rating === 2 ? 'Often Late' : 'Always Late'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="certifications">Certifications & Skill Upgrades</Label>
                <Input
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="Enter any certifications or skills learned"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadGeneration">Lead Generation Count</Label>
                  <Input
                    id="leadGeneration"
                    type="number"
                    min="0"
                    value={formData.leadGeneration}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadGeneration: e.target.value }))}
                    placeholder="Number of leads generated"
                  />
                </div>
                
                <div>
                  <Label htmlFor="technicalEscalations">Technical Escalation Cases</Label>
                  <Input
                    id="technicalEscalations"
                    type="number"
                    min="0"
                    value={formData.technicalEscalations}
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalEscalations: e.target.value }))}
                    placeholder="Number of technical escalations"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional comments or notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Save KPI Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgKPIs.customerSatisfaction)}`}>
              {avgKPIs.customerSatisfaction.toFixed(1)}/5
            </div>
            <Progress value={(avgKPIs.customerSatisfaction / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timely Delivery</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgKPIs.timelyDelivery)}`}>
              {avgKPIs.timelyDelivery.toFixed(1)}/5
            </div>
            <Progress value={(avgKPIs.timelyDelivery / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Generation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgKPIs.leadGeneration}</div>
            <p className="text-xs text-muted-foreground">Total leads this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DCR Maintenance (Auto-tracked)</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgKPIs.dcrMaintenance)}`}>
              {avgKPIs.dcrMaintenance.toFixed(1)}/5
            </div>
            <Progress value={(avgKPIs.dcrMaintenance / 5) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Based on task completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgKPIs.technicalEscalations === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgKPIs.technicalEscalations}
            </div>
            <p className="text-xs text-muted-foreground">
              {avgKPIs.technicalEscalations === 0 ? 'Zero escalations achieved!' : 'Cases this month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {kpiEntries.filter(entry => entry.certifications).length}
            </div>
            <p className="text-xs text-muted-foreground">Skills upgraded this month</p>
          </CardContent>
        </Card>
      </div>

      {/* DCR Performance Insights */}
      {todayDCR && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Today's DCR Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{todayDCR.totalTasks}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{todayDCR.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{todayDCR.overdue}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{Math.floor(todayDCR.totalOverdueMinutes / 60)}h {todayDCR.totalOverdueMinutes % 60}m</p>
                <p className="text-sm text-gray-600">Total Delay</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/60 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Performance Impact:</p>
              <p className="text-sm text-blue-800">{todayDCR.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent KPI Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent KPI Entries
          </CardTitle>
          <CardDescription>Your latest performance records with DCR integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpiEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-medium">{entry.date}</span>
                    <div className="flex gap-2">
                      <Badge variant={getScoreBadge(entry.customerSatisfaction)}>
                        CS: {entry.customerSatisfaction}
                      </Badge>
                      <Badge variant={getScoreBadge(entry.timelyDelivery)}>
                        TD: {entry.timelyDelivery}
                      </Badge>
                      <Badge variant={getScoreBadge(entry.dcrMaintenance)} className="bg-purple-100 text-purple-800">
                        DCR: {entry.dcrMaintenance}
                      </Badge>
                      {entry.leadGeneration > 0 && (
                        <Badge variant="default">
                          Leads: {entry.leadGeneration}
                        </Badge>
                      )}
                      {entry.technicalEscalations === 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Zero Escalations
                        </Badge>
                      )}
                    </div>
                  </div>
                  {entry.certifications && (
                    <p className="text-sm text-gray-600 mb-1">
                      <Award className="h-4 w-4 inline mr-1" />
                      {entry.certifications}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-sm text-gray-500">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPITracking;
