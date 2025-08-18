import React from 'react';
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface SLAFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  slaLevel: string;
  requests: any[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
  formatDate: (dateString: string) => string;
  calculateSLA: (request: any) => any;
}

const SLAFilterModal: React.FC<SLAFilterModalProps> = ({
  isOpen,
  onClose,
  slaLevel,
  requests,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  formatDate,
  calculateSLA
}) => {
  if (!isOpen) return null;

  const getSLAIcon = (level: string) => {
    switch (level) {
      case 'good':
        return <CheckCircle size={20} style={{ color: '#059669' }} />;
      case 'warning':
        return <AlertCircle size={20} style={{ color: '#d97706' }} />;
      case 'critical':
        return <XCircle size={20} style={{ color: '#dc2626' }} />;
      default:
        return <CheckCircle size={20} style={{ color: '#059669' }} />;
    }
  };

  const getSLATitle = (level: string) => {
    switch (level) {
      case 'good':
        return 'Demandes en bon état SLA (0-7 jours)';
      case 'warning':
        return 'Demandes en avertissement SLA (8-14 jours)';
      case 'critical':
        return 'Demandes critiques SLA (>14 jours)';
      default:
        return 'Demandes filtrées par SLA';
    }
  };

  const getSLABackground = (level: string) => {
    switch (level) {
      case 'good':
        return '#f0fdf4';
      case 'warning':
        return '#fffbeb';
      case 'critical':
        return '#fef2f2';
      default:
        return '#f9fafb';
    }
  };

  const getSLABorder = (level: string) => {
    switch (level) {
      case 'good':
        return '#bbf7d0';
      case 'warning':
        return '#fed7aa';
      case 'critical':
        return '#fecaca';
      default:
        return '#e5e7eb';
    }
  };

  const filteredRequests = requests.filter(request => {
    const slaData = calculateSLA(request);
    return slaData.level === slaLevel;
  });

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
          maxWidth: '900px',
          width: '100%',
          maxHeight: '80vh',
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
          backgroundColor: getSLABackground(slaLevel),
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottom: `2px solid ${getSLABorder(slaLevel)}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {getSLAIcon(slaLevel)}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {getSLATitle(slaLevel)}
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} trouvée{filteredRequests.length > 1 ? 's' : ''}
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
          {filteredRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '16px', margin: 0 }}>Aucune demande trouvée pour ce niveau SLA.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRequests.map((request) => {
                const slaData = calculateSLA(request);
                return (
                  <div key={request.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      {/* SLA Status */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: slaLevel === 'good' ? '#d1fae5' :
                                       slaLevel === 'warning' ? '#fef3c7' : '#fee2e2',
                        border: '1px solid',
                        borderColor: slaLevel === 'good' ? '#a7f3d0' :
                                    slaLevel === 'warning' ? '#fde68a' : '#fecaca'
                      }}>
                        {getSLAIcon(slaLevel)}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: slaLevel === 'good' ? '#065f46' :
                                 slaLevel === 'warning' ? '#92400e' : '#991b1b'
                        }}>
                          {slaData.percentage}%
                        </span>
                      </div>

                      {/* Client Info */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                          {request.clientName}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                          Créée le {formatDate(request.submittedDate)}
                        </p>
                      </div>

                      {/* Status and Priority */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: '1px solid',
                          color: getStatusColor(request.status).color || '#6b7280',
                          backgroundColor: getStatusColor(request.status).backgroundColor || '#f3f4f6',
                          borderColor: getStatusColor(request.status).borderColor || '#d1d5db'
                        }}>
                          {getStatusLabel(request.status)}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: '1px solid',
                          color: getPriorityColor(request.priority).color || '#6b7280',
                          backgroundColor: getPriorityColor(request.priority).backgroundColor || '#f3f4f6',
                          borderColor: getPriorityColor(request.priority).borderColor || '#d1d5db'
                        }}>
                          {getPriorityLabel(request.priority)}
                        </span>
                      </div>
                    </div>

                    {/* Days Elapsed */}
                    <div style={{
                      textAlign: 'right',
                      minWidth: '80px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: slaLevel === 'good' ? '#059669' :
                               slaLevel === 'warning' ? '#d97706' : '#dc2626',
                        margin: 0
                      }}>
                        {slaData.daysElapsed} jours
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        écoulés
                      </p>
                    </div>
                  </div>
                );
              })}
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

export default SLAFilterModal;
