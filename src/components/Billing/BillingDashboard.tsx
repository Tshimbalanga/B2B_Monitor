import React, { useState } from 'react';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Paperclip,
  FileSpreadsheet,
  X
} from 'lucide-react';
import BillingForm from './BillingForm';
import ExcelExportModal from './ExcelExportModal';
import { exportToExcel, exportDetailedReport } from '../../utils/excelExport';
import { dialogService } from '../../services/dialogService';

interface Invoice {
  id: string;
  clientName: string;
  connectionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: string;
  period: string;
  attachments?: File[];
}

interface BillingDashboardProps {}

export const BillingDashboard: React.FC<BillingDashboardProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [showExcelExportModal, setShowExcelExportModal] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Mock data pour les factures
  const mockInvoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      clientName: 'TechCorp Solutions',
      connectionId: 'CONN-001',
      amount: 2500.00,
      status: 'paid',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      period: 'Décembre 2024'
    },
    {
      id: 'INV-2024-002',
      clientName: 'Global Industries',
      connectionId: 'CONN-002',
      amount: 1800.00,
      status: 'pending',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      period: 'Décembre 2024'
    },
    {
      id: 'INV-2024-003',
      clientName: 'DataFlow Corp',
      connectionId: 'CONN-003',
      amount: 3200.00,
      status: 'overdue',
      issueDate: '2024-11-01',
      dueDate: '2024-11-30',
      period: 'Novembre 2024'
    }
  ];

  // Combiner les factures mock avec les nouvelles factures
  const allInvoices = [...mockInvoices, ...invoices];

  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      paid: 'text-green-700 bg-green-50 border-green-200',
      pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      overdue: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      paid: 'Payée',
      pending: 'En attente',
      overdue: 'En retard',
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Fonction pour afficher les détails d'une facture
  const handleViewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  // Fonction pour fermer le modal des détails
  const handleCloseInvoiceDetails = () => {
    setShowInvoiceDetails(false);
    setSelectedInvoice(null);
  };

  // Fonction pour télécharger une facture
  const handleDownloadInvoice = (invoice: Invoice) => {
    // Créer le contenu de la facture en PDF/HTML
    const invoiceContent = generateInvoiceContent(invoice);
    
    // Créer un blob avec le contenu
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_${invoice.id}_${invoice.clientName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url);
    
    console.log(`📄 Facture ${invoice.id} téléchargée pour ${invoice.clientName}`);
  };

  // Fonction pour télécharger toutes les factures filtrées
  const handleDownloadAllInvoices = () => {
    if (filteredInvoices.length === 0) {
      dialogService.warning('Aucune Facture', 'Aucune facture à télécharger');
      return;
    }

    // Télécharger chaque facture individuellement
    filteredInvoices.forEach((invoice, index) => {
      setTimeout(() => {
        handleDownloadInvoice(invoice);
      }, index * 500); // Délai de 500ms entre chaque téléchargement
    });

    console.log(`📦 ${filteredInvoices.length} factures en cours de téléchargement`);
  };

  // Fonction pour générer le contenu HTML de la facture
  const generateInvoiceContent = (invoice: Invoice) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoice.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .client-info { margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background-color: #f8f9fa; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; color: #666; }
        .status-paid { color: #28a745; }
        .status-pending { color: #ffc107; }
        .status-overdue { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FACTURE</h1>
        <h2>Orange Business Services</h2>
        <p>Services de connectivité B2B</p>
    </div>

    <div class="invoice-info">
        <div>
            <strong>Facture N°:</strong> ${invoice.id}<br>
            <strong>Date d'émission:</strong> ${formatDate(invoice.issueDate)}<br>
            <strong>Échéance:</strong> ${formatDate(invoice.dueDate)}
        </div>
        <div>
            <strong>Période:</strong> ${invoice.period}<br>
            <strong>Connexion:</strong> ${invoice.connectionId}<br>
            <strong>Statut:</strong> <span class="status-${invoice.status}">${getStatusLabel(invoice.status)}</span>
        </div>
    </div>

    <div class="client-info">
        <h3>Client</h3>
        <strong>${invoice.clientName}</strong><br>
        <p>Services de connectivité B2B</p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Période</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Services de connectivité B2B</td>
                <td>${invoice.period}</td>
                <td>${formatCurrency(invoice.amount)}</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        <strong>Total: ${formatCurrency(invoice.amount)}</strong>
    </div>

    <div class="footer">
        <p>Merci pour votre confiance</p>
        <p>Orange Business Services - République Démocratique du Congo</p>
        <p>Généré le ${currentDate}</p>
    </div>
</body>
</html>`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculs des métriques
  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = allInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = allInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = allInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const metrics = [
    {
      title: 'Chiffre d\'affaires total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12%',
    },
    {
      title: 'Factures payées',
      value: formatCurrency(paidAmount),
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+8%',
    },
    {
      title: 'En attente de paiement',
      value: formatCurrency(pendingAmount),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '-5%',
    },
    {
      title: 'Factures en retard',
      value: formatCurrency(overdueAmount),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '+15%',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Gestion de la Facturation</h2>
            <p className="text-gray-600 mt-1">Suivi des factures et revenus clients</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowBillingForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
            >
              <FileText size={18} />
              <span>Nouvelle Facture</span>
            </button>
            <button
              onClick={() => setShowExcelExportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet size={18} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon size={24} className={metric.color} />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">{metric.trend}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 text-sm">{metric.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client ou numéro de facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = getStatusIcon(invoice.status);
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-orange-50 p-2 rounded-lg mr-3">
                          <FileText size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">{invoice.id}</div>
                          <div className="text-sm text-gray-500">{invoice.connectionId}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{invoice.clientName}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-black">{formatCurrency(invoice.amount)}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.period}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusIcon size={16} className={invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'} />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {invoice.attachments && invoice.attachments.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title={`${invoice.attachments.length} pièce(s) jointe(s)`}>
                            <Paperclip size={12} className="mr-1" />
                            {invoice.attachments.length}
                          </span>
                        )}
                        <button 
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded" 
                          title="Télécharger la facture"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewInvoiceDetails(invoice)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded" 
                          title="Voir détails"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Form Modal */}
      <BillingForm
        isOpen={showBillingForm}
        onClose={() => setShowBillingForm(false)}
        onSubmit={(billingData) => {
          // Convertir les données du formulaire en format Invoice
          const newInvoice: Invoice = {
            id: billingData.invoiceNumber,
            clientName: billingData.clientName,
            connectionId: `CONN-${Date.now()}`,
            amount: billingData.total,
            status: 'pending',
            issueDate: billingData.invoiceDate,
            dueDate: billingData.dueDate,
            period: new Date(billingData.invoiceDate).toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric'
            }),
            attachments: billingData.attachments
          };
          
          setInvoices(prev => [...prev, newInvoice]);
          setShowBillingForm(false);
        }}
      />

      {/* Excel Export Modal */}
      <ExcelExportModal
        isOpen={showExcelExportModal}
        onClose={() => setShowExcelExportModal(false)}
        invoices={allInvoices}
        onExport={(data, filters) => {
          // Exporter en Excel
          exportToExcel(data, filters);
          
          // Optionnel : Exporter aussi le rapport détaillé
          if (confirm('Voulez-vous également télécharger un rapport détaillé ?')) {
            exportDetailedReport(data, filters);
          }
        }}
      />

      {/* Modal de visualisation des détails de facture */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails de la Facture</h2>
                  <p className="text-sm text-gray-600">{selectedInvoice.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseInvoiceDetails}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Informations de la facture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations de la Facture</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro:</span>
                      <span className="font-medium">{selectedInvoice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date d'émission:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Échéance:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Période:</span>
                      <span className="font-medium">{selectedInvoice.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connexion:</span>
                      <span className="font-medium">{selectedInvoice.connectionId}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations Client</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium">{selectedInvoice.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant:</span>
                      <span className="font-bold text-lg text-green-600">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedInvoice.status)}`}>
                        {getStatusLabel(selectedInvoice.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails des services */}
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Détails des Services</h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Période</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">Services de connectivité B2B</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{selectedInvoice.period}</td>
                        <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(selectedInvoice.amount)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">Total:</td>
                        <td className="px-4 py-3 text-lg font-bold text-green-600 text-right">{formatCurrency(selectedInvoice.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Pièces jointes */}
              {selectedInvoice.attachments && selectedInvoice.attachments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Paperclip size={16} className="mr-2" />
                    Pièces Jointes ({selectedInvoice.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedInvoice.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Télécharger Facture</span>
                </button>
                <button
                  onClick={handleCloseInvoiceDetails}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};