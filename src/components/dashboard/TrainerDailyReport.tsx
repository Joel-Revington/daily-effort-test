import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Clock, Calendar, Plus, Trash2, Send } from 'lucide-react';
import { reportStore } from '@/utils/reportStore';
import { addDemoToSalesTracking } from '@/utils/salesIntegration';

interface TrainerDailyReportProps {
  user: any;
}

interface ActivityEntry {
  id: string;
  category: string;
  fromTime: string;
  toTime: string;
  hours: number;
  notes: string;
  isBillable: boolean;
}

const TrainerDailyReport = ({ user }: TrainerDailyReportProps) => {
  const { toast } = useToast();
  
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    attendanceStatus: '',
    generalNotes: ''
  });

  const [currentEntry, setCurrentEntry] = useState({
    category: '',
    fromTime: '',
    toTime: '',
    notes: ''
  });

  const [savedEntries, setSavedEntries] = useState<ActivityEntry[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const attendanceOptions = ['Present', 'Half Day', 'Leave', 'Work From Home', 'Client Site'];

  const activityOptions = [
    { value: 'demo', label: 'Demo', billable: true },
    { value: 'training', label: 'Training', billable: true },
    { value: 'lessonPlanPreparation', label: 'Lesson Plan Preparation', billable: true },
    { value: 'corporateConsultingTraining', label: 'Corporate Consulting/Training', billable: true },
    { value: 'project', label: 'Project', billable: true },
    { value: 'consultingContentPrep', label: 'Consulting Content Prep', billable: true },
    { value: 'techSupport', label: 'Tech Support', billable: true },
    { value: 'meeting', label: 'Meeting', billable: false },
    { value: 'devLearning', label: 'Dev/Learning', billable: true },
    { value: 'misc', label: 'Miscellaneous', billable: false }
  ];

  // Get user's designation for display
  const getUserDesignation = () => {
    return user.designation || user.role || 'Team Member';
  };

  const getReportTitle = () => {
    const designation = getUserDesignation();
    return `${designation} Daily Report`;
  };

  const getReportDescription = () => {
    const designation = getUserDesignation();
    return `Track your daily activities as ${designation.toLowerCase()}`;
  };

  // Load saved entries for the current date
  useEffect(() => {
    loadSavedEntries();
  }, [reportData.date]);

  const loadSavedEntries = () => {
    console.log('Loading saved entries for date:', reportData.date, 'user:', user.id);
    const existingReports = reportStore.getReports(user.id, user.role);
    console.log('All reports for user:', existingReports);
    
    const todayReport = existingReports.find(report => 
      report.date === reportData.date && report.userId === user.id
    );
    
    console.log('Today report found:', todayReport);
    
    if (todayReport) {
      const entries: ActivityEntry[] = todayReport.activities.map((activity, index) => ({
        id: `${index}`,
        category: activity.category,
        fromTime: activity.fromTime,
        toTime: activity.toTime,
        hours: activity.hours,
        notes: activity.notes,
        isBillable: activity.isBillable || false
      }));
      setSavedEntries(entries);
      setReportData(prev => ({
        ...prev,
        attendanceStatus: todayReport.attendanceStatus,
        generalNotes: todayReport.generalNotes
      }));
      setIsSubmitted(!!todayReport.submittedAt);
      setIsDraft(!todayReport.submittedAt && entries.length > 0);
    } else {
      setSavedEntries([]);
      setIsSubmitted(false);
      setIsDraft(false);
      setReportData(prev => ({
        ...prev,
        attendanceStatus: '',
        generalNotes: ''
      }));
    }
  };

  const calculateHours = (fromTime: string, toTime: string): number => {
    if (!fromTime || !toTime) return 0;
    
    const from = new Date(`2024-01-01 ${fromTime}`);
    const to = new Date(`2024-01-01 ${toTime}`);
    
    if (to <= from) return 0;
    
    const diffMs = to.getTime() - from.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 4) / 4; // Round to nearest 0.25
  };

  const getCurrentEntryHours = () => {
    return calculateHours(currentEntry.fromTime, currentEntry.toTime);
  };

  const getTotalHours = () => {
    return savedEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getRemainingHours = () => {
    const totalHours = getTotalHours();
    return Math.max(0, 8 - totalHours);
  };

  const canAddEntry = () => {
    const hours = getCurrentEntryHours();
    const totalAfterAdding = getTotalHours() + hours;
    return currentEntry.category && currentEntry.fromTime && currentEntry.toTime && hours > 0 && totalAfterAdding <= 8;
  };

  const handleInputChange = (field: string, value: string) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrentEntryChange = (field: string, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const addEntry = () => {
    if (!canAddEntry()) {
      const hours = getCurrentEntryHours();
      const totalAfterAdding = getTotalHours() + hours;
      
      if (totalAfterAdding > 8) {
        toast({
          title: 'Cannot Add Entry',
          description: `Adding ${hours.toFixed(2)} hours would exceed the 8-hour daily limit. You have ${getRemainingHours().toFixed(2)} hours remaining.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Cannot Add Entry',
          description: 'Please fill all required fields with valid times.',
          variant: 'destructive',
        });
      }
      return;
    }

    const hours = getCurrentEntryHours();
    const selectedActivity = activityOptions.find(opt => opt.value === currentEntry.category);
    
    const newEntry: ActivityEntry = {
      id: Date.now().toString(),
      category: selectedActivity?.label || currentEntry.category,
      fromTime: currentEntry.fromTime,
      toTime: currentEntry.toTime,
      hours: hours,
      notes: currentEntry.notes,
      isBillable: selectedActivity?.billable || false
    };

    // If this is a demo entry, add it to sales tracking
    if (currentEntry.category === 'demo') {
      try {
        addDemoToSalesTracking(newEntry, user);
        toast({
          title: 'Demo Added to Sales Tracking',
          description: 'Your demo has been automatically added to the sales tracking system.',
        });
      } catch (error) {
        console.error('Error adding demo to sales tracking:', error);
      }
    }

    setSavedEntries(prev => [...prev, newEntry]);
    
    // Reset current entry
    setCurrentEntry({
      category: '',
      fromTime: '',
      toTime: '',
      notes: ''
    });

    toast({
      title: 'Entry Added',
      description: `Added ${hours.toFixed(2)} hours for ${newEntry.category}. Total: ${(getTotalHours() + hours).toFixed(2)}h`,
    });
  };

  const removeEntry = (id: string) => {
    const entryToRemove = savedEntries.find(entry => entry.id === id);
    setSavedEntries(prev => prev.filter(entry => entry.id !== id));
    
    if (entryToRemove) {
      toast({
        title: 'Entry Removed',
        description: `Removed ${entryToRemove.hours.toFixed(2)} hours from ${entryToRemove.category}`,
      });
    }
  };

  const saveAsDraft = () => {
    if (savedEntries.length === 0) {
      toast({
        title: 'No Entries',
        description: 'Please add at least one activity entry.',
        variant: 'destructive',
      });
      return;
    }

    const reportToStore = {
      id: `${user.id}-${reportData.date}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      date: reportData.date,
      attendanceStatus: reportData.attendanceStatus,
      activities: savedEntries.map(entry => ({
        category: entry.category,
        fromTime: entry.fromTime,
        toTime: entry.toTime,
        hours: entry.hours,
        notes: entry.notes,
        isBillable: entry.isBillable
      })),
      generalNotes: reportData.generalNotes,
      submittedAt: '' // Empty means saved but not submitted
    };

    reportStore.addReport(reportToStore);
    setIsDraft(true);
    console.log('Trainer report saved as draft:', reportToStore);

    toast({
      title: 'Draft Saved',
      description: `Your daily report has been saved as draft with ${getTotalHours().toFixed(2)} total hours.`,
    });
  };

  const submitFinalReport = () => {
    if (savedEntries.length === 0) {
      toast({
        title: 'No Entries',
        description: 'Please add at least one activity entry.',
        variant: 'destructive',
      });
      return;
    }

    if (!reportData.attendanceStatus) {
      toast({
        title: 'Missing Information',
        description: 'Please select attendance status.',
        variant: 'destructive',
      });
      return;
    }

    const reportToStore = {
      id: `${user.id}-${reportData.date}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      date: reportData.date,
      attendanceStatus: reportData.attendanceStatus,
      activities: savedEntries.map(entry => ({
        category: entry.category,
        fromTime: entry.fromTime,
        toTime: entry.toTime,
        hours: entry.hours,
        notes: entry.notes,
        isBillable: entry.isBillable
      })),
      generalNotes: reportData.generalNotes,
      submittedAt: new Date().toISOString()
    };

    reportStore.addReport(reportToStore);
    setIsSubmitted(true);
    setIsDraft(false);
    console.log('Trainer report submitted:', reportToStore);

    toast({
      title: 'Report Submitted',
      description: `Your daily report has been submitted successfully with ${getTotalHours().toFixed(2)} total hours.`,
    });
  };

  const totalHours = getTotalHours();
  const currentHours = getCurrentEntryHours();
  const remainingHours = getRemainingHours();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{getReportTitle()}</h1>
        <p className="text-gray-600 mt-1">{getReportDescription()}</p>
      </div>

      <div className="space-y-6">
        {/* Date and Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Date & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={reportData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  disabled={isSubmitted}
                />
              </div>
              <div>
                <Label htmlFor="attendance">Attendance Status</Label>
                <Select 
                  value={reportData.attendanceStatus} 
                  onValueChange={(value) => handleInputChange('attendanceStatus', value)}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendance status" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Total Hours Logged</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{Math.max(0, 8 - totalHours).toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Hours to Complete 8h</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{currentHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Current Entry</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{savedEntries.length}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((totalHours / 8) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-1">
                {totalHours.toFixed(1)} hours logged {totalHours >= 8 ? '(Target achieved!)' : `(${(8 - totalHours).toFixed(1)}h to reach 8h target)`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add New Activity Entry */}
        {!isSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add Activity Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Activity Category</Label>
                  <Select 
                    value={currentEntry.category} 
                    onValueChange={(value) => handleCurrentEntryChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} {option.billable ? '(Billable)' : '(Non-Billable)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fromTime">From Time</Label>
                    <Input
                      id="fromTime"
                      type="time"
                      value={currentEntry.fromTime}
                      onChange={(e) => handleCurrentEntryChange('fromTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="toTime">To Time</Label>
                    <Input
                      id="toTime"
                      type="time"
                      value={currentEntry.toTime}
                      onChange={(e) => handleCurrentEntryChange('toTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Calculated Hours: {currentHours.toFixed(2)}h</Label>
                {currentHours > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    This will bring your total to {(totalHours + currentHours).toFixed(1)}h
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={currentEntry.notes}
                  onChange={(e) => handleCurrentEntryChange('notes', e.target.value)}
                  placeholder="Describe the activity..."
                  rows={2}
                />
              </div>
              <Button 
                onClick={addEntry} 
                disabled={!currentEntry.category || !currentEntry.fromTime || !currentEntry.toTime || currentHours <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry ({currentHours.toFixed(1)}h)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Saved Entries */}
        {savedEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Activities ({savedEntries.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{entry.category}</span>
                        <span className="text-sm text-gray-500">
                          {entry.fromTime} - {entry.toTime} ({entry.hours.toFixed(2)}h)
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.isBillable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.isBillable ? 'Billable' : 'Non-Billable'}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                    {!isSubmitted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Notes */}
        <Card>
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
            <CardDescription>Additional comments or observations</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.generalNotes}
              onChange={(e) => handleInputChange('generalNotes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              disabled={isSubmitted}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isSubmitted && (
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={saveAsDraft}
              disabled={savedEntries.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={submitFinalReport}
              disabled={savedEntries.length === 0 || !reportData.attendanceStatus}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Final Report
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {isDraft && !isSubmitted && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-yellow-600 text-lg font-medium">Draft Saved</div>
                <p className="text-yellow-700 text-sm mt-1">Your report for {reportData.date} is saved as draft with {totalHours.toFixed(2)} total hours.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isSubmitted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-green-600 text-lg font-medium">Report Submitted Successfully</div>
                <p className="text-green-700 text-sm mt-1">Your daily report for {reportData.date} has been submitted with {totalHours.toFixed(2)} total hours.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrainerDailyReport;
