import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, Mail, Building, UserCheck, Key, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { UserForm } from './UserForm';
import UserEditModal from './UserEditModal';

interface UserManagementProps {
  users: User[];
  onAddUser?: (userData: Omit<User, 'id'>) => void;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onDeleteUser?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  admin: {
    label: 'Administrateur',
    color: 'text-[#B00020] bg-red-50 border-red-200',
    icon: Shield
  },
  super_admin: {
    label: 'Super Administrateur',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    icon: Shield
  },
  commercial: {
    label: 'Commercial',
    color: 'text-[#0044CC] bg-blue-50 border-blue-200',
    icon: Building
  },
  project: {
    label: 'Chef de Projet',
    color: 'text-[#006400] bg-green-50 border-green-200',
    icon: UserCheck
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-[#806000] bg-yellow-50 border-yellow-200',
    icon: UserCheck
  },
  facturation: {
    label: 'Facturation',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    icon: Building
  },
  client: {
    label: 'Client',
    color: 'text-[#4D4D4D] bg-gray-50 border-gray-200',
    icon: Users
  }
};

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser, 
  onResetPassword 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredUsers = users.filter(user => {
    const search = normalize(searchTerm);
    const matchesSearch =
      normalize(user.name).includes(search) ||
      normalize(user.email).includes(search);
    
    let matchesRole = roleFilter === 'all';
    if (roleFilter === 'admin') {
      matchesRole = user.role === 'admin' || user.role === 'super_admin';
    } else {
      matchesRole = user.role === roleFilter;
    }
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="font-['Helvetica_Neue','Roboto',sans-serif]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#000000]">Gestion des Utilisateurs</h2>
          <p className="text-[#4D4D4D] mt-1">Administration des accès et privilèges</p>
        </div>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-[#FF7900] text-white px-4 py-2 rounded-lg hover:bg-[#e66d00] flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-[#F2F2F2] mb-6 p-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-[#B3B3B3] rounded-lg focus:ring-2 focus:ring-[#FF7900] focus:border-[#FF7900]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-[#B3B3B3] rounded-lg focus:ring-2 focus:ring-[#FF7900] focus:border-[#FF7900]"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(ROLE_CONFIG).map(([key, role]) => (
            <option key={key} value={key}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#F2F2F2]">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              {['Utilisateur', 'Rôle', 'Département', 'Contact', 'Statut', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-[#4D4D4D] uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F2F2F2]">
            {filteredUsers.map((user) => {
              const roleData = ROLE_CONFIG[user.role] || ROLE_CONFIG.client;
              const RoleIcon = roleData.icon;

              return (
                <tr 
                  key={user.id} 
                  className="hover:bg-[#F9F9F9] cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowEditModal(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <div className="w-10 h-10 bg-[#FFF3E6] rounded-full flex items-center justify-center">
                      <Users size={20} className="text-[#FF7900]" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-black">{user.name}</div>
                      <div className="text-sm text-[#4D4D4D]">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                    <RoleIcon size={16} className="text-[#4D4D4D]" />
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleData.color}`}>
                      {roleData.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    <div>
                      <div>{user.department || 'Non défini'}</div>
                      {user.subDepartment && (
                        <div className="text-xs text-gray-500">({user.subDepartment})</div>
                      )}
                      {user.managerEmail && (
                        <div className="text-xs text-gray-500">Manager: {user.managerEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm flex items-center space-x-2 text-[#4D4D4D]">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-[#FF7900] hover:text-[#cc6200] p-1 rounded"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Gérer les rôles"
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                      title="Réinitialiser mot de passe"
                    >
                      <Key size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statistiques des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
        {Object.entries(ROLE_CONFIG).map(([key, role]) => {
          let count = 0;
          if (key === 'admin') {
            count = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
          } else {
            count = users.filter(u => u.role === key).length;
          }
          const RoleIcon = role.icon;
          return (
            <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-[#F2F2F2]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#FFF3E6] p-2 rounded-lg">
                  <RoleIcon size={20} className="text-[#FF7900]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">{count}</div>
                  <div className="text-sm text-[#4D4D4D]">{role.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          onSubmit={(userData) => {
            if (onAddUser) {
              onAddUser(userData);
            }
            setShowUserForm(false);
          }}
        />
      )}

      {/* User Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdateUser={(userId, updates) => {
            if (onUpdateUser) {
              onUpdateUser(userId, updates);
            }
          }}
          onDeleteUser={(userId) => {
            if (onDeleteUser) {
              onDeleteUser(userId);
            }
          }}
          onResetPassword={(userId) => {
            if (onResetPassword) {
              onResetPassword(userId);
            }
          }}
        />
      )}
    </div>
  );
};
