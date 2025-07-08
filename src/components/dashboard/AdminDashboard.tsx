
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data - in real app this would come from Supabase
  const teamMetrics = {
    totalMembers: 8,
    activeToday: 6,
    avgBillableHours: 6.2,
    teamEfficiency: 78,
    pendingTasks: 12,
    completedToday: 24
  };

  const teamMembers = [
    { id: 1, name: 'John Developer', position: 'Application Engineer', billableHours: 7.5, efficiency: 85, status: 'active' },
    { id: 2, name: 'Sarah Trainer', position: 'Trainer', billableHours: 6.0, efficiency: 72, status: 'active' },
    { id: 3, name: 'Mike Automation', position: 'Automation Expert', billableHours: 8.0, efficiency: 92, status: 'active' },
    { id: 4, name: 'Lisa PreSales', position: 'Pre-Sales Engineer', billableHours: 5.5, efficiency: 68, status: 'busy' },
  ];

  const recentAlerts = [
    { type: 'warning', message: 'John Developer has 3 overdue tasks', time: '2 hours ago' },
    { type: 'info', message: 'Sarah Trainer logged 2 hours of non-billable time', time: '3 hours ago' },
    { type: 'success', message: 'Mike Automation completed project milestone', time: '4 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-gray-600 mt-1">Monitor team productivity and performance metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.activeToday}/{teamMetrics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.avgBillableHours}h</div>
            <p className="text-xs text-muted-foreground">Per team member today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.teamEfficiency}%</div>
            <Progress value={teamMetrics.teamEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.completedToday}</div>
            <p className="text-xs text-muted-foreground">{teamMetrics.pendingTasks} pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Today</CardTitle>
            <CardDescription>Individual productivity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{member.billableHours}h billable</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.efficiency > 80 ? 'default' : member.efficiency > 70 ? 'secondary' : 'destructive'}>
                        {member.efficiency}% efficiency
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Important team updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                  {alert.type === 'info' && <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
