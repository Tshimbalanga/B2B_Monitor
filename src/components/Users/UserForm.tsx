import React, { useState } from 'react';
import { X, User, Mail, Building, Shield, UserCheck, Users } from 'lucide-react';
import { User as UserType } from '../../types';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (userData: Omit<UserType, 'id'>) => void;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; description: string }> = {
  admin: {
    label: 'Administrateur',
    icon: Shield,
    description: 'Accès administratif'
  },
  commercial: {
    label: 'Commercial',
    icon: Building,
    description: 'Gestion des demandes et facturation'
  },
  project: {
    label: 'Chef de Projet',
    icon: UserCheck,
    description: 'Gestion des déploiements'
  },
  maintenance: {
    label: 'Maintenance',
    icon: UserCheck,
    description: 'Gestion des incidents et monitoring'
  },
  facturation: {
    label: 'Facturation',
    icon: Building,
    description: 'Gestion de la facturation'
  },
  client: {
    label: 'Client',
    icon: Users,
    description: 'Accès limité aux services'
  }
};

export const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'commercial' as const,
    department: '',
    subDepartment: '',
    managerEmail: '',
    adminType: 'admin' as 'admin' | 'super_admin',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Le département est requis';
    }

    // Validation spécifique pour commercial
    if (formData.role === 'commercial' && !formData.managerEmail.trim()) {
      newErrors.managerEmail = 'L\'email du chef directeur est requis pour les commerciaux';
    } else if (formData.managerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
      newErrors.managerEmail = 'Format d\'email invalide pour le chef directeur';
    }

    // Validation pour maintenance
    if (formData.role === 'maintenance' && !formData.subDepartment.trim()) {
      newErrors.subDepartment = 'Le sous-département est requis pour la maintenance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newUser: Omit<UserType, 'id'> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role === 'admin' ? formData.adminType : formData.role,
        department: formData.department.trim(),
        ...(formData.subDepartment && { subDepartment: formData.subDepartment.trim() }),
        ...(formData.managerEmail && { managerEmail: formData.managerEmail.trim() }),
      };
      
      onSubmit(newUser);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvel Utilisateur</h2>
              <p className="text-sm text-gray-600">Créer un nouveau compte utilisateur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Jean Dupont"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="exemple@orange.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Département */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Département *
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Ventes B2B"
              />
            </div>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rôle utilisateur *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(ROLE_CONFIG).map(([key, role]) => {
                const RoleIcon = role.icon;
                const isSelected = formData.role === key;
                
                return (
                  <label
                    key={key}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={key}
                      checked={isSelected}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <RoleIcon size={16} className={isSelected ? 'text-orange-600' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sous-département pour maintenance */}
          {formData.role === 'maintenance' && (
            <div>
              <label htmlFor="subDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                Sous-département *
              </label>
              <select
                id="subDepartment"
                value={formData.subDepartment}
                onChange={(e) => handleInputChange('subDepartment', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.subDepartment ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un sous-département</option>
                <option value="SAV">SAV</option>
                <option value="BO">BO</option>
                <option value="FME">FME</option>
                <option value="NOC">NOC</option>
              </select>
              {errors.subDepartment && (
                <p className="mt-1 text-sm text-red-600">{errors.subDepartment}</p>
              )}
            </div>
          )}

          {/* Type d'administrateur */}
          {formData.role === 'admin' && (
            <div>
              <label htmlFor="adminType" className="block text-sm font-medium text-gray-700 mb-2">
                Type d'administrateur *
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-orange-400">
                  <input
                    type="radio"
                    name="adminType"
                    value="admin"
                    checked={formData.adminType === 'admin'}
                    onChange={(e) => handleInputChange('adminType', e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Administrateur</div>
                    <div className="text-sm text-gray-600">Accès administratif limité</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-orange-400">
                  <input
                    type="radio"
                    name="adminType"
                    value="super_admin"
                    checked={formData.adminType === 'super_admin'}
                    onChange={(e) => handleInputChange('adminType', e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Super Administrateur</div>
                    <div className="text-sm text-gray-600">Accès complet à toutes les fonctionnalités</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Email du chef directeur pour commercial */}
          {formData.role === 'commercial' && (
            <div>
              <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email du chef directeur *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="managerEmail"
                  value={formData.managerEmail}
                  onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.managerEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="directeur@orange.com"
                />
              </div>
              {errors.managerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.managerEmail}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};









