
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Trash2, Lightbulb, Package, Users } from 'lucide-react';

interface Software {
  id: string;
  name: string;
  category: string;
  domain: 'MFG' | 'AEC' | 'Common';
}

interface CompactSoftwareManagerProps {
  software: Software[];
  setSoftware: (software: Software[]) => void;
}

const CompactSoftwareManager = ({ software, setSoftware }: CompactSoftwareManagerProps) => {
  const { toast } = useToast();
  const [softwareForm, setSoftwareForm] = useState({
    name: '',
    category: '',
    domain: '' as 'MFG' | 'AEC' | 'Common' | ''
  });
  const [isSoftwareDialogOpen, setIsSoftwareDialogOpen] = useState(false);

  const softwareCategories = [
    'Design', 'Civil Engineering', 'Manufacturing', 'Simulation',
    'Documentation', 'Project Management', 'Data Management', 'Electronics',
    'Infrastructure', 'Visualization'
  ];

  const handleAddSoftware = () => {
    if (!softwareForm.name || !softwareForm.category || !softwareForm.domain) {
      toast({
        title: '🎯 Hold On There, Champion!',
        description: 'Fill in all the details to add this awesome software to your toolkit! Every detail matters! 💪',
        variant: 'destructive',
      });
      return;
    }

    const newSoftware: Software = {
      id: Date.now().toString(),
      ...softwareForm as Omit<typeof softwareForm, 'domain'> & { domain: 'MFG' | 'AEC' | 'Common' }
    };

    setSoftware([...software, newSoftware]);
    setSoftwareForm({ name: '', category: '', domain: '' });
    setIsSoftwareDialogOpen(false);

    toast({
      title: '🚀 Software Added Successfully!',
      description: `${newSoftware.name} is now part of your ${newSoftware.domain} arsenal! Time to build some expertise! 🌟`,
    });
  };

  const handleDeleteSoftware = (id: string) => {
    const soft = software.find(s => s.id === id);
    setSoftware(software.filter(s => s.id !== id));
    
    if (soft) {
      toast({
        title: '📦 Software Removed',
        description: `${soft.name} has been removed from your toolkit.`,
      });
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'MFG': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'AEC': return 'bg-green-100 text-green-800 border-green-200';
      case 'Common': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDomainStats = () => {
    const mfgCount = software.filter(s => s.domain === 'MFG').length;
    const aecCount = software.filter(s => s.domain === 'AEC').length;
    const commonCount = software.filter(s => s.domain === 'Common').length;
    return { mfgCount, aecCount, commonCount, total: software.length };
  };

  const stats = getDomainStats();

  return (
    <div className="space-y-6">
      {/* ProTip Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">💡 ProTip: Smart Software Organization!</h3>
              <p className="text-purple-700 text-sm leading-relaxed">
                Organize your software by domains for maximum efficiency! MFG tools for manufacturing wizards, 
                AEC for construction champions, and Common tools that everyone loves. This makes evaluation 
                and skill tracking super smooth! 🎯✨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Software Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Software</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">🏭 MFG Tools</p>
                <p className="text-3xl font-bold text-orange-900">{stats.mfgCount}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">🏗️ AEC Tools</p>
                <p className="text-3xl font-bold text-green-900">{stats.aecCount}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">🔧 Common Tools</p>
                <p className="text-3xl font-bold text-purple-900">{stats.commonCount}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Software Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Software Portfolio Management 🛠️
              </CardTitle>
              <CardDescription>
                Your complete digital toolkit organized by domains - streamlined and efficient!
              </CardDescription>
            </div>
            <Dialog open={isSoftwareDialogOpen} onOpenChange={setIsSoftwareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Software 🚀
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🚀 Add Amazing New Software!</DialogTitle>
                  <DialogDescription>
                    Expanding your toolkit? Fantastic choice! Let's add this powerful software to your domain-specific arsenal!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="softwareName">Software Name *</Label>
                    <Input
                      id="softwareName"
                      value={softwareForm.name}
                      onChange={(e) => setSoftwareForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="What's this awesome software called?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={softwareForm.category} 
                      onValueChange={(value) => setSoftwareForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick the perfect category" />
                      </SelectTrigger>
                      <SelectContent>
                        {softwareCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain *</Label>
                    <Select 
                      value={softwareForm.domain} 
                      onValueChange={(value: 'MFG' | 'AEC' | 'Common') => setSoftwareForm(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the right domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MFG">🏭 MFG (Manufacturing Mastery)</SelectItem>
                        <SelectItem value="AEC">🏗️ AEC (Architecture, Engineering & Construction)</SelectItem>
                        <SelectItem value="Common">🔧 Common (Universal Power Tools)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsSoftwareDialogOpen(false)}>
                      Maybe Later
                    </Button>
                    <Button onClick={handleAddSoftware} className="bg-green-600 hover:bg-green-700">
                      Add to Arsenal! ⚡
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Software ({stats.total})</TabsTrigger>
              <TabsTrigger value="MFG">🏭 MFG ({stats.mfgCount})</TabsTrigger>
              <TabsTrigger value="AEC">🏗️ AEC ({stats.aecCount})</TabsTrigger>
              <TabsTrigger value="Common">🔧 Common ({stats.commonCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {software.map((soft) => (
                  <Card key={soft.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{soft.name}</h4>
                          <Badge className={`mt-1 text-xs ${getDomainColor(soft.domain)}`}>
                            {soft.domain === 'MFG' ? '🏭 MFG' : soft.domain === 'AEC' ? '🏗️ AEC' : '🔧 Common'}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{soft.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSoftware(soft.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {['MFG', 'AEC', 'Common'].map((domain) => (
              <TabsContent key={domain} value={domain} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {software.filter(s => s.domain === domain).map((soft) => (
                    <Card key={soft.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{soft.name}</h4>
                            <Badge className={`mt-1 text-xs ${getDomainColor(soft.domain)}`}>
                              {soft.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSoftware(soft.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactSoftwareManager;
