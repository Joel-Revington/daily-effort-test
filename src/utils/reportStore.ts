
interface ReportData {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  attendanceStatus: string;
  activities: Array<{
    category: string;
    fromTime: string;
    toTime: string;
    hours: number;
    notes: string;
    isBillable?: boolean;
  }>;
  generalNotes: string;
  submittedAt: string;
}

class ReportStore {
  private reports: ReportData[] = [];

  addReport(report: ReportData) {
    // Remove existing report for the same user and date
    this.reports = this.reports.filter(
      existingReport => !(existingReport.userId === report.userId && existingReport.date === report.date)
    );
    
    this.reports.push(report);
    console.log('Report added to store:', report);
  }

  getReports(userId?: string, userRole?: string): ReportData[] {
    if (userRole === 'admin') {
      return this.reports;
    }
    return this.reports.filter(report => report.userId === userId);
  }

  getReportsByDateRange(startDate: string, endDate: string, userId?: string, userRole?: string): ReportData[] {
    const filtered = this.getReports(userId, userRole).filter(report => 
      report.date >= startDate && report.date <= endDate
    );
    return filtered;
  }
}

export const reportStore = new ReportStore();
export type { ReportData };
