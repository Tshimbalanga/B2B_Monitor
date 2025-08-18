import React, { useState } from 'react';
import { X, PowerOff, CheckCircle, XCircle, AlertTriangle, Clock, User, Calendar } from 'lucide-react';

interface DeactivationValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  currentUser: any;
  onValidationUpdate: (requestId: string, validationData: any) => void;
  onConnectionDeactivation: (connectionId: string, deactivationData: any) => void;
}

const DeactivationValidationModal: React.FC<DeactivationValidationModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUser,
  onValidationUpdate,
  onConnectionDeactivation
}) => {
  const [comment, setComment] = useState('');
  const [routerDeactivationDate, setRouterDeactivationDate] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen || !request) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!comment.trim()) {
      newErrors.comment = 'Un commentaire est requis';
    }

    if (!routerDeactivationDate) {
      newErrors.routerDeactivationDate = 'La date de désactivation du routeur est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidation = (action: 'approve' | 'reject') => {
    if (!validateForm()) return;

    const validationData = {
      status: action === 'approve' ? 'deactivation_approved' : 'deactivation_rejected',
      lastDeactivationValidation: {
        action,
        comment,
        validatedBy: currentUser?.name || 'Utilisateur',
        validatedAt: new Date().toISOString(),
        routerDeactivationDate: action === 'approve' ? routerDeactivationDate : undefined
      },
      deactivationSteps: request.deactivationSteps?.map((step: any) => {
        if (step.role === currentUser?.role || currentUser?.role === 'admin') {
          return {
            ...step,
            status: action === 'approve' ? 'approved' : 'rejected',
            comment,
            validatedBy: currentUser?.name || 'Utilisateur',
            validatedAt: new Date().toISOString()
          };
        }
        return step;
      }) || []
    };

    // Si c'est une approbation et que toutes les validations sont faites
    if (action === 'approve') {
      const allStepsApproved = validationData.deactivationSteps.every((step: any) => 
        step.status === 'approved' || step.role !== currentUser?.role
      );

      if (allStepsApproved) {
        validationData.status = 'deactivation_in_progress';
        
        // Désactiver la connexion
        if (request.connectionId) {
          onConnectionDeactivation(request.connectionId, {
            status: 'deactivated',
            deactivationDate: new Date().toISOString(),
            deactivationReason: request.deactivationReason,
            routerDeactivationDate
          });
        }
      }
    }

    onValidationUpdate(request.id, validationData);
    onClose();
  };

  const getCurrentStep = () => {
    return request.deactivationSteps?.find((step: any) => 
      step.role === currentUser?.role && step.status === 'pending'
    );
  };

  const canValidate = () => {
    const currentStep = getCurrentStep();
    return currentStep && (currentUser?.role === currentStep.role || currentUser?.role === 'admin');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'approved': return '#059669';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'pending': return '#f3f4f6';
      case 'approved': return '#f0fdf4';
      case 'rejected': return '#fef2f2';
      default: return '#f3f4f6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
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
                Validation de Désactivation
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                {request.clientName} - {request.type}
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
          {/* Informations de la demande */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Détails de la demande
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Client</p>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>{request.clientName}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Raison</p>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>
                  {request.deactivationReason === 'client_request' && 'Demande du client'}
                  {request.deactivationReason === 'payment_issues' && 'Problèmes de paiement'}
                  {request.deactivationReason === 'contract_termination' && 'Fin de contrat'}
                  {request.deactivationReason === 'technical_issues' && 'Problèmes techniques'}
                  {request.deactivationReason === 'maintenance' && 'Maintenance préventive'}
                  {request.deactivationReason === 'upgrade' && 'Mise à niveau'}
                  {request.deactivationReason === 'other' && 'Autre'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Date souhaitée</p>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>
                  {new Date(request.deactivationDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Priorité</p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: request.priority === 'high' ? '#dc2626' : '#d97706',
                  backgroundColor: request.priority === 'high' ? '#fef2f2' : '#fffbeb',
                  border: '1px solid',
                  borderColor: request.priority === 'high' ? '#dc2626' : '#d97706'
                }}>
                  {request.priority === 'high' ? 'Élevée' : 'Moyenne'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Détails techniques</p>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>{request.technicalDetails}</p>
            </div>
          </div>

          {/* Étapes de validation */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Processus de validation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {request.deactivationSteps?.map((step: any, index: number) => (
                <div key={step.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: getStatusBackground(step.status),
                  border: '1px solid',
                  borderColor: getStatusColor(step.status),
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: getStatusColor(step.status)
                  }}>
                    {getStatusIcon(step.status)}
                    <span style={{ fontSize: '16px' }}>{step.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0 0 2px 0' }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {step.status === 'pending' && 'En attente de validation'}
                      {step.status === 'approved' && `Approuvé par ${step.validatedBy}`}
                      {step.status === 'rejected' && `Rejeté par ${step.validatedBy}`}
                    </p>
                  </div>
                  {step.status !== 'pending' && step.comment && (
                    <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                      "{step.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire de validation */}
          {canValidate() && (
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Votre validation
              </h3>
              
              {/* Date de désactivation du routeur */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Date de désactivation du routeur *
                </label>
                <input
                  type="date"
                  value={routerDeactivationDate}
                  onChange={(e) => setRouterDeactivationDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.routerDeactivationDate ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.routerDeactivationDate && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.routerDeactivationDate}</p>
                )}
              </div>

              {/* Commentaire */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Commentaire *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.comment ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Ajoutez votre commentaire de validation..."
                />
                {errors.comment && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.comment}</p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleValidation('reject')}
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
                  <XCircle size={16} />
                  Rejeter
                </button>
                <button
                  type="button"
                  onClick={() => handleValidation('approve')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  <CheckCircle size={16} />
                  Approuver
                </button>
              </div>
            </div>
          )}

          {/* Message si pas autorisé */}
          {!canValidate() && (
            <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#d97706' }} />
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                  Vous n'êtes pas autorisé à valider cette étape ou toutes les validations sont terminées.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeactivationValidationModal;




