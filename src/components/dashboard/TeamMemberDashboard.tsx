import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Plus,
  GraduationCap,
  DollarSign,
  HelpCircle,
  Target,
  Star,
  AlertTriangle,
  Award
} from 'lucide-react';

interface TeamMemberDashboardProps {
  user: any;
}

const TeamMemberDashboard = ({ user }: TeamMemberDashboardProps) => {
  // Mock performance data - in real app this would come from Supabase
  const performanceStats = {
    billableHours: 6.5,
    billableTarget: 7.5,
    nonBillableHours: 1.5,
    toolsLearned: 12,
    toolsTarget: 20,
    queriesResolved: 8,
    queriesTarget: 15,
    demosCompleted: 3,
    demosTarget: 5,
    conversionRate: 67,
    efficiency: 82,
    // KPI metrics for Application Engineers
    customerSatisfaction: 4.3,
    timelyDelivery: 4.7,
    leadGeneration: 8,
    technicalEscalations: 1
  };

  const skillProgress = [
    { skill: 'AutoCAD', completed: 5, total: 7, level: 'Intermediate' },
    { skill: 'Revit', completed: 8, total: 14, level: 'Basic' },
    { skill: 'Civil 3D', completed: 3, total: 14, level: 'Learning' },
    { skill: 'Navisworks', completed: 4, total: 6, level: 'Basic' },
  ];

  const monthlyGoals = [
    { goal: 'Complete 30 billable hours/week', progress: 87, status: 'on-track' },
    { goal: 'Learn 5 new software modules', progress: 60, status: 'behind' },
    { goal: 'Resolve 60+ engineering queries', progress: 53, status: 'behind' },
    { goal: 'Convert 3+ demos to sales', progress: 100, status: 'achieved' },
  ];

  const recentAchievements = [
    { title: 'Demo Master', description: 'Closed 3 demos this month', icon: Target, color: 'text-green-600' },
    { title: 'Query Expert', description: 'Resolved 50+ queries', icon: HelpCircle, color: 'text-blue-600' },
    { title: 'Skill Builder', description: 'Mastered Civil 3D basics', icon: GraduationCap, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Track your growth and achieve your performance goals</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Performance KPIs - Updated for Application Engineers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{performanceStats.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">Average rating this month</p>
            <Progress value={(performanceStats.customerSatisfaction / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timely Delivery</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{performanceStats.timelyDelivery}/5</div>
            <p className="text-xs text-muted-foreground">Schedule adherence</p>
            <Progress value={(performanceStats.timelyDelivery / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Generation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{performanceStats.leadGeneration}</div>
            <p className="text-xs text-muted-foreground">Leads generated this month</p>
            <Progress value={(performanceStats.leadGeneration / 15) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceStats.technicalEscalations === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performanceStats.technicalEscalations}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceStats.technicalEscalations === 0 ? 'Zero escalations!' : 'Cases this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Development Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Skill Development
          </CardTitle>
          <CardDescription>Your software mastery progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{skill.skill}</span>
                  <Badge variant={skill.level === 'Intermediate' ? 'default' : skill.level === 'Basic' ? 'secondary' : 'outline'}>
                    {skill.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(skill.completed / skill.total) * 100} className="flex-1" />
                  <span className="text-xs text-gray-500">{skill.completed}/{skill.total}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Monthly Goals
          </CardTitle>
          <CardDescription>Track your performance targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{goal.goal}</p>
                  <Badge variant={
                    goal.status === 'achieved' ? 'default' : 
                    goal.status === 'on-track' ? 'secondary' : 'destructive'
                  }>
                    {goal.progress}%
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Recent Achievements
          </CardTitle>
          <CardDescription>Your latest accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                  <Icon className={`h-8 w-8 ${achievement.color}`} />
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{performanceStats.efficiency}%</div>
              <p className="text-sm text-gray-600">Overall Efficiency</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+15%</div>
              <p className="text-sm text-gray-600">Billable Hours Growth</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Rank #3</div>
              <p className="text-sm text-gray-600">Team Performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberDashboard;
