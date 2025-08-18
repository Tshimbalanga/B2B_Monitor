import React from 'react';
import { 
  Home, 
  Network, 
  FileText, 
  AlertCircle, 
  BarChart3, 
  Users, 
  Settings,
  Monitor,
  CreditCard,
  PowerOff,
  MapPin,
  LayoutDashboard,
  Activity,
  Package
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange }) => {
  const getMenuItems = (role: string) => {
    // Définition des permissions par rôle
    const rolePermissions = {
      admin: {
        dashboard: true,
        connections: true,
        monitoring: true,
        incidents: true,
        'fme-tracking': true,
        reports: true,
        requests: true,
        deactivations: true,
        'spare-parts': true,
        billing: true,
        users: true,
        settings: true,
      },
      commercial: {
        dashboard: true,
        connections: true,
        monitoring: false, // Pas d'accès au monitoring technique
        incidents: false, // Pas d'accès aux incidents techniques
        reports: true,
        requests: true,
        deactivations: true,
        'spare-parts': true,
        billing: true,
        users: false,
        settings: false,
      },
      project: {
        dashboard: true,
        connections: true,
        monitoring: true,
        incidents: true,
        reports: true,
        requests: true,
        deactivations: true,
        'spare-parts': true,
        billing: false, // Pas d'accès à la facturation
        users: false,
        settings: false,
      },
      maintenance: {
        dashboard: true,
        connections: true,
        monitoring: true,
        incidents: true,
        'fme-tracking': true,
        reports: true,
        requests: false, // Pas d'accès aux demandes commerciales
        deactivations: true,
        'spare-parts': true,
        billing: false,
        users: false,
        settings: false,
      },
      client: {
        dashboard: true,
        connections: true,
        monitoring: true,
        incidents: true,
        reports: true,
        requests: false,
        deactivations: false,
        billing: false,
        users: false,
        settings: false,
      },
    };

    const permissions = rolePermissions[role as keyof typeof rolePermissions] || rolePermissions.admin;

    const allMenuItems = [
      { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
      { id: 'connections', label: 'Liaisons', icon: Network },
      { id: 'monitoring', label: 'Supervision', icon: Monitor },
      { id: 'incidents', label: 'Incidents', icon: AlertCircle },
      { id: 'fme-tracking', label: 'Suivi FME', icon: MapPin },
      { id: 'reports', label: 'Monitoring Global', icon: BarChart3 },
      { id: 'requests', label: 'Demandes de création', icon: FileText },
      { id: 'deactivations', label: 'Demandes de résiliation', icon: PowerOff },
      { id: 'spare-parts', label: 'Spares Parts', icon: Package },
      { id: 'billing', label: 'Facturation', icon: CreditCard },
      { id: 'users', label: 'Utilisateurs', icon: Users },
      { id: 'settings', label: 'Configuration', icon: Settings },
    ];

    // Filtrer les éléments selon les permissions
    return allMenuItems.filter(item => permissions[item.id as keyof typeof permissions]);
  };

  const menuItems = getMenuItems(user?.role || 'admin');

  return (
    <aside className="bg-white w-64 shadow-sm border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};