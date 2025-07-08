
import { useState } from 'react';
import Sidebar from './Sidebar';
import AdminDashboard from './AdminDashboard';
import TeamMemberDashboard from './TeamMemberDashboard';
import DailyReport from './DailyReport';
import DailyReportViewer from './DailyReportViewer';
import TaskManagement from './TaskManagement';
import Reports from './Reports';
import EngineerEvaluation from './EngineerEvaluation';
import AdminApproval from './AdminApproval';
import KPITracking from './KPITracking';
import UserSoftwareManagement from './UserSoftwareManagement';
import SalesTracking from './SalesTracking';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        // Combined dashboard and analytics view for admin users
        return (
          <div className="space-y-8">
            {user.role === 'admin' ? <AdminDashboard /> : <TeamMemberDashboard user={user} />}
            {user.role === 'admin' && (
              <div>
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
                  <Reports user={user} />
                </div>
              </div>
            )}
          </div>
        );
      case 'daily-report':
        return <DailyReport user={user} />;
      case 'view-reports':
        return <DailyReportViewer user={user} />;
      case 'tasks':
        return <TaskManagement user={user} />;
      case 'evaluation':
        return <EngineerEvaluation user={user} />;
      case 'approvals':
        return <AdminApproval user={user} />;
      case 'kpi-tracking':
        return <KPITracking user={user} />;
      case 'usm':
        return <UserSoftwareManagement />;
      case 'sales-tracking':
        return <SalesTracking user={user} />;
      default:
        return <TeamMemberDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={user} 
        activeView={activeView} 
        setActiveView={setActiveView}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
