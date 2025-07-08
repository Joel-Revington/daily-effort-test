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
import { dailyReportService, profileService } from '@/lib/supabase-client';
import type { DailyReport, Profile } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';

interface DailyReportViewerProps {
  user: any;
}

const DailyReportViewer = ({ user }: DailyReportViewerProps) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    member: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'pivot' | 'detailed'>('pivot');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reports based on user role
      let reportsData: DailyReport[];
      if (user.role === 'admin' || user.role === 'super_admin') {
        reportsData = await dailyReportService.getAllReports();
        // Also load team members for admin
        const membersData = await profileService.getAllProfiles();
        setTeamMembers(membersData);
      } else {
        reportsData = await dailyReportService.getUserReports(user.id);
      }
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];
    
    // Apply date filters
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(report => 
        report.date >= filters.startDate && report.date <= filters.endDate
      );
    }
    
    // Apply member filter (admin only)
    if (user.role === 'admin' && filters.member !== 'all') {
      filtered = filtered.filter(report => 
        report.user?.full_name?.toLowerCase().includes(filters.member.toLowerCase())
      );
    }
    
    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(report =>
        report.user?.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.general_notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.activities?.some(activity => 
          activity.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
          activity.category.toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }
    
    setFilteredReports(filtered);
  };

  // Generate pivot data: summing hours by category and billable status
  const generatePivotData = () => {
    const pivotData: any = {};
    
    filteredReports.forEach(report => {
      report.activities?.forEach(activity => {
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
        if (activity.is_billable) {
          pivotData[key].billableHours += activity.hours;
        } else {
          pivotData[key].nonBillableHours += activity.hours;
        }
        
        // Track by member
        const memberName = report.user?.full_name || 'Unknown';
        if (!pivotData[key].memberHours[memberName]) {
          pivotData[key].memberHours[memberName] = 0;
        }
        pivotData[key].memberHours[memberName] += activity.hours;
        
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
      case 'client site': return 'bg-purple-Let me start by creating the database schema for all the entities we need:
    }
  }
}

<boltArtifact id="supabase-migration-schema" title="Create Supabase Database Schema">