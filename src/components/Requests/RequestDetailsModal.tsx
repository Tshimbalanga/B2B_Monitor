import React from 'react';
import { X, User, Calendar, MapPin, FileText, Shield, Handshake, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RequestDetailsModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  calculateSLA: (request: any) => any;
  getSLAColor: (slaData: any) => string;
  getSLALabel: (slaData: any) => string;
  getSLAProgressColor: (slaData: any) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
  formatDate: (dateString: string) => string;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  calculateSLA,
  getSLAColor,
  getSLALabel,
  getSLAProgressColor,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  formatDate
}) => {
  // Debug logs
  console.log('RequestDetailsModal render:', { isOpen, request: request?.id });
  
  if (!isOpen || !request) {
    console.log('Modal not rendering - conditions not met');
    return null;
  }

  const slaData = calculateSLA(request);

  // Fermer la modal avec la touche Escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Version simplifiée pour tester
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
           maxWidth: '800px',
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
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Détails de la demande
            </h2>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
              Client: {request.clientName}
            </p>
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
          {/* Informations générales */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Informations générales
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} style={{ color: '#9ca3af' }} />
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Demandeur</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{request.submittedBy}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} style={{ color: '#9ca3af' }} />
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Date de création</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{formatDate(request.submittedDate)}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} style={{ color: '#9ca3af' }} />
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Date de livraison</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>
                    {request.deliveryDate ? formatDate(request.deliveryDate) : 'Non définie'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} style={{ color: '#9ca3af' }} />
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Localisation</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{request.location}</p>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                backgroundColor: '#f3f4f6'
              }}>
                {getStatusLabel(request.status)}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                backgroundColor: '#f3f4f6'
              }}>
                {getPriorityLabel(request.priority)}
              </span>
            </div>
            
            {/* Bon de commande */}
            {request.purchaseOrder && (
              <div style={{ 
                backgroundColor: '#fef3c7', 
                border: '1px solid #f59e0b', 
                borderRadius: '8px', 
                padding: '12px', 
                marginTop: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} style={{ color: '#d97706' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontWeight: '600' }}>
                      Bon de commande
                    </p>
                    <p style={{ fontSize: '16px', color: '#92400e', margin: '4px 0 0 0', fontWeight: '700' }}>
                      {request.purchaseOrder}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description de la demande */}
          {request.description && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Description de la demande
              </h3>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #bfdbfe' }}>
                <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>{request.description}</p>
              </div>
            </div>
          )}

          {/* SLA */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Progression SLA
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span style={{
                   display: 'inline-flex',
                   alignItems: 'center',
                   padding: '4px 12px',
                   borderRadius: '9999px',
                   fontSize: '14px',
                   fontWeight: '500',
                   border: '1px solid #d1d5db',
                   color: '#6b7280',
                   backgroundColor: '#f3f4f6'
                 }}>
                   {getSLALabel(slaData)}
                 </span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  {slaData.percentage}%
                </span>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '12px' }}>
                <div 
                                     style={{
                     height: '12px',
                     borderRadius: '9999px',
                     transition: 'all 0.3s',
                     width: `${Math.min(slaData.percentage, 100)}%`,
                     backgroundColor: '#3b82f6'
                   }}
                ></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#f87171', borderRadius: '50%' }}></div>
                  <span>7 jours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#fbbf24', borderRadius: '50%' }}></div>
                  <span>14 jours</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              <span>{slaData.daysElapsed} jours écoulés</span>
              <span>14 jours SLA</span>
            </div>
          </div>

          {/* Validation de la demande */}
          {request.validationSteps && request.validationSteps.length > 0 && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Validation de la demande
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {request.validationSteps.map((step: any, index: number) => (
                  <div key={step.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: step.status === 'approved' ? '#d1fae5' :
                                       step.status === 'rejected' ? '#fee2e2' : '#dbeafe'
                      }}>
                        {step.status === 'approved' ? (
                          <CheckCircle size={16} style={{ color: '#059669' }} />
                        ) : step.status === 'rejected' ? (
                          <XCircle size={16} style={{ color: '#dc2626' }} />
                        ) : (
                          <Clock size={16} style={{ color: '#2563eb' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{step.title}</p>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{step.role}</p>
                        {step.validatedBy && (
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            Validé par: {step.validatedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: step.status === 'approved' ? '#065f46' :
                             step.status === 'rejected' ? '#991b1b' : '#1e40af',
                      backgroundColor: step.status === 'approved' ? '#d1fae5' :
                                      step.status === 'rejected' ? '#fee2e2' : '#dbeafe',
                      border: '1px solid',
                      borderColor: step.status === 'approved' ? '#a7f3d0' :
                                  step.status === 'rejected' ? '#fecaca' : '#bfdbfe'
                    }}>
                      {step.status === 'approved' ? 'Approuvé' :
                       step.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Handover */}
          {request.handoverSteps && request.handoverSteps.length > 0 && (
            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Validation Handover
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {request.handoverSteps.map((step: any, index: number) => (
                  <div key={step.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd6fe',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: step.status === 'approved' ? '#d1fae5' :
                                       step.status === 'rejected' ? '#fee2e2' : '#f3e8ff'
                      }}>
                        {step.status === 'approved' ? (
                          <CheckCircle size={16} style={{ color: '#059669' }} />
                        ) : step.status === 'rejected' ? (
                          <XCircle size={16} style={{ color: '#dc2626' }} />
                        ) : (
                          <Clock size={16} style={{ color: '#7c3aed' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{step.title}</p>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{step.role}</p>
                        {step.validatedBy && (
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            Validé par: {step.validatedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: step.status === 'approved' ? '#065f46' :
                             step.status === 'rejected' ? '#991b1b' : '#5b21b6',
                      backgroundColor: step.status === 'approved' ? '#d1fae5' :
                                      step.status === 'rejected' ? '#fee2e2' : '#f3e8ff',
                      border: '1px solid',
                      borderColor: step.status === 'approved' ? '#a7f3d0' :
                                  step.status === 'rejected' ? '#fecaca' : '#ddd6fe'
                    }}>
                      {step.status === 'approved' ? 'Approuvé' :
                       step.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
