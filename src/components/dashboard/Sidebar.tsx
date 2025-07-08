
import { 
  LayoutDashboard, 
  FileText, 
  Eye, 
  CheckSquare, 
  BarChart3, 
  CheckCircle,
  TrendingUp,
  LogOut,
  User,
  Target
} from 'lucide-react';

interface SidebarProps {
  user: any;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar = ({ user, activeView, setActiveView, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'daily-report', label: 'Daily Report', icon: FileText },
    { id: 'view-reports', label: 'View Reports', icon: Eye },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare },
    { id: 'evaluation', label: 'Evaluation', icon: User },
    ...(user.role === 'admin' ? [
      { id: 'approvals', label: 'Team Leadership', icon: CheckCircle }
    ] : []),
    ...(user.role === 'super_admin' ? [
      { id: 'kpi-tracking', label: 'KPI Tracking', icon: TrendingUp },
      { id: 'approvals', label: 'Team Leadership', icon: CheckCircle },
      { id: 'sales-tracking', label: 'Sales Tracking', icon: Target },
      { id: 'usm', label: 'Software Management', icon: Target }
    ] : [])
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col">
      {/* Company Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          {/* Logo placeholder - replace with your company logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            {/* Replace this div with your logo image */}
            <img 
              src="/placeholder.svg" 
              alt="Company Logo" 
              className="w-8 h-8 object-contain"
              style={{ display: 'none' }} // Hide placeholder, show when you add your logo
            />
            {/* Temporary icon - remove when adding your logo */}
            <Target className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Company</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
