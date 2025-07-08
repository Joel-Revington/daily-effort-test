
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, User, Award, Users, TrendingUp, Target, BarChart3, Search, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PendingRequest {
  id: string;
  userId: string;
  userName: string;
  software: string;
  category: string;
  level: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  domain: 'MFG' | 'AEC' | 'Common';
  skills: { [key: string]: { [key: string]: string } };
  totalSkills: number;
  completedSkills: number;
}

interface AdminApprovalProps {
  user: any;
}

const AdminApproval = ({ user }: AdminApprovalProps) => {
  const { toast } = useToast();
  
  // Software lists by domain
  const softwareLists = {
    MFG: ['PDMC', 'Inventor', 'Fusion', 'Fusion PCB', 'Fusion CAM', 'Fusion CAE', 'Nastran', 'Factory', 'Inventor CAM', 'Nesting', 'Tolerance Analysis', 'Vault Professional', 'FlexSIM', 'AutoCAD Mechanical'],
    AEC: ['AEC Collection', 'Revit', 'Civil 3D', 'Infraworks', 'Advance Steel', 'Robot Structural', 'Bridge Design', 'Formit', 'Twinmotion', 'Forma', 'Docs', 'BIM Collaborate Pro', 'Vehicle Tracking', 'AutoCAD Map 3D'],
    Common: ['AutoCAD', 'AutoCAD Plant 3D', 'Navisworks', 'Recap', 'AutoCAD Electrical']
  };

  const allSoftware = [...softwareLists.MFG, ...softwareLists.AEC, ...softwareLists.Common];

  // State for software capability search
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock team data - in real app this would come from Supabase
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Developer',
      position: 'Application Engineer',
      domain: 'MFG',
      skills: {
        'Inventor': { 'Demo': 'Advanced', 'Training': 'Basic', 'Implementation': 'Yes', 'Event Presentation': 'Yes' },
        'Fusion': { 'Demo': 'Advanced', 'Training': 'Advanced', 'Implementation': 'Yes', 'Event Presentation': 'No' },
        'AutoCAD': { 'Demo': 'Basic', 'Training': 'Not Started', 'Implementation': 'No', 'Event Presentation': 'No' },
      },
      totalSkills: 100,
      completedSkills: 45
    },
    {
      id: '2',
      name: 'Sarah Trainer',
      position: 'BIM Engineer',
      domain: 'AEC',
      skills: {
        'Revit': { 'Demo': 'Advanced', 'Training': 'Handholding', 'Implementation': 'Yes', 'Event Presentation': 'Yes' },
        'Civil 3D': { 'Demo': 'Advanced', 'Training': 'Advanced', 'Implementation': 'Yes', 'Event Presentation': 'Yes' },
        'AutoCAD': { 'Demo': 'Basic', 'Training': 'Basic', 'Implementation': 'No', 'Event Presentation': 'No' },
      },
      totalSkills: 100,
      completedSkills: 67
    },
    {
      id: '3',
      name: 'Mike Engineer',
      position: 'Application Developer',
      domain: 'MFG',
      skills: {
        'Inventor': { 'Demo': 'Basic', 'Training': 'Not Started', 'Implementation': 'No', 'Event Presentation': 'No' },
        'Fusion': { 'Demo': 'Not Started', 'Training': 'Not Started', 'Implementation': 'No', 'Event Presentation': 'No' },
      },
      totalSkills: 100,
      completedSkills: 12
    },
    {
      id: '4',
      name: 'Lisa Manager',
      position: 'Manager',
      domain: 'AEC',
      skills: {
        'Revit': { 'Demo': 'Advanced', 'Training': 'Basic', 'Implementation': 'Yes', 'Event Presentation': 'No' },
        'AutoCAD': { 'Demo': 'Advanced', 'Training': 'Advanced', 'Implementation': 'Yes', 'Event Presentation': 'Yes' },
      },
      totalSkills: 100,
      completedSkills: 55
    }
  ]);

  // Mock data - in real app this would come from Supabase
  const [requests, setRequests] = useState<PendingRequest[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Developer',
      software: 'Inventor',
      category: 'Demo',
      level: 'Basic',
      requestedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah Trainer',
      software: 'Revit',
      category: 'Training',
      level: 'Advanced',
      requestedAt: '2024-01-15T11:15:00Z',
      status: 'pending'
    },
    {
      id: '3',
      userId: 'user1',
      userName: 'John Developer',
      software: 'Civil 3D',
      category: 'Implementation',
      level: 'Yes',
      requestedAt: '2024-01-15T12:00:00Z',
      status: 'pending'
    }
  ]);

  const handleApproval = (requestId: string, approved: boolean) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: approved ? 'approved' : 'rejected' }
        : req
    ));

    const request = requests.find(req => req.id === requestId);
    if (request) {
      toast({
        title: approved ? '✅ Request Approved!' : '❌ Request Rejected',
        description: `${request.userName}'s ${request.software} skill request has been ${approved ? 'approved' : 'rejected'}.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced':
      case 'POC':
      case 'Handholding':
      case 'Yes':
        return 'bg-green-100 text-green-800';
      case 'Basic':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
      case 'No':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamStats = () => {
    const totalMembers = teamMembers.length;
    const avgCompletion = Math.round(teamMembers.reduce((acc, member) => acc + (member.completedSkills / member.totalSkills * 100), 0) / totalMembers);
    const topPerformer = teamMembers.reduce((top, member) => 
      (member.completedSkills / member.totalSkills) > (top.completedSkills / top.totalSkills) ? member : top
    );
    const mfgCount = teamMembers.filter(m => m.domain === 'MFG').length;
    const aecCount = teamMembers.filter(m => m.domain === 'AEC').length;
    
    return { totalMembers, avgCompletion, topPerformer, mfgCount, aecCount };
  };

  const getSoftwareCapableMembers = (software: string) => {
    return teamMembers.filter(member => {
      const softwareSkills = member.skills[software];
      if (!softwareSkills) return false;
      
      // Check if member has any skill level above 'Not Started'
      return Object.values(softwareSkills).some(level => 
        level !== 'Not Started' && level !== 'No'
      );
    }).map(member => ({
      ...member,
      skills: member.skills[software]
    }));
  };

  const filteredSoftware = allSoftware.filter(software =>
    software.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');
  const stats = getTeamStats();
  const capableMembers = selectedSoftware ? getSoftwareCapableMembers(selectedSoftware) : [];

  return (
    <div className="space-y-6">
      {/* ProTip Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">🎯 Team Leadership Dashboard!</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Your command center for team capability management! Monitor skill progression, approve advancement requests, 
                and discover who's ready to tackle specific software challenges. Smart leadership starts here! 🚀✨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Leadership Dashboard 🎯</h1>
        <p className="text-gray-600 mt-1">Monitor, approve, and optimize your team's capabilities with intelligent insights</p>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Champions</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgCompletion}%</div>
            <p className="text-xs text-muted-foreground">Average skill completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏭 MFG Experts</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.mfgCount}</div>
            <p className="text-xs text-muted-foreground">Manufacturing specialists</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏗️ AEC Masters</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.aecCount}</div>
            <p className="text-xs text-muted-foreground">Construction champions</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Software Capability Finder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            🔍 Software Capability Finder
          </CardTitle>
          <CardDescription>
            Discover who's ready to tackle specific software challenges - your talent scout dashboard!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="🔍 Search for software..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select software to explore" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSoftware.map(software => (
                    <SelectItem key={software} value={software}>
                      {software}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSoftware && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-4 text-indigo-700">
                  🌟 {selectedSoftware} Capability Champions ({capableMembers.length} found!)
                </h4>
                
                {capableMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No capable members found</p>
                    <p className="text-sm">Time to invest in some {selectedSoftware} training! 🚀</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {capableMembers.map(member => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-600" />
                                {member.name}
                              </h5>
                              <p className="text-sm text-gray-600">{member.position}</p>
                              <Badge className={`mt-1 text-xs ${
                                member.domain === 'MFG' ? 'bg-orange-100 text-orange-800' : 
                                member.domain === 'AEC' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {member.domain === 'MFG' ? '🏭 MFG' : member.domain === 'AEC' ? '🏗️ AEC' : '🔧 Common'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {Object.entries(member.skills).map(([category, level]) => (
                              <div key={category} className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-700">{category}</span>
                                <Badge className={`text-xs ${getLevelColor(level)}`}>
                                  {level}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            📊 Team Progress Analytics
          </CardTitle>
          <CardDescription>
            Individual skill development tracking and performance insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Skills Completed</TableHead>
                <TableHead>Top Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      member.domain === 'MFG' ? 'bg-orange-100 text-orange-800' : 
                      member.domain === 'AEC' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {member.domain === 'MFG' ? '🏭 MFG' : member.domain === 'AEC' ? '🏗️ AEC' : '🔧 Common'}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(member.completedSkills / member.totalSkills) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round((member.completedSkills / member.totalSkills) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {member.completedSkills} / {member.totalSkills}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(member.skills).slice(0, 2).map(([software, skills]) => (
                        <Badge key={software} variant="outline" className="text-xs">
                          {software}
                        </Badge>
                      ))}
                      {Object.keys(member.skills).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(member.skills).length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            ⏰ Pending Skill Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>
            Skill advancement requests awaiting your expert approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">🎉 All caught up!</p>
              <p className="text-sm">No pending requests - your team is cruising smoothly!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{request.userName}</span>
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          🔄 {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Software</p>
                          <p className="font-medium">📱 {request.software}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-medium">🎯 {request.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Requested Level</p>
                          <Badge className={getLevelColor(request.level)}>
                            {request.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        📅 Requested on {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApproval(request.id, true)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        ✅ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleApproval(request.id, false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            🏆 Recent Leadership Decisions
          </CardTitle>
          <CardDescription>
            Your recent skill approval decisions and their impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Ready to lead!</p>
              <p className="text-sm">No recent decisions - time to review some skill requests! 🚀</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">
                        🎯 {request.userName} - {request.software} ({request.category})
                      </p>
                      <p className="text-xs text-gray-600">
                        Level: {request.level} • 📅 {formatDate(request.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status === 'approved' ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApproval;
