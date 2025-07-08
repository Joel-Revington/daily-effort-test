
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Filter, 
  TrendingUp, 
  Clock, 
  DollarSign,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportsProps {
  user: any;
}

const Reports = ({ user }: ReportsProps) => {
  const [dateRange, setDateRange] = useState('week');
  const [selectedMember, setSelectedMember] = useState('all');
  const [taskType, setTaskType] = useState('all');

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', billable: 7.5, nonBillable: 1.5, valueAdd: 0.5 },
    { day: 'Tue', billable: 6.0, nonBillable: 2.0, valueAdd: 1.0 },
    { day: 'Wed', billable: 8.0, nonBillable: 1.0, valueAdd: 0.5 },
    { day: 'Thu', billable: 7.0, nonBillable: 1.5, valueAdd: 1.0 },
    { day: 'Fri', billable: 6.5, nonBillable: 2.0, valueAdd: 0.5 },
  ];

  const teamEfficiencyData = [
    { name: 'Billable', value: 65, color: '#22c55e' },
    { name: 'Non-Billable', value: 20, color: '#f59e0b' },
    { name: 'Value-Add', value: 10, color: '#8b5cf6' },
    { name: 'Non-Value', value: 5, color: '#ef4444' },
  ];

  const teamMembers = ['All Team', 'John Developer', 'Sarah Trainer', 'Mike Automation', 'Lisa PreSales'];
  const taskTypes = ['All Types', 'Billable', 'Non-Billable', 'R&D', 'Support'];

  const summaryStats = {
    totalHours: 287.5,
    billableHours: 186.5,
    avgEfficiency: 78,
    completedTasks: 24,
    revenue: 14650
  };

  // Mock detailed report data for table view
  const detailedReportData = [
    { date: '2024-12-06', member: 'John Developer', client: 'Acme Corp', project: 'Authentication System', task: 'API Development', category: 'Project', type: 'Billable', hours: 7.5, rate: 125, revenue: 937.50 },
    { date: '2024-12-06', member: 'John Developer', client: '-', project: 'Internal', task: 'Team Meeting', category: 'Meeting', type: 'Non-Billable', hours: 0.5, rate: 0, revenue: 0 },
    { date: '2024-12-06', member: 'Sarah Trainer', client: 'TechCorp', project: 'React Training', task: 'Training Delivery', category: 'Training', type: 'Billable', hours: 6.0, rate: 150, revenue: 900 },
    { date: '2024-12-06', member: 'Sarah Trainer', client: '-', project: 'Internal', task: 'Content Preparation', category: 'Training Prep', type: 'Non-Billable', hours: 1.5, rate: 0, revenue: 0 },
    { date: '2024-12-05', member: 'Mike Automation', client: 'StartupXYZ', project: 'Process Automation', task: 'Script Development', category: 'Project', type: 'Billable', hours: 8.0, rate: 100, revenue: 800 },
    { date: '2024-12-05', member: 'Lisa PreSales', client: 'Enterprise Co', project: 'Sales Demo', task: 'Product Demo', category: 'Demo', type: 'Billable', hours: 2.0, rate: 120, revenue: 240 },
    { date: '2024-12-05', member: 'Lisa PreSales', client: 'Enterprise Co', project: 'Sales Support', task: 'Proposal Writing', category: 'Pre-Sales', type: 'Billable', hours: 4.0, rate: 120, revenue: 480 },
    { date: '2024-12-04', member: 'John Developer', client: 'Acme Corp', project: 'Database Design', task: 'Schema Planning', category: 'Project', type: 'Billable', hours: 6.0, rate: 125, revenue: 750 },
    { date: '2024-12-04', member: 'John Developer', client: '-', project: 'Learning', task: 'New Framework Study', category: 'Learning', type: 'Non-Billable', hours: 2.0, rate: 0, revenue: 0 },
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting report in ${format} format`);
    // In real app, this would generate and download the report
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Project': 'bg-blue-100 text-blue-800',
      'Training': 'bg-green-100 text-green-800',
      'Demo': 'bg-purple-100 text-purple-800',
      'Meeting': 'bg-gray-100 text-gray-800',
      'Learning': 'bg-yellow-100 text-yellow-800',
      'Pre-Sales': 'bg-orange-100 text-orange-800',
      'Training Prep': 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze team productivity and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {user.role === 'admin' && (
              <div>
                <Label htmlFor="member">Team Member</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member.toLowerCase().replace(' ', '-')}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{summaryStats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.billableHours}h</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-purple-600">{summaryStats.avgEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.completedTasks}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">${summaryStats.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Hours Breakdown</CardTitle>
                <CardDescription>Daily time allocation across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="billable" fill="#22c55e" name="Billable" />
                    <Bar dataKey="nonBillable" fill="#f59e0b" name="Non-Billable" />
                    <Bar dataKey="valueAdd" fill="#8b5cf6" name="Value-Add" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Efficiency Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>Overall team time allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={teamEfficiencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {teamEfficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Team members by efficiency rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Mike Automation', efficiency: 92, hours: 40 },
                    { name: 'John Developer', efficiency: 85, hours: 38 },
                    { name: 'Sarah Trainer', efficiency: 72, hours: 35 },
                    { name: 'Lisa PreSales', efficiency: 68, hours: 32 },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.hours}h this week</p>
                      </div>
                      <Badge variant={member.efficiency > 80 ? 'default' : member.efficiency > 70 ? 'secondary' : 'destructive'}>
                        {member.efficiency}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Analysis</CardTitle>
                <CardDescription>Available capacity for new work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'John Developer', capacity: 15, status: 'available' },
                    { name: 'Sarah Trainer', capacity: 8, status: 'limited' },
                    { name: 'Mike Automation', capacity: 5, status: 'busy' },
                    { name: 'Lisa PreSales', capacity: 20, status: 'available' },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.capacity}h available</p>
                      </div>
                      <Badge variant={
                        member.status === 'available' ? 'default' : 
                        member.status === 'limited' ? 'secondary' : 'destructive'
                      }>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Activity Report</CardTitle>
              <CardDescription>Excel-style table view of all activities and time tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[150px]">Team Member</TableHead>
                      <TableHead className="w-[120px]">Client</TableHead>
                      <TableHead className="w-[150px]">Project</TableHead>
                      <TableHead className="w-[200px]">Task</TableHead>
                      <TableHead className="w-[120px]">Category</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[80px] text-right">Hours</TableHead>
                      <TableHead className="w-[80px] text-right">Rate</TableHead>
                      <TableHead className="w-[100px] text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedReportData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{row.date}</TableCell>
                        <TableCell className="font-medium">{row.member}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell>{row.project}</TableCell>
                        <TableCell>{row.task}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadgeColor(row.category)}>
                            {row.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.type === 'Billable' ? 'default' : 'secondary'}>
                            {row.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.hours}</TableCell>
                        <TableCell className="text-right font-mono">${row.rate}</TableCell>
                        <TableCell className="text-right font-mono font-medium">${row.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
