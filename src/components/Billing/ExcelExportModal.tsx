import React, { useState } from 'react';
import { X, Download, Calendar, Users, FileSpreadsheet } from 'lucide-react';
import { dialogService } from '../../services/dialogService';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  onExport: (data: any[], filters: any) => void;
}

const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onExport
}) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    clientFilter: 'all', // 'all', 'specific'
    selectedClient: '',
    includeAttachments: true,
    includeNotes: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  // Obtenir la liste unique des clients
  const uniqueClients = Array.from(new Set(invoices.map(invoice => invoice.clientName))).sort();

  const validateFilters = () => {
    const newErrors: {[key: string]: string} = {};

    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      
      if (fromDate > toDate) {
        newErrors.dateRange = 'La date de début doit être antérieure à la date de fin';
      }
    }

    if (filters.clientFilter === 'specific' && !filters.selectedClient) {
      newErrors.selectedClient = 'Veuillez sélectionner un client';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filterInvoices = () => {
    let filteredInvoices = [...invoices];

    // Filtre par période
    if (filters.dateFrom) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        new Date(invoice.issueDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        new Date(invoice.issueDate) <= new Date(filters.dateTo)
      );
    }

    // Filtre par client
    if (filters.clientFilter === 'specific' && filters.selectedClient) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.clientName === filters.selectedClient
      );
    }

    return filteredInvoices;
  };

  const handleExport = () => {
    if (validateFilters()) {
      const filteredData = filterInvoices();
      
      if (filteredData.length === 0) {
        dialogService.warning('Aucune Facture', 'Aucune facture trouvée avec les critères sélectionnés.');
        return;
      }

      onExport(filteredData, filters);
      onClose();
    }
  };

  const getExportSummary = () => {
    const filteredData = filterInvoices();
    const totalAmount = filteredData.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidAmount = filteredData.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = filteredData.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

    return {
      count: filteredData.length,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  };

  const summary = getExportSummary();

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
            <FileSpreadsheet size={24} style={{ color: '#059669' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Export Excel
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Exporter les factures en format Excel
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
          {/* Filtres de période */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#6b7280' }} />
              Période d'export
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            {errors.dateRange && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.dateRange}</p>
            )}
            
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
              Laissez vide pour inclure toutes les dates
            </p>
          </div>

          {/* Filtres de client */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: '#6b7280' }} />
              Sélection des clients
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="radio"
                  id="all-clients"
                  name="clientFilter"
                  value="all"
                  checked={filters.clientFilter === 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, clientFilter: e.target.value }))}
                  style={{ margin: 0 }}
                />
                <label htmlFor="all-clients" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                  Tous les clients
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="radio"
                  id="specific-client"
                  name="clientFilter"
                  value="specific"
                  checked={filters.clientFilter === 'specific'}
                  onChange={(e) => setFilters(prev => ({ ...prev, clientFilter: e.target.value }))}
                  style={{ margin: 0 }}
                />
                <label htmlFor="specific-client" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                  Client spécifique
                </label>
              </div>
              
              {filters.clientFilter === 'specific' && (
                <div style={{ marginLeft: '24px' }}>
                  <select
                    value={filters.selectedClient}
                    onChange={(e) => setFilters(prev => ({ ...prev, selectedClient: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${errors.selectedClient ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner un client</option>
                    {uniqueClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                  {errors.selectedClient && (
                    <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.selectedClient}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Options d'export */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Options d'export
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="include-attachments"
                  checked={filters.includeAttachments}
                  onChange={(e) => setFilters(prev => ({ ...prev, includeAttachments: e.target.checked }))}
                  style={{ margin: 0 }}
                />
                <label htmlFor="include-attachments" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                  Inclure les informations sur les pièces jointes
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="include-notes"
                  checked={filters.includeNotes}
                  onChange={(e) => setFilters(prev => ({ ...prev, includeNotes: e.target.checked }))}
                  style={{ margin: 0 }}
                />
                <label htmlFor="include-notes" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                  Inclure les notes additionnelles
                </label>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#065f46', margin: '0 0 12px 0' }}>
              Résumé de l'export
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0' }}>
                  Nombre de factures: <strong>{summary.count}</strong>
                </p>
                <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0' }}>
                  Montant total: <strong>${summary.totalAmount.toFixed(2)}</strong>
                </p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0' }}>
                  Montant payé: <strong>${summary.paidAmount.toFixed(2)}</strong>
                </p>
                <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0' }}>
                  Montant en attente: <strong>${summary.pendingAmount.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
              type="button"
              onClick={handleExport}
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Download size={16} />
              Exporter en Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExportModal;




