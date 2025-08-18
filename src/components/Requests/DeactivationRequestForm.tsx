import React, { useState } from 'react';
import { X, PowerOff, AlertTriangle, Calendar, FileText, Building } from 'lucide-react';
import { Connection } from '../../types';

interface DeactivationRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
  connections: Connection[];
  currentUser: any;
}

const DeactivationRequestForm: React.FC<DeactivationRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  connections,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    connectionId: '',
    deactivationReason: '',
    deactivationDate: '',
    technicalDetails: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  // Filtrer les connexions actives
  const activeConnections = connections.filter(conn => 
    conn.status === 'active' || conn.status === 'suspended'
  );

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.connectionId) {
      newErrors.connectionId = 'Veuillez sélectionner une liaison';
    }

    if (!formData.deactivationReason.trim()) {
      newErrors.deactivationReason = 'La raison de désactivation est requise';
    }

    if (!formData.deactivationDate) {
      newErrors.deactivationDate = 'La date de désactivation est requise';
    }

    if (!formData.technicalDetails.trim()) {
      newErrors.technicalDetails = 'Les détails techniques sont requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const selectedConnection = connections.find(conn => conn.id === formData.connectionId);
      
      const requestData = {
        ...formData,
        clientName: selectedConnection?.clientName || '',
        clientEmail: selectedConnection?.clientId || '',
        location: selectedConnection?.location || '',
        capacity: selectedConnection?.capacity || '',
        type: 'deactivation' as const,
        status: 'deactivation_requested' as const,
        submittedBy: currentUser?.name || 'Utilisateur',
        submittedDate: new Date().toISOString(),
        description: `Demande de désactivation de la liaison ${selectedConnection?.clientName} - ${selectedConnection?.type}`,
        expectedSLA: '7 jours',
        deactivationSteps: [
          {
            id: 'maintenance_validation',
            title: 'Validation Maintenance',
            role: 'maintenance',
            status: 'pending',
            requiredRoles: ['maintenance', 'admin'],
            icon: '🔧',
            color: '#d97706'
          },
          {
            id: 'project_validation',
            title: 'Validation Projet',
            role: 'project',
            status: 'pending',
            requiredRoles: ['project', 'admin'],
            icon: '📋',
            color: '#059669'
          }
        ]
      };

      onSubmit(requestData);
      onClose();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#6b7280';
      case 'medium': return '#d97706';
      case 'high': return '#dc2626';
      case 'urgent': return '#7c2d12';
      default: return '#6b7280';
    }
  };

  const getPriorityBackground = (priority: string) => {
    switch (priority) {
      case 'low': return '#f3f4f6';
      case 'medium': return '#fffbeb';
      case 'high': return '#fef2f2';
      case 'urgent': return '#fef2f2';
      default: return '#f3f4f6';
    }
  };

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
          maxWidth: '700px',
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
          backgroundColor: '#fef2f2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PowerOff size={24} style={{ color: '#dc2626' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Demande de Désactivation
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Désactiver une liaison existante
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
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
                             {/* Sélection de la liaison */}
               <div>
                 <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                   Liaison à désactiver *
                 </label>
                 <select
                   value={formData.connectionId}
                   onChange={(e) => setFormData(prev => ({ ...prev, connectionId: e.target.value }))}
                   style={{
                     width: '100%',
                     padding: '8px 12px',
                     border: `1px solid ${errors.connectionId ? '#dc2626' : '#d1d5db'}`,
                     borderRadius: '6px',
                     fontSize: '14px'
                   }}
                 >
                   <option value="">Sélectionner une liaison</option>
                   {activeConnections.map(connection => (
                     <option key={connection.id} value={connection.id}>
                       {connection.clientName} - {connection.type.toUpperCase()} - {connection.location} ({connection.status})
                     </option>
                   ))}
                 </select>
                 {errors.connectionId && (
                   <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.connectionId}</p>
                 )}
                 {activeConnections.length === 0 && (
                   <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>
                     Aucune liaison active disponible pour la désactivation
                   </p>
                 )}
               </div>

               {/* Affichage du client sélectionné */}
               {formData.connectionId && (
                 <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '16px', border: '1px solid #0ea5e9' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                     <User size={16} style={{ color: '#0ea5e9' }} />
                     <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', margin: 0 }}>
                       Client sélectionné
                     </h4>
                   </div>
                   {(() => {
                     const selectedConnection = connections.find(conn => conn.id === formData.connectionId);
                     return selectedConnection ? (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                         <div>
                           <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0 0 2px 0' }}>Nom du client</p>
                           <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                             {selectedConnection.clientName}
                           </p>
                         </div>
                         <div>
                           <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0 0 2px 0' }}>Type de liaison</p>
                           <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                             {selectedConnection.type.toUpperCase()}
                           </p>
                         </div>
                         <div>
                           <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0 0 2px 0' }}>Localisation</p>
                           <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                             {selectedConnection.location}
                           </p>
                         </div>
                         <div>
                           <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0 0 2px 0' }}>Capacité</p>
                           <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                             {selectedConnection.capacity}
                           </p>
                         </div>
                       </div>
                     ) : null;
                   })()}
                 </div>
               )}

              {/* Raison de désactivation */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Raison de la désactivation *
                </label>
                <select
                  value={formData.deactivationReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, deactivationReason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.deactivationReason ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="client_request">Demande du client</option>
                  <option value="payment_issues">Problèmes de paiement</option>
                  <option value="contract_termination">Fin de contrat</option>
                  <option value="technical_issues">Problèmes techniques</option>
                  <option value="maintenance">Maintenance préventive</option>
                  <option value="upgrade">Mise à niveau</option>
                  <option value="other">Autre</option>
                </select>
                {errors.deactivationReason && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.deactivationReason}</p>
                )}
              </div>

              {/* Date de désactivation */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Date souhaitée de désactivation *
                </label>
                <input
                  type="date"
                  value={formData.deactivationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deactivationDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.deactivationDate ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deactivationDate && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.deactivationDate}</p>
                )}
              </div>

              {/* Priorité */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Priorité
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['low', 'medium', 'high', 'urgent'].map(priority => (
                    <label key={priority} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        style={{ margin: 0 }}
                      />
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: getPriorityColor(priority),
                        backgroundColor: getPriorityBackground(priority),
                        border: '1px solid',
                        borderColor: getPriorityColor(priority)
                      }}>
                        {priority === 'low' && 'Faible'}
                        {priority === 'medium' && 'Moyenne'}
                        {priority === 'high' && 'Élevée'}
                        {priority === 'urgent' && 'Urgente'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Détails techniques */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Détails techniques et instructions *
                </label>
                <textarea
                  value={formData.technicalDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalDetails: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.technicalDetails ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Décrivez les détails techniques, les équipements concernés, les précautions à prendre..."
                />
                {errors.technicalDetails && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.technicalDetails}</p>
                )}
              </div>

              {/* Informations sur le processus */}
              <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: '#d97706' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                    Processus de validation
                  </h4>
                </div>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                  Cette demande nécessitera l'approbation de l'équipe Maintenance et de l'équipe Projet avant la désactivation effective de la liaison.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
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
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                <PowerOff size={16} />
                Soumettre la demande
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeactivationRequestForm;
