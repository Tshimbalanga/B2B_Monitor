import React, { useState } from 'react';
import { X, User, Shield, Mail, Building, UserCheck, Users, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { User as UserType } from '../../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUpdateUser: (userId: string, updates: Partial<UserType>) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  admin: {
    label: 'Administrateur',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: Shield,
    description: 'Accès administratif'
  },
  commercial: {
    label: 'Commercial',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: Building,
    description: 'Gestion des clients et facturation'
  },
  project: {
    label: 'Chef de Projet',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: UserCheck,
    description: 'Gestion des projets et liaisons'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: UserCheck,
    description: 'Gestion technique et maintenance'
  },
  facturation: {
    label: 'Facturation',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    icon: Building,
    description: 'Gestion de la facturation'
  },
  client: {
    label: 'Client',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    icon: Users,
    description: 'Accès limité aux informations client'
  }
};

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onDeleteUser,
  onResetPassword
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: (user?.role === 'super_admin' ? 'admin' : user?.role) || 'client',
    department: user?.department || '',
    subDepartment: user?.subDepartment || '',
    managerEmail: user?.managerEmail || '',
    adminType: (user?.role === 'super_admin' ? 'super_admin' : 'admin') as 'admin' | 'super_admin'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen || !user) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updateData = {
        ...formData,
        role: formData.role === 'admin' ? formData.adminType : formData.role
      };
      onUpdateUser(user.id, updateData);
      onClose();
    }
  };

  const handleDelete = () => {
    onDeleteUser(user.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleResetPassword = () => {
    onResetPassword(user.id);
    setShowResetConfirm(false);
  };

  const currentRoleData = ROLE_CONFIG[user.role === 'super_admin' ? 'admin' : user.role] || ROLE_CONFIG.client;
  const CurrentRoleIcon = currentRoleData.icon;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <User size={24} style={{ color: '#FF7900' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Modifier l'utilisateur
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                {user.name} - {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#9ca3af'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Informations actuelles */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Rôle actuel
            </h3>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CurrentRoleIcon size={20} style={{ color: '#6b7280' }} />
               <span style={{
                 display: 'inline-flex',
                 alignItems: 'center',
                 padding: '6px 12px',
                 borderRadius: '6px',
                 fontSize: '14px',
                 fontWeight: '500',
                 border: '1px solid',
                 color: user.role === 'super_admin' ? '#7c3aed' : 
                        currentRoleData.color.includes('red') ? '#dc2626' :
                        currentRoleData.color.includes('blue') ? '#1d4ed8' :
                        currentRoleData.color.includes('green') ? '#059669' :
                        currentRoleData.color.includes('yellow') ? '#d97706' : '#374151',
                 backgroundColor: user.role === 'super_admin' ? '#f3f4f6' :
                               currentRoleData.color.includes('red') ? '#fef2f2' :
                               currentRoleData.color.includes('blue') ? '#eff6ff' :
                               currentRoleData.color.includes('green') ? '#f0fdf4' :
                               currentRoleData.color.includes('yellow') ? '#fffbeb' : '#f9fafb',
                 borderColor: user.role === 'super_admin' ? '#e5e7eb' :
                            currentRoleData.color.includes('red') ? '#fecaca' :
                            currentRoleData.color.includes('blue') ? '#bfdbfe' :
                            currentRoleData.color.includes('green') ? '#bbf7d0' :
                            currentRoleData.color.includes('yellow') ? '#fed7aa' : '#e5e7eb'
               }}>
                 {user.role === 'super_admin' ? 'Super Administrateur' : currentRoleData.label}
               </span>
             </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>
              {currentRoleData.description}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Nom */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.name ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Nom complet de l'utilisateur"
                />
                {errors.name && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.email ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="email@exemple.com"
                />
                {errors.email && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>
                )}
              </div>

              {/* Rôle */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.role ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {Object.entries(ROLE_CONFIG).map(([key, role]) => {
                    const RoleIcon = role.icon;
                    return (
                      <option key={key} value={key}>
                        {role.label} - {role.description}
                      </option>
                    );
                  })}
                </select>
                {errors.role && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.role}</p>
                )}
              </div>

              {/* Département */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Département
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Département (optionnel)"
                />
              </div>

              {/* Sous-département pour maintenance */}
              {formData.role === 'maintenance' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Sous-département
                  </label>
                  <select
                    value={formData.subDepartment}
                    onChange={(e) => setFormData(prev => ({ ...prev, subDepartment: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner un sous-département</option>
                    <option value="SAV">SAV</option>
                    <option value="BO">BO</option>
                    <option value="FME">FME</option>
                    <option value="NOC">NOC</option>
                  </select>
                </div>
              )}

                             {/* Type d'administrateur */}
               {formData.role === 'admin' && (
                 <div>
                   <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                     Type d'administrateur
                   </label>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                       <input
                         type="radio"
                         name="adminType"
                         value="admin"
                         checked={formData.adminType === 'admin'}
                         onChange={(e) => setFormData(prev => ({ ...prev, adminType: e.target.value as 'admin' | 'super_admin' }))}
                         style={{ color: '#FF7900' }}
                       />
                       <div>
                         <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Administrateur</div>
                         <div style={{ fontSize: '12px', color: '#6b7280' }}>Accès administratif limité</div>
                       </div>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                       <input
                         type="radio"
                         name="adminType"
                         value="super_admin"
                         checked={formData.adminType === 'super_admin'}
                         onChange={(e) => setFormData(prev => ({ ...prev, adminType: e.target.value as 'admin' | 'super_admin' }))}
                         style={{ color: '#FF7900' }}
                       />
                       <div>
                         <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Super Administrateur</div>
                         <div style={{ fontSize: '12px', color: '#6b7280' }}>Accès complet à toutes les fonctionnalités</div>
                       </div>
                     </label>
                   </div>
                 </div>
               )}

               {/* Email du chef directeur pour commercial */}
               {formData.role === 'commercial' && (
                 <div>
                   <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                     Email du chef directeur
                   </label>
                   <input
                     type="email"
                     value={formData.managerEmail}
                     onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                     style={{
                       width: '100%',
                       padding: '8px 12px',
                       border: '1px solid #d1d5db',
                       borderRadius: '6px',
                       fontSize: '14px'
                     }}
                     placeholder="directeur@orange.com"
                   />
                 </div>
               )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              {/* Actions dangereuses */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fde68a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                >
                  <Key size={16} />
                  Réinitialiser mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                >
                  <AlertTriangle size={16} />
                  Supprimer
                </button>
              </div>

              {/* Actions principales */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#FF7900',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e66d00'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF7900'}
                >
                  <CheckCircle size={16} />
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#dc2626' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Confirmer la suppression
              </h3>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.name}</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de réinitialisation */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Key size={24} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Réinitialiser le mot de passe
              </h3>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Êtes-vous sûr de vouloir réinitialiser le mot de passe de <strong>{user.name}</strong> ? Un nouveau mot de passe temporaire sera généré.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleResetPassword}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEditModal;
