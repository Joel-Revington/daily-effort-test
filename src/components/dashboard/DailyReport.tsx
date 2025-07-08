import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Clock, Calendar, Plus, Trash2, Send, AlertCircle, Trophy, TrendingUp } from 'lucide-react';
import { dailyReportService, DailyReport as DailyReportType, ReportActivity } from '@/services/dailyReportService';
import { useSupabase } from '@/hooks/useSupabase';

interface DailyReportProps {
  user: any;
}

interface ActivityEntry {
  id?: string;
  category: string;
  fromTime: string;
  toTime: string;
  hours: number;
  notes: string;
  isBillable: boolean;
}

const DailyReport = ({ user }: DailyReportProps) => {
  const { toast } = useToast();
  const { handleError, handleSuccess } = useSupabase();
  
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
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const attendanceOptions = ['Present', 'Half Day', 'Leave', 'Work From Home', 'Client Site'];

  const getActivityOptions = () => {
    const userDesignation = user.designation || user.role || '';
    
    if (userDesignation.toLowerCase().includes('trainer')) {
      return [
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
    } else {
      return [
        { value: 'demo', label: 'Demo', billable: true },
        { value: 'prePostPresentation', label: 'Pre/Post Presentation', billable: true },
        { value: 'corporateConsultingTraining', label: 'Corporate Consulting/Training', billable: true },
        { value: 'project', label: 'Project', billable: true },
        { value: 'consultingContentPrep', label: 'Consulting Content Prep', billable: true },
        { value: 'techSupport', label: 'Tech Support', billable: true },
        { value: 'meeting', label: 'Meeting', billable: false },
        { value: 'devLearning', label: 'Dev/Learning', billable: true },
        { value: 'misc', label: 'Miscellaneous', billable: false }
      ];
    }
  };

  const activityOptions = getActivityOptions();

  const isDateEditable = (selectedDate: string) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const diffTime = today.getTime() - selected.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  useEffect(() => {
    loadSavedEntries();
  }, [reportData.date]);

  const loadSavedEntries = async () => {
    try {
      setLoading(true);
      const report = await dailyReportService.getReportByUserAndDate(user.id, reportData.date);
      
      if (report) {
        setReportId(report.id);
        const entries: ActivityEntry[] = (report.activities || []).map((activity) => ({
          id: activity.id,
          category: activity.category,
          fromTime: activity.from_time,
          toTime: activity.to_time,
          hours: activity.hours,
          notes: activity.notes,
          isBillable: activity.is_billable
        }));
        setSavedEntries(entries);
        setReportData(prev => ({
          ...prev,
          attendanceStatus: report.attendance_status,
          generalNotes: report.general_notes
        }));
        setIsSubmitted(!!report.submitted_at);
        setIsDraft(!report.submitted_at && entries.length > 0);
      } else {
        setReportId(null);
        setSavedEntries([]);
        setIsSubmitted(false);
        setIsDraft(false);
        setReportData(prev => ({
          ...prev,
          attendanceStatus: '',
          generalNotes: ''
        }));
      }
    } catch (error) {
      handleError(error, 'load report');
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (fromTime: string, toTime: string): number => {
    if (!fromTime || !toTime) return 0;
    
    const from = new Date(`2024-01-01 ${fromTime}`);
    const to = new Date(`2024-01-01 ${toTime}`);
    
    if (to <= from) return 0;
    
    const diffMs = to.getTime() - from.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 4) / 4;
  };

  const getCurrentEntryHours = () => {
    return calculateHours(currentEntry.fromTime, currentEntry.toTime);
  };

  const getTotalHours = () => {
    return savedEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getProductivityHours = () => {
    return savedEntries.filter(entry => entry.isBillable).reduce((total, entry) => total + entry.hours, 0);
  };

  const handleInputChange = (field: string, value: string) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrentEntryChange = (field: string, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const addEntry = async () => {
    const hours = getCurrentEntryHours();
    
    if (!currentEntry.category || !currentEntry.fromTime || !currentEntry.toTime || hours <= 0) {
      toast({
        title: 'Cannot Add Entry',
        description: 'Please fill all required fields with valid times.',
        variant: 'destructive',
      });
      return;
    }

    const selectedActivity = activityOptions.find(opt => opt.value === currentEntry.category);
    
    const newEntry: ActivityEntry = {
      category: selectedActivity?.label || currentEntry.category,
      fromTime: currentEntry.fromTime,
      toTime: currentEntry.toTime,
      hours: hours,
      notes: currentEntry.notes,
      isBillable: selectedActivity?.billable || false
    };

    try {
      // Create or update report first
      let currentReportId = reportId;
      if (!currentReportId) {
        const report = await dailyReportService.upsertReport({
          user_id: user.id,
          date: reportData.date,
          attendance_status: reportData.attendanceStatus || 'Present',
          general_notes: reportData.generalNotes,
          submitted_at: null
        });
        currentReportId = report.id;
        setReportId(currentReportId);
      }

      // Add activity
      const activity = await dailyReportService.addActivity({
        report_id: currentReportId,
        category: newEntry.category,
        from_time: newEntry.fromTime,
        to_time: newEntry.toTime,
        hours: newEntry.hours,
        notes: newEntry.notes,
        is_billable: newEntry.isBillable
      });

      setSavedEntries(prev => [...prev, { ...newEntry, id: activity.id }]);
      
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
    } catch (error) {
      handleError(error, 'add entry');
    }
  };

  const removeEntry = async (id: string) => {
    try {
      await dailyReportService.deleteActivity(id);
      const entryToRemove = savedEntries.find(entry => entry.id === id);
      setSavedEntries(prev => prev.filter(entry => entry.id !== id));
      
      if (entryToRemove) {
        toast({
          title: 'Entry Removed',
          description: `Removed ${entryToRemove.hours.toFixed(2)} hours from ${entryToRemove.category}`,
        });
      }
    } catch (error) {
      handleError(error, 'remove entry');
    }
  };

  const saveAsDraft = async () => {
    if (savedEntries.length === 0) {
      toast({
        title: 'No Entries',
        description: 'Please add at least one activity entry.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dailyReportService.upsertReport({
        user_id: user.id,
        date: reportData.date,
        attendance_status: reportData.attendanceStatus,
        general_notes: reportData.generalNotes,
        submitted_at: null
      });

      setIsDraft(true);
      handleSuccess(`Your daily report has been saved as draft with ${getTotalHours().toFixed(2)} total hours.`);
    } catch (error) {
      handleError(error, 'save draft');
    }
  };

  const submitFinalReport = async () => {
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

    try {
      await dailyReportService.upsertReport({
        user_id: user.id,
        date: reportData.date,
        attendance_status: reportData.attendanceStatus,
        general_notes: reportData.generalNotes,
        submitted_at: new Date().toISOString()
      });

      setIsSubmitted(true);
      setIsDraft(false);
      handleSuccess(`Your daily report has been submitted successfully with ${getTotalHours().toFixed(2)} total hours.`);
    } catch (error) {
      handleError(error, 'submit report');
    }
  };

  const totalWorkedHours = getTotalHours();
  const productivityHours = getProductivityHours();
  const productivityPercentage = totalWorkedHours > 0 ? ((productivityHours / totalWorkedHours) * 100).toFixed(1) : '0';
  const currentHours = getCurrentEntryHours();
  const canEditDate = isDateEditable(reportData.date);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600">Welcome back, {user.name}! Track your daily activities and progress.</p>
          <p className="text-sm text-gray-500">You can edit reports for today and up to 2 days back. Keep track of your productive hours and tasks.</p>
        </div>
      </div>

      <div className="space-y-6">
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
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                {!canEditDate && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You can only edit reports from today and up to 2 days back</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="attendance">Attendance Status</Label>
                <Select 
                  value={reportData.attendanceStatus} 
                  onValueChange={(value) => handleInputChange('attendanceStatus', value)}
                  disabled={isSubmitted || !canEditDate}
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

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalWorkedHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{productivityHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Productive Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{productivityPercentage}%</p>
                <p className="text-sm text-gray-600">Productivity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{currentHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Current Entry</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isSubmitted && canEditDate && (
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
                    This will bring your total to {(totalWorkedHours + currentHours).toFixed(1)}h
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

        {savedEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activities for {reportData.date} ({savedEntries.length} entries)</CardTitle>
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
                    {!isSubmitted && canEditDate && entry.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEntry(entry.id!)}
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

        <Card>
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
            <CardDescription>Additional comments or observations for {reportData.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.generalNotes}
              onChange={(e) => handleInputChange('generalNotes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              disabled={isSubmitted || !canEditDate}
            />
          </CardContent>
        </Card>

        {!isSubmitted && canEditDate && (
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

        {isDraft && !isSubmitted && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-yellow-600 text-lg font-medium">Draft Saved</div>
                <p className="text-yellow-700 text-sm mt-1">Your report for {reportData.date} is saved as draft with {totalWorkedHours.toFixed(2)} total hours.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isSubmitted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-green-600 text-lg font-medium">Report Submitted Successfully</div>
                <p className="text-green-700 text-sm mt-1">Your daily report for {reportData.date} has been submitted with {totalWorkedHours.toFixed(2)} total hours.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!canEditDate && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-gray-600 text-lg font-medium">Report View Only</div>
                <p className="text-gray-700 text-sm mt-1">Reports older than 2 days cannot be edited. You can only view this report.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyReport;