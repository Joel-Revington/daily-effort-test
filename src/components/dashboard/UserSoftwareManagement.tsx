import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Trash2, Eye, EyeOff, Users, Target, Shield, Crown, User, Edit2 } from 'lucide-react';
import CompactSoftwareManager from './CompactSoftwareManager';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  designation: string;
  domain: 'MFG' | 'AEC';
  role: 'super-admin' | 'admin' | 'user';
  password: string;
  reporting_to?: string;
  reporting_to_name?: string;
}

interface Software {
  id: string;
  name: string;
  category: string;
  domain: 'MFG' | 'AEC' | 'Common';
}

const UserSoftwareManagement = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<User[]>([]);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Developer',
      username: 'john.developer',
      email: 'john@company.com',
      phone: '+1-234-567-8901',
      designation: 'Application Engineer',
      domain: 'AEC',
      role: 'admin',
      password: 'password123',
      reporting_to: undefined
    },
    {
      id: '2',
      name: 'Sarah Trainer',
      username: 'sarah.trainer',
      email: 'sarah@company.com',
      phone: '+1-234-567-8902',
      designation: 'Trainer',
      domain: 'MFG',
      role: 'user',
      password: 'trainer456',
      reporting_to: '1'
    },
    {
      id: '3',
      name: 'Mike Engineer',
      username: 'mike.engineer',
      email: 'mike@company.com',
      phone: '+1-234-567-8903',
      designation: 'BIM Engineer',
      domain: 'AEC',
      role: 'user',
      password: 'engineer789',
      reporting_to: '1'
    }
  ]);

  const [software, setSoftware] = useState<Software[]>([
    // MFG Software
    { id: '1', name: 'PDMC', category: 'Manufacturing', domain: 'MFG' },
    { id: '2', name: 'Inventor', category: 'Manufacturing', domain: 'MFG' },
    { id: '3', name: 'Fusion', category: 'Design & Manufacturing', domain: 'MFG' },
    { id: '4', name: 'Fusion PCB', category: 'Electronics', domain: 'MFG' },
    { id: '5', name: 'Fusion CAM', category: 'Manufacturing', domain: 'MFG' },
    { id: '6', name: 'Fusion CAE', category: 'Simulation', domain: 'MFG' },
    { id: '7', name: 'Nastran', category: 'Simulation', domain: 'MFG' },
    { id: '8', name: 'Factory', category: 'Manufacturing', domain: 'MFG' },
    { id: '9', name: 'Inventor CAM', category: 'Manufacturing', domain: 'MFG' },
    { id: '10', name: 'Nesting', category: 'Manufacturing', domain: 'MFG' },
    { id: '11', name: 'Tolerance Analysis', category: 'Manufacturing', domain: 'MFG' },
    { id: '12', name: 'Vault Professional', category: 'Data Management', domain: 'MFG' },
    { id: '13', name: 'FlexSIM', category: 'Simulation', domain: 'MFG' },
    { id: '14', name: 'AutoCAD Mechanical', category: 'Design', domain: 'MFG' },
    
    // AEC Software
    { id: '15', name: 'AEC Collection', category: 'Design Suite', domain: 'AEC' },
    { id: '16', name: 'Revit', category: 'Design', domain: 'AEC' },
    { id: '17', name: 'Civil 3D', category: 'Civil Engineering', domain: 'AEC' },
    { id: '18', name: 'Infraworks', category: 'Infrastructure', domain: 'AEC' },
    { id: '19', name: 'Advance Steel', category: 'Structural Design', domain: 'AEC' },
    { id: '20', name: 'Robot Structural', category: 'Structural Analysis', domain: 'AEC' },
    { id: '21', name: 'Bridge Design', category: 'Infrastructure', domain: 'AEC' },
    { id: '22', name: 'Formit', category: 'Conceptual Design', domain: 'AEC' },
    { id: '23', name: 'Twinmotion', category: 'Visualization', domain: 'AEC' },
    { id: '24', name: 'Forma', category: 'Planning', domain: 'AEC' },
    { id: '25', name: 'Docs', category: 'Documentation', domain: 'AEC' },
    { id: '26', name: 'BIM Collaborate Pro', category: 'Collaboration', domain: 'AEC' },
    { id: '27', name: 'Vehicle Tracking', category: 'Transportation', domain: 'AEC' },
    { id: '28', name: 'AutoCAD Map 3D', category: 'Mapping', domain: 'AEC' },
    
    // Common Software
    { id: '29', name: 'AutoCAD', category: 'Design', domain: 'Common' },
    { id: '30', name: 'AutoCAD Plant 3D', category: 'Plant Design', domain: 'Common' },
    { id: '31', name: 'Navisworks', category: 'Project Review', domain: 'Common' },
    { id: '32', name: 'Recap', category: 'Reality Capture', domain: 'Common' },
    { id: '33', name: 'AutoCAD Electrical', category: 'Electrical Design', domain: 'Common' }
  ]);

  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    designation: '',
    domain: '' as 'MFG' | 'AEC' | '',
    role: '' as 'super-admin' | 'admin' | 'user' | '',
    password: '',
    reporting_to: ''
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch admins for the reporting dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('role', ['admin', 'super_admin']);
        
        if (error) throw error;
        
        const adminUsers = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unknown',
          username: '',
          email: '',
          phone: '',
          designation: '',
          domain: 'MFG' as const,
          role: profile.role as 'super-admin' | 'admin' | 'user',
          password: ''
        }));
        
        setAdmins(adminUsers);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    fetchAdmins();
  }, []);

  const designationOptions = [
    'Application Engineer',
    'BIM Engineer', 
    'Trainer',
    'Assistant Manager',
    'Manager',
    'Senior Manager',
    'Application Developer',
    'Web Developer'
  ];

  const handleAddUser = () => {
    if (!userForm.name || !userForm.username || !userForm.email || !userForm.designation || !userForm.domain || !userForm.role || !userForm.password) {
      toast({
        title: '🎯 Hold Up, Champion!',
        description: 'Fill in all the details including role to get your amazing teammate onboard! Every field is important for building a strong team! 💪',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(user => user.username === userForm.username)) {
      toast({
        title: '🤔 Username Clash Alert!',
        description: 'This username is already taken by another team member! How about trying something unique? Maybe add some numbers or initials! ✨',
        variant: 'destructive',
      });
      return;
    }

    const reportingToName = userForm.reporting_to ? 
      admins.find(admin => admin.id === userForm.reporting_to)?.name : undefined;

    const newUser: User = {
      id: Date.now().toString(),
      ...userForm as Omit<typeof userForm, 'domain' | 'role'> & { domain: 'MFG' | 'AEC'; role: 'super-admin' | 'admin' | 'user' },
      reporting_to_name: reportingToName
    };

    setUsers(prev => [...prev, newUser]);
    setUserForm({ name: '', username: '', email: '', phone: '', designation: '', domain: '', role: '', password: '', reporting_to: '' });
    setIsUserDialogOpen(false);

    toast({
      title: '🎉 Welcome to the Dream Team!',
      description: `${newUser.name} has joined as a ${newUser.domain} domain ${newUser.role}! Time to create some engineering magic together! 🚀`,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const reportingToName = editingUser.reporting_to ? 
      admins.find(admin => admin.id === editingUser.reporting_to)?.name : undefined;

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { ...editingUser, reporting_to_name: reportingToName }
        : user
    ));
    
    setIsEditDialogOpen(false);
    setEditingUser(null);

    toast({
      title: '✅ User Updated!',
      description: `${editingUser.name}'s information has been successfully updated!`,
    });
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    
    if (user) {
      toast({
        title: '👋 Team Member Removed',
        description: `${user.name} has been removed from the system. We'll miss their contributions!`,
      });
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'MFG':
        return 'bg-orange-100 text-orange-800';
      case 'AEC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'user':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getUserStats = () => {
    const mfgCount = users.filter(u => u.domain === 'MFG').length;
    const aecCount = users.filter(u => u.domain === 'AEC').length;
    const superAdminCount = users.filter(u => u.role === 'super-admin').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;
    return { mfgCount, aecCount, superAdminCount, adminCount, userCount, total: users.length };
  };

  const userStats = getUserStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Team & Software Command Center 🎯</h2>
        <p className="text-gray-600 mt-2 text-lg">Build your dream team and manage your software arsenal like the engineering champions you are!</p>
      </div>

      {/* Super ProTip Card */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 text-xl mb-3">🎯 Super ProTip: Role-Based Excellence!</h3>
              <p className="text-indigo-700 leading-relaxed">
                Assign roles wisely: Super Admins 👑 have full control, Admins 🛡️ manage teams and projects, Users 👤 focus on their tasks. 
                Combine with domain expertise (MFG 🏭 or AEC 🏗️) for the perfect organizational structure! ⚡🌟
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-900">{userStats.total}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">👑 Super Admins</p>
                <p className="text-2xl font-bold text-purple-900">{userStats.superAdminCount}</p>
              </div>
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">🛡️ Admins</p>
                <p className="text-2xl font-bold text-blue-900">{userStats.adminCount}</p>
              </div>
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">🏭 MFG</p>
                <p className="text-2xl font-bold text-orange-900">{userStats.mfgCount}</p>
              </div>
              <UserPlus className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">🏗️ AEC</p>
                <p className="text-2xl font-bold text-green-900">{userStats.aecCount}</p>
              </div>
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                Engineering Dream Team ({users.length}) 🌟
              </CardTitle>
              <CardDescription>
                Manage your incredible team members, their specializations, domain expertise, and access roles!
              </CardDescription>
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Team Hero! 🚀
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🎉 Welcome A New Team Hero!</DialogTitle>
                  <DialogDescription>
                    Let's get someone amazing added to our engineering dream team! Fill in their details, select their domain expertise, and assign their role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter their awesome name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Create a unique username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="their.email@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userForm.phone}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Select 
                      value={userForm.designation} 
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, designation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose their role" />
                      </SelectTrigger>
                      <SelectContent>
                        {designationOptions.map(designation => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain Expertise *</Label>
                    <Select 
                      value={userForm.domain} 
                      onValueChange={(value: 'MFG' | 'AEC') => setUserForm(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select their domain expertise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MFG">🏭 MFG (Manufacturing Master)</SelectItem>
                        <SelectItem value="AEC">🏗️ AEC (Architecture, Engineering & Construction Champion)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Access Role *</Label>
                    <Select 
                      value={userForm.role} 
                      onValueChange={(value: 'super-admin' | 'admin' | 'user') => setUserForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-admin">👑 Super Admin (Full System Control)</SelectItem>
                        <SelectItem value="admin">🛡️ Admin (Team & Project Management)</SelectItem>
                        <SelectItem value="user">👤 User (Standard Access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reporting_to">Reports To</Label>
                    <Select 
                      value={userForm.reporting_to} 
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, reporting_to: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No direct manager</SelectItem>
                        {admins.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.name} ({admin.role === 'super-admin' ? 'Super Admin' : 'Admin'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={userForm.password}
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a secure password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Maybe Later
                    </Button>
                    <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
                      Welcome Aboard! 🎊
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reports To</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800">
                      {user.designation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDomainColor(user.domain)}>
                      {user.domain === 'MFG' ? '🏭 MFG' : '🏗️ AEC'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role === 'super-admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.reporting_to_name ? (
                      <Badge variant="outline" className="bg-green-50 text-green-800">
                        {user.reporting_to_name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No manager</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">••••••••</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the information for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter their awesome name"
                />
              </div>
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                  placeholder="Create a unique username"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="their.email@company.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Contact number"
                />
              </div>
              <div>
                <Label htmlFor="edit-designation">Designation *</Label>
                <Select 
                  value={editingUser.designation} 
                  onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, designation: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose their role" />
                  </SelectTrigger>
                  <SelectContent>
                    {designationOptions.map(designation => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-domain">Domain Expertise *</Label>
                <Select 
                  value={editingUser.domain} 
                  onValueChange={(value: 'MFG' | 'AEC') => setEditingUser(prev => prev ? { ...prev, domain: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select their domain expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MFG">🏭 MFG (Manufacturing Master)</SelectItem>
                    <SelectItem value="AEC">🏗️ AEC (Architecture, Engineering & Construction Champion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-role">Access Role *</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: 'super-admin' | 'admin' | 'user') => setEditingUser(prev => prev ? { ...prev, role: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">👑 Super Admin (Full System Control)</SelectItem>
                    <SelectItem value="admin">🛡️ Admin (Team & Project Management)</SelectItem>
                    <SelectItem value="user">👤 User (Standard Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-reporting-to">Reports To</Label>
                <Select 
                  value={editingUser.reporting_to || ''} 
                  onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, reporting_to: value || undefined } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No direct manager</SelectItem>
                    {admins.map(admin => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name} ({admin.role === 'super-admin' ? 'Super Admin' : 'Admin'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compact Software Management */}
      <CompactSoftwareManager software={software} setSoftware={setSoftware} />
    </div>
  );
};

export default UserSoftwareManagement;
