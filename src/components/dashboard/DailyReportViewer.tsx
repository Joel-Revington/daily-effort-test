import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Filter, 
  Calendar, 
  Clock,
  User,
  BarChart3,
  Table,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reportStore, type ReportData } from '@/utils/reportStore';

interface DailyReportViewerProps {
  user: any;
}

const DailyReportViewer = ({ user }: DailyReportViewerProps) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    member: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'pivot' | 'detailed'>('pivot');

  // Load reports on component mount and when filters change
  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = () => {
    let allReports = reportStore.getReports(user.id, user.role);
    
    // Apply date filters
    if (filters.startDate && filters.endDate) {
      allReports = allReports.filter(report => 
        report.date >= filters.startDate && report.date <= filters.endDate
      );
    }
    
    // Apply member filter (admin only)
    if (user.role === 'admin' && filters.member !== 'all') {
      allReports = allReports.filter(report => 
        report.userName.toLowerCase().includes(filters.member.toLowerCase())
      );
    }
    
    // Apply search filter
    if (filters.search) {
      allReports = allReports.filter(report =>
        report.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.generalNotes.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.activities.some(activity => 
          activity.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
          activity.category.toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }
    
    setReports(allReports);
    setFilteredReports(allReports);
  };

  // Generate pivot data: summing hours by category and billable status
  const generatePivotData = () => {
    const pivotData: any = {};
    
    filteredReports.forEach(report => {
      report.activities.forEach(activity => {
        const key = activity.category;
        if (!pivotData[key]) {
          pivotData[key] = {
            category: key,
            totalHours: 0,
            billableHours: 0,
            nonBillableHours: 0,
            memberHours: {},
            dateHours: {}
          };
        }
        
        pivotData[key].totalHours += activity.hours;
        if (activity.isBillable) {
          pivotData[key].billableHours += activity.hours;
        } else {
          pivotData[key].nonBillableHours += activity.hours;
        }
        
        // Track by member
        if (!pivotData[key].memberHours[report.userName]) {
          pivotData[key].memberHours[report.userName] = 0;
        }
        pivotData[key].memberHours[report.userName] += activity.hours;
        
        // Track by date
        if (!pivotData[key].dateHours[report.date]) {
          pivotData[key].dateHours[report.date] = 0;
        }
        pivotData[key].dateHours[report.date] += activity.hours;
      });
    });
    
    return Object.values(pivotData);
  };

  const generateChartData = () => {
    const pivotData = generatePivotData();
    return pivotData.map((item: any) => ({
      category: item.category,
      billable: item.billableHours,
      nonBillable: item.nonBillableHours,
      total: item.totalHours
    }));
  };

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'half day': return 'bg-yellow-100 text-yellow-800';
      case 'leave': return 'bg-red-100 text-red-800';
      case 'work from home': return 'bg-blue-100 text-blue-800';
      case 'client site': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const pivotData = generatePivotData();
  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'admin' ? 'View all team daily reports' : 'View your daily reports'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'pivot' ? 'default' : 'outline'}
            onClick={() => setViewMode('pivot')}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Pivot View
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewMode('detailed')}
            size="sm"
          >
            <Table className="h-4 w-4 mr-2" />
            Detailed View
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            {user.role === 'admin' && (
              <div>
                <Label htmlFor="member">Team Member</Label>
                <Select value={filters.member} onValueChange={(value) => handleFilterChange('member', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="john">John Developer</SelectItem>
                    <SelectItem value="sarah">Sarah Trainer</SelectItem>
                    <SelectItem value="mike">Mike Automation</SelectItem>
                    <SelectItem value="lisa">Lisa PreSales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'pivot' ? (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Activity Summary</TabsTrigger>
            <TabsTrigger value="chart">Visual Chart</TabsTrigger>
            <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Activity Hours Summary</CardTitle>
                <CardDescription>Pivot view of hours by activity category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity Category</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead className="text-right">Billable Hours</TableHead>
                        <TableHead className="text-right">Non-Billable Hours</TableHead>
                        <TableHead className="text-right">Billable %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pivotData.map((item: any, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right">{item.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right text-green-600">{item.billableHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right text-orange-600">{item.nonBillableHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.totalHours > 0 && (item.billableHours / item.totalHours) > 0.7 ? 'default' : 'secondary'}>
                              {item.totalHours > 0 ? ((item.billableHours / item.totalHours) * 100).toFixed(0) : 0}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Hours Distribution Chart</CardTitle>
                <CardDescription>Visual representation of billable vs non-billable hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="billable" fill="#22c55e" name="Billable Hours" />
                    <Bar dataKey="nonBillable" fill="#f59e0b" name="Non-Billable Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {user.role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hours by Team Member</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pivotData.map((item: any, index) => (
                        <div key={index} className="border rounded p-3">
                          <h4 className="font-medium mb-2">{item.category}</h4>
                          <div className="space-y-1">
                            {Object.entries(item.memberHours).map(([member, hours]: [string, any]) => (
                              <div key={member} className="flex justify-between text-sm">
                                <span>{member}</span>
                                <span>{hours.toFixed(1)}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pivotData.map((item: any, index) => (
                      <div key={index} className="border rounded p-3">
                        <h4 className="font-medium mb-2">{item.category}</h4>
                        <div className="space-y-1">
                          {Object.entries(item.dateHours).map(([date, hours]: [string, any]) => (
                            <div key={date} className="flex justify-between text-sm">
                              <span>{date}</span>
                              <span>{hours.toFixed(1)}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Detailed View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed Reports ({filteredReports.length})
            </CardTitle>
            <CardDescription>Complete daily report submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600">No daily reports match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReports.map((report, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {report.userName}
                            <Badge className={getBadgeColor(report.attendanceStatus)}>
                              {report.attendanceStatus}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {report.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {report.activities.reduce((total, activity) => total + activity.hours, 0).toFixed(1)} hours
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Activities:</h4>
                          <div className="overflow-x-auto">
                            <TableComponent>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Activity</TableHead>
                                  <TableHead>From</TableHead>
                                  <TableHead>To</TableHead>
                                  <TableHead className="text-right">Hours</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {report.activities.map((activity, actIndex) => (
                                  <TableRow key={actIndex}>
                                    <TableCell className="font-medium">{activity.category}</TableCell>
                                    <TableCell>{activity.fromTime}</TableCell>
                                    <TableCell>{activity.toTime}</TableCell>
                                    <TableCell className="text-right">{activity.hours.toFixed(1)}h</TableCell>
                                    <TableCell>
                                      <Badge variant={activity.isBillable ? 'default' : 'secondary'}>
                                        {activity.isBillable ? 'Billable' : 'Non-Billable'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{activity.notes || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </TableComponent>
                          </div>
                        </div>
                        
                        {report.generalNotes && (
                          <div>
                            <h4 className="font-medium mb-2">General Notes:</h4>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded">{report.generalNotes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyReportViewer;
