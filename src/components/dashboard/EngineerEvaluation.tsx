
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, TrendingUp, Award, Calendar, CheckCircle, Send, BookOpen, Target, Lightbulb, ChevronDown } from 'lucide-react';

interface EngineerEvaluationProps {
  user: any;
}

interface PendingRequest {
  id: string;
  software: string;
  category: string;
  level: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const EngineerEvaluation = ({ user }: EngineerEvaluationProps) => {
  const { toast } = useToast();
  
  const taskCategories = {
    'Demo': ['Not Started', 'Basic', 'Advanced', 'POC'],
    'Training': ['Not Started', 'Basic', 'Advanced', 'Handholding'],
    'Implementation': ['No', 'Yes'],
    'Event Presentation': ['No', 'Yes']
  };
  
  // Domain-based software organization
  const softwareDomains = {
    MFG: [
      'PDMC', 'Inventor', 'Fusion', 'Fusion PCB', 'Fusion CAM', 'Fusion CAE', 
      'Nastran', 'Factory', 'Inventor CAM', 'Nesting', 'Tolerance Analysis', 
      'Vault Professional', 'FlexSIM', 'AutoCAD Mechanical'
    ],
    AEC: [
      'AEC Collection', 'Revit', 'Civil 3D', 'Infraworks', 'Advance Steel', 
      'Robot Structural', 'Bridge Design', 'Formit', 'Twinmotion', 'Forma', 
      'Docs', 'BIM Collaborate Pro', 'Vehicle Tracking', 'AutoCAD Map 3D'
    ],
    Common: [
      'AutoCAD', 'AutoCAD Plant 3D', 'Navisworks', 'Recap', 'AutoCAD Electrical'
    ]
  };

  // Get prioritized software list based on user domain
  const getPrioritizedSoftware = (userDomain: 'MFG' | 'AEC' = 'AEC') => {
    const primaryDomain = softwareDomains[userDomain];
    const commonSoftware = softwareDomains.Common;
    const secondaryDomain = userDomain === 'MFG' ? softwareDomains.AEC : softwareDomains.MFG;
    
    return [...primaryDomain, ...commonSoftware, ...secondaryDomain];
  };

  // Mock user domain - in real app this would come from user data
  const userDomain: 'MFG' | 'AEC' = user?.domain || 'AEC';
  const prioritizedSoftwareList = getPrioritizedSoftware(userDomain);

  const [selectedSoftware, setSelectedSoftware] = useState<string>('');
  const [evaluationData, setEvaluationData] = useState(() => {
    const initialData: { [key: string]: string } = {};
    const progressData: { [key: string]: string } = {};
    
    prioritizedSoftwareList.forEach(software => {
      Object.entries(taskCategories).forEach(([category, levels]) => {
        const key = `${software}-${category}`;
        initialData[key] = levels.includes('No') ? 'No' : 'Not Started';
        progressData[`${key}-date`] = '';
      });
    });
    
    return { ...initialData, ...progressData };
  });

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  const handleDropdownChange = (software: string, category: string, value: string) => {
    const key = `${software}-${category}`;
    setEvaluationData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRequestApproval = (software: string, category: string) => {
    const key = `${software}-${category}`;
    const currentLevel = evaluationData[key];
    
    if (!currentLevel || currentLevel === 'Not Started' || currentLevel === 'No') {
      toast({
        title: 'Hold On! 🤔',
        description: 'Please select a skill level before requesting approval. We want to make sure you get credit for your awesome skills!',
        variant: 'destructive',
      });
      return;
    }

    const existingRequest = pendingRequests.find(
      req => req.software === software && req.category === category && req.status === 'pending'
    );

    if (existingRequest) {
      toast({
        title: 'Already in the Queue! ⏳',
        description: 'You already have a pending request for this skill level. Good things take time - hang tight!',
        variant: 'destructive',
      });
      return;
    }

    const request: PendingRequest = {
      id: `${Date.now()}-${software}-${category}`,
      software,
      category,
      level: currentLevel,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    setPendingRequests(prev => [...prev, request]);
    
    toast({
      title: '🚀 Request Submitted!',
      description: `Your ${software} - ${category} (${currentLevel}) request is on its way to admin. You're building some serious expertise!`,
    });
  };

  const calculateSoftwareProgress = (software: string) => {
    const totalTasks = Object.keys(taskCategories).length;
    let completedTasks = 0;
    
    Object.keys(taskCategories).forEach(category => {
      const key = `${software}-${category}`;
      const value = evaluationData[key];
      if (value && value !== 'Not Started' && value !== 'No') {
        completedTasks++;
      }
    });
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getOverallProgress = () => {
    const totalPossible = prioritizedSoftwareList.length * Object.keys(taskCategories).length;
    let totalCompleted = 0;
    
    prioritizedSoftwareList.forEach(software => {
      Object.keys(taskCategories).forEach(category => {
        const key = `${software}-${category}`;
        const value = evaluationData[key];
        if (value && value !== 'Not Started' && value !== 'No') {
          totalCompleted++;
        }
      });
    });
    
    return Math.round((totalCompleted / totalPossible) * 100);
  };

  const getLearningProgress = () => {
    const totalPossible = prioritizedSoftwareList.length * Object.keys(taskCategories).length;
    let completed = 0;
    let notStarted = 0;
    
    prioritizedSoftwareList.forEach(software => {
      Object.keys(taskCategories).forEach(category => {
        const key = `${software}-${category}`;
        const value = evaluationData[key];
        if (value === 'Not Started' || value === 'No') {
          notStarted++;
        } else if (value) {
          completed++;
        }
      });
    });
    
    return { completed, notStarted, total: totalPossible };
  };

  const checkForAchievements = () => {
    const newAchievements: string[] = [];
    
    // Domain-specific achievements
    if (userDomain === 'AEC') {
      const aecSoftware = ['Revit', 'Civil 3D', 'Infraworks', 'AEC Collection'];
      const aecDemoComplete = aecSoftware.every(software => {
        const key = `${software}-Demo`;
        const value = evaluationData[key];
        return value && value !== 'Not Started';
      });
      if (aecDemoComplete && !achievements.includes('AEC Demo Master')) {
        newAchievements.push('AEC Demo Master');
      }
    }

    if (userDomain === 'MFG') {
      const manufacturingSoftware = ['Inventor', 'Fusion', 'Fusion CAM', 'Factory'];
      const manufacturingComplete = manufacturingSoftware.every(software => {
        const demoKey = `${software}-Demo`;
        const trainingKey = `${software}-Training`;
        const demoValue = evaluationData[demoKey];
        const trainingValue = evaluationData[trainingKey];
        return (demoValue && demoValue !== 'Not Started') && (trainingValue && trainingValue !== 'Not Started');
      });
      if (manufacturingComplete && !achievements.includes('Manufacturing Expert')) {
        newAchievements.push('Manufacturing Expert');
      }
    }

    // Common software achievements
    const commonSoftware = softwareDomains.Common;
    const commonComplete = commonSoftware.every(software => {
      return Object.keys(taskCategories).every(category => {
        const key = `${software}-${category}`;
        const value = evaluationData[key];
        return value && value !== 'Not Started' && value !== 'No';
      });
    });
    if (commonComplete && !achievements.includes('Common Tools Master')) {
      newAchievements.push('Common Tools Master');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(achievement => {
        toast({
          title: '🏆 Achievement Unlocked!',
          description: `Congratulations! You've earned the "${achievement}" badge! You're absolutely crushing it!`,
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkForAchievements();
    console.log('Engineer evaluation submitted:', evaluationData);
    toast({
      title: '🎉 Evaluation Saved Successfully!',
      description: 'Your capability evaluation has been saved! Keep building those skills and reaching for the stars!',
    });
  };

  const shouldShowRequestButton = (software: string, category: string) => {
    const key = `${software}-${category}`;
    const currentLevel = evaluationData[key];
    const hasPendingRequest = pendingRequests.some(
      req => req.software === software && req.category === category && req.status === 'pending'
    );
    
    return currentLevel && currentLevel !== 'Not Started' && currentLevel !== 'No' && !hasPendingRequest;
  };

  const getSoftwareDomainInfo = (software: string) => {
    if (softwareDomains.MFG.includes(software)) return { domain: 'MFG', icon: '🏭', color: 'text-orange-600' };
    if (softwareDomains.AEC.includes(software)) return { domain: 'AEC', icon: '🏗️', color: 'text-green-600' };
    return { domain: 'Common', icon: '🔧', color: 'text-blue-600' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Engineer Evaluation Form 📊</h1>
        <p className="text-gray-600 mt-1">Track your journey to becoming a software superstar in the {userDomain} domain! 🌟</p>
      </div>

      {/* Domain-specific ProTip Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">💡 ProTip: Domain-Focused Learning Path</h3>
              <p className="text-purple-700 text-sm">
                Your software list is prioritized for your {userDomain} domain expertise! Start with your domain-specific tools, 
                then master the common software, and explore cross-domain tools to become a well-rounded expert. 
                Each domain has unique workflows - embrace the journey! 🚀
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Your Domain Achievements 🏆
            </CardTitle>
            <CardDescription>Look at you go! These badges show your amazing progress in {userDomain} and beyond!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-300">
                  🏆 {achievement}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.filter(req => req.status === 'pending').length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-600" />
              Pending Approval Requests ⏳
            </CardTitle>
            <CardDescription>Your requests are being reviewed - great things are coming!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.filter(req => req.status === 'pending').map((request) => (
                <div key={request.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {getSoftwareDomainInfo(request.software).icon} {request.software} - {request.category}
                    </p>
                    <p className="text-sm text-gray-600">Level: {request.level}</p>
                  </div>
                  <div className="text-orange-600 text-sm font-medium">⏳ Admin Review in Progress</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Skills Mastered ✅
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{getLearningProgress().completed}</div>
            <p className="text-sm text-green-600">You're absolutely crushing it in {userDomain}!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <BookOpen className="h-5 w-5" />
              Ready to Explore 📚
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{getLearningProgress().notStarted}</div>
            <p className="text-sm text-blue-600">So many exciting possibilities!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Target className="h-5 w-5" />
              Total Universe 🌌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">{getLearningProgress().total}</div>
            <p className="text-sm text-purple-600">Your {userDomain} skill adventure awaits!</p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Software Selection Dropdown */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              Choose Your Software Adventure 🎯
            </CardTitle>
            <CardDescription>
              Select a software from the prioritized list below. Your {userDomain} domain software appears first, followed by common tools, then cross-domain options!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Software to Evaluate 🛠️
                </label>
                <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick a software to get started..." />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {/* Primary Domain Software */}
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                      🎯 Your {userDomain} Domain (Priority 1)
                    </div>
                    {softwareDomains[userDomain].map((software) => {
                      const domainInfo = getSoftwareDomainInfo(software);
                      return (
                        <SelectItem key={software} value={software}>
                          <span className="flex items-center gap-2">
                            <span className={domainInfo.color}>{domainInfo.icon}</span>
                            {software}
                          </span>
                        </SelectItem>
                      );
                    })}
                    
                    {/* Common Software */}
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 mt-2">
                      🔧 Common Tools (Priority 2)
                    </div>
                    {softwareDomains.Common.map((software) => {
                      const domainInfo = getSoftwareDomainInfo(software);
                      return (
                        <SelectItem key={software} value={software}>
                          <span className="flex items-center gap-2">
                            <span className={domainInfo.color}>{domainInfo.icon}</span>
                            {software}
                          </span>
                        </SelectItem>
                      );
                    })}
                    
                    {/* Cross-Domain Software */}
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 mt-2">
                      🌐 Cross-Domain Skills (Priority 3)
                    </div>
                    {softwareDomains[userDomain === 'MFG' ? 'AEC' : 'MFG'].map((software) => {
                      const domainInfo = getSoftwareDomainInfo(software);
                      return (
                        <SelectItem key={software} value={software}>
                          <span className="flex items-center gap-2">
                            <span className={domainInfo.color}>{domainInfo.icon}</span>
                            {software}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {!selectedSoftware && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a software above to start your evaluation journey! 🚀</p>
                  <p className="text-sm mt-2">Your {userDomain} domain software appears at the top for easy access!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Software Evaluation */}
        {selectedSoftware && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={getSoftwareDomainInfo(selectedSoftware).color}>
                    {getSoftwareDomainInfo(selectedSoftware).icon}
                  </span>
                  {selectedSoftware} Skills Evaluation
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getSoftwareDomainInfo(selectedSoftware).domain === userDomain 
                      ? 'bg-green-100 text-green-700' 
                      : getSoftwareDomainInfo(selectedSoftware).domain === 'Common'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {getSoftwareDomainInfo(selectedSoftware).domain}
                  </span>
                </span>
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  {calculateSoftwareProgress(selectedSoftware)}% Complete
                </span>
              </CardTitle>
              <CardDescription>
                Rate your current skill level and request approval for recognition! 🌟
                {getSoftwareDomainInfo(selectedSoftware).domain === userDomain && 
                  <span className="text-green-600 font-medium"> (Your Domain Priority!)</span>
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(taskCategories).map(([category, levels]) => {
                  const key = `${selectedSoftware}-${category}`;
                  const currentLevel = evaluationData[key];
                  
                  return (
                    <div key={category} className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        {category} 📋
                      </label>
                      
                      <Select
                        value={currentLevel}
                        onValueChange={(value) => handleDropdownChange(selectedSoftware, category, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {shouldShowRequestButton(selectedSoftware, category) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleRequestApproval(selectedSoftware, category)}
                        >
                          <Send className="h-3 w-3 mr-2" />
                          Request Approval ✨
                        </Button>
                      )}

                      {pendingRequests.some(req => req.software === selectedSoftware && req.category === category && req.status === 'pending') && (
                        <div className="text-xs text-orange-600 font-medium bg-orange-50 p-2 rounded border border-orange-200">
                          ⏳ Approval in progress - you're doing great!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save My Awesome {userDomain} Progress! 🎉
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EngineerEvaluation;
