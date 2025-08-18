import React from 'react';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType | null;
  alertCount: number;
  onLogout: () => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, alertCount, onLogout, onNotificationClick }) => {
  const getRoleLabel = (role: string) => {
    const labels = {
      commercial: 'Commercial',
      project: 'Chef de Projet',
      maintenance: 'Maintenance',
      client: 'Client',
      admin: 'Administrateur',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      commercial: 'bg-blue-100 text-blue-800',
      project: 'bg-green-100 text-green-800',
      maintenance: 'bg-orange-100 text-orange-800',
      client: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || colors.client;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/orange_logo.svg" alt="Orange Telecom" className="h-8 w-auto" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Orange B2B</h1>
                <p className="text-xs text-gray-500">Gestion Expérience Client</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onNotificationClick}
                title={`${alertCount} notification${alertCount !== 1 ? 's' : ''}`}
              >
                <Bell size={20} />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={20} />
            </button>

            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-orange-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name || 'Utilisateur'}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || 'client')}`}>
                      {getRoleLabel(user?.role || 'client')}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};