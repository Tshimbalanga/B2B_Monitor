import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Activity,
  X,
  Calendar,
  User,
  Mail
} from 'lucide-react';
import { SparePart, SparePartTransaction, SparePartLocation, mockSpareParts, mockSparePartTransactions, mockSparePartLocations } from '../../data/mockData';
import { dialogService } from '../../services/dialogService';

interface SparePartsManagementProps {
  currentUser: any;
}

export const SparePartsManagement: React.FC<SparePartsManagementProps> = ({
  currentUser
}) => {


  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'transactions' | 'requests'>('dashboard');
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [transactions, setTransactions] = useState<SparePartTransaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SparePartTransaction | null>(null);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [showEditPartModal, setShowEditPartModal] = useState(false);
  const [showPartDetailsModal, setShowPartDetailsModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  
  // États pour les demandes de transaction
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours en arrière
    endDate: new Date().toISOString().split('T')[0]
  });
  


  const [newTransactionForm, setNewTransactionForm] = useState({
    sparePartId: '',
    type: 'out' as 'in' | 'out',
    quantity: 1,
    reason: '',
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa'
    },
    comments: ''
  });

  const [newRequestForm, setNewRequestForm] = useState({
    sparePartId: '',
    type: 'out' as 'in' | 'out',
    quantity: 1,
    reason: '',
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa'
    },
    comments: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    expectedDeliveryDate: ''
  });

  // Charger les données mock
  useEffect(() => {
    try {
      setSpareParts(mockSpareParts);
      setTransactions(mockSparePartTransactions);
    } catch (error) {
      console.error('SparePartsManagement - Error loading data:', error);
    }
  }, []);

  // Statistiques simples
  const totalParts = spareParts.length;
  const lowStockParts = spareParts.filter(part => part.status === 'low_stock').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  
  // Statistiques pour aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.requestDate.split('T')[0] === today);
  const todayIn = todayTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.quantity, 0);
  const todayOut = todayTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.quantity, 0);
  const totalRemainingStock = spareParts.reduce((sum, part) => sum + part.currentStock, 0);

  // Vérifier les permissions
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const canModifyStock = isAdmin;
  const canCreateTransactions = true; // Tous les utilisateurs peuvent créer des transactions





  // Fonctions pour gérer les transactions
  const handleNewTransaction = () => {
    setShowTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setNewTransactionForm({
      sparePartId: '',
      type: 'out',
      quantity: 1,
      reason: '',
      location: { region: 'Kinshasa', city: 'Kinshasa' },
      comments: ''
    });
  };

  const handleTransactionSubmit = () => {
    const selectedPart = spareParts.find(p => p.id === newTransactionForm.sparePartId);
    if (!selectedPart) return;

    // Toutes les transactions nécessitent une validation du manager
    const newTransaction: SparePartTransaction = {
      id: `TR-${Date.now()}`,
      sparePartId: newTransactionForm.sparePartId,
      sparePartName: selectedPart.name,
      type: newTransactionForm.type,
      quantity: newTransactionForm.quantity,
      requester: currentUser?.name || 'Utilisateur',
      requesterRole: currentUser?.role || 'user',
      requesterManager: currentUser?.managerEmail || '',
      reason: newTransactionForm.reason,
      location: newTransactionForm.location,
      status: 'pending', // Toutes les transactions commencent en attente
      requestDate: new Date().toISOString(),
      comments: newTransactionForm.comments
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simuler l'envoi d'une notification au manager
    const managerEmail = currentUser?.managerEmail || 'manager@orange.com';
    console.log(`📧 Notification envoyée à ${managerEmail} pour validation de la transaction ${newTransaction.id}`);
    
    // Afficher une alerte pour informer l'utilisateur
    dialogService.success('Transaction Soumise', `Transaction soumise avec succès ! Une demande de validation a été envoyée à votre manager (${managerEmail}).`);
    
    handleCloseTransactionModal();
  };

  const handleViewTransaction = (transaction: SparePartTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailsModal(true);
  };

  const handleCloseTransactionDetailsModal = () => {
    setShowTransactionDetailsModal(false);
    setSelectedTransaction(null);
  };

  const handleApproveTransaction = (transactionId: string) => {
    setTransactions(prev => {
      const updatedTransactions = prev.map(t => {
        if (t.id === transactionId) {
          // Mettre à jour le stock selon le type de transaction
          setSpareParts(prevParts => prevParts.map(p => {
            if (p.id === t.sparePartId) {
              if (t.type === 'in') {
                // Pour les entrées : augmenter le stock
                return { ...p, currentStock: p.currentStock + t.quantity };
              } else if (t.type === 'out') {
                // Pour les sorties : diminuer le stock
                return { ...p, currentStock: Math.max(0, p.currentStock - t.quantity) };
              }
            }
            return p;
          }));
          
          return {
            ...t, 
            status: 'approved', 
            approvalDate: new Date().toISOString(), 
            approvedBy: currentUser?.name, 
            approvedByRole: currentUser?.role
          };
        }
        return t;
      });
      
      return updatedTransactions;
    });
  };

  const handleRejectTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'rejected', approvalDate: new Date().toISOString(), approvedBy: currentUser?.name, approvedByRole: currentUser?.role }
        : t
    ));
  };

  const handleCompleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'completed', completionDate: new Date().toISOString() }
        : t
    ));
  };

  // Fonctions pour les demandes de transaction
  const handleNewRequest = () => {
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setNewRequestForm({
      sparePartId: '',
      type: 'out',
      quantity: 1,
      reason: '',
      location: { region: 'Kinshasa', city: 'Kinshasa' },
      comments: '',
      urgency: 'normal',
      expectedDeliveryDate: ''
    });
  };

  const handleRequestSubmit = () => {
    const selectedPart = spareParts.find(p => p.id === newRequestForm.sparePartId);
    if (!selectedPart) return;

    const newRequest: SparePartTransaction = {
      id: `REQ-${Date.now()}`,
      sparePartId: newRequestForm.sparePartId,
      sparePartName: selectedPart.name,
      type: newRequestForm.type,
      quantity: newRequestForm.quantity,
      requester: currentUser?.name || 'Utilisateur',
      requesterRole: currentUser?.role || 'user',
      requesterManager: currentUser?.managerEmail || '',
      reason: newRequestForm.reason,
      location: newRequestForm.location,
      status: 'pending',
      requestDate: new Date().toISOString(),
      comments: newRequestForm.comments,
      urgency: newRequestForm.urgency,
      expectedDeliveryDate: newRequestForm.expectedDeliveryDate
    };

    setTransactions(prev => [newRequest, ...prev]);
    
    // Simuler l'envoi d'une notification au manager
    const managerEmail = currentUser?.managerEmail || 'manager@orange.com';
    console.log(`📧 Demande de transaction envoyée à ${managerEmail} pour validation`);
    
    dialogService.success('Demande Soumise', `Demande de transaction soumise avec succès ! Une notification a été envoyée à votre manager (${managerEmail}).`);
    
    handleCloseRequestModal();
  };

  // Fonction d'export Excel
  const handleExportExcel = () => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.requestDate);
      const startDate = new Date(exportDateRange.startDate);
      const endDate = new Date(exportDateRange.endDate);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Créer le contenu CSV
    const headers = [
      'ID Transaction',
      'Équipement',
      'Type',
      'Quantité',
      'Demandeur',
      'Rôle Demandeur',
      'Manager',
      'Raison',
      'Localisation',
      'Statut',
      'Date Demande',
      'Date Validation',
      'Validé Par',
      'Rôle Validateur',
      'Date Complétion',
      'Commentaires',
      'Urgence',
      'Date Livraison Prévue'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.id,
        `"${t.sparePartName}"`,
        t.type,
        t.quantity,
        `"${t.requester}"`,
        `"${t.requesterRole}"`,
        `"${t.requesterManager}"`,
        `"${t.reason}"`,
        `"${t.location.region} - ${t.location.city}"`,
        t.status,
        t.requestDate,
        t.approvalDate || '',
        `"${t.approvedBy || ''}"`,
        `"${t.approvedByRole || ''}"`,
        t.completionDate || '',
        `"${t.comments || ''}"`,
        t.urgency || '',
        t.expectedDeliveryDate || ''
      ].join(','))
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_spare_parts_${exportDateRange.startDate}_${exportDateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    dialogService.success('Export Réussi', 'Export Excel généré avec succès !');
  };

  // Fonctions pour modifier les stocks (admin seulement)
  const handleEditPart = (part: SparePart) => {
    if (!canModifyStock) return;
    setEditingPart(part);
    setShowEditPartModal(true);
  };

  const handleCloseEditPartModal = () => {
    setShowEditPartModal(false);
    setEditingPart(null);
  };

  const handleEditPartSubmit = () => {
    if (!editingPart) return;
    
    setSpareParts(prev => prev.map(p => 
      p.id === editingPart.id ? editingPart : p
    ));
    handleCloseEditPartModal();
  };

  // Fonctions pour voir les détails d'un équipement
  const handleViewPartDetails = (part: SparePart) => {
    setSelectedPart(part);
    setShowPartDetailsModal(true);
  };

  const handleClosePartDetailsModal = () => {
    setShowPartDetailsModal(false);
    setSelectedPart(null);
  };



  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Spares Parts</h1>
          <p className="text-gray-600 mt-1">Gestion des équipements et pièces de rechange</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleNewRequest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Nouvelle Demande</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>



      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'dashboard' 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={16} className="inline mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'inventory' 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package size={16} className="inline mr-2" />
          Inventaire
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transactions' 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={16} className="inline mr-2" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests' 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User size={16} className="inline mr-2" />
          Demandes
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Spares Parts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="text-blue-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Total Équipements</p>
                  <p className="text-2xl font-bold text-blue-600">{totalParts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Entrées Aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-600">{todayIn}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="text-red-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Sorties Aujourd'hui</p>
                  <p className="text-2xl font-bold text-red-600">{todayOut}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="text-purple-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Stock Restant</p>
                  <p className="text-2xl font-bold text-purple-600">{totalRemainingStock}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistiques supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="text-orange-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Stock Faible</p>
                  <p className="text-2xl font-bold text-orange-600">{lowStockParts}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Activity className="text-yellow-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Transactions En Attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions en attente de validation */}
          {pendingTransactions > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Transactions en attente de validation</h4>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Équipement</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions
                        .filter(t => t.status === 'pending')
                        .slice(0, 5) // Limiter à 5 transactions
                        .map(transaction => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{transaction.sparePartName}</div>
                              <div className="text-sm text-gray-500">{transaction.reason}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'in' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type === 'in' ? 'Entrée' : 'Sortie'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{transaction.quantity}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{transaction.requester}</div>
                              <div className="text-sm text-gray-500">{transaction.requesterRole}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  className="text-green-600 hover:text-green-900 text-sm"
                                  title="Approuver"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => handleRejectTransaction(transaction.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                  title="Rejeter"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {pendingTransactions > 5 && (
                  <div className="px-4 py-3 bg-gray-50 text-center">
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Voir toutes les transactions en attente ({pendingTransactions})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un équipement..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Toutes catégories</option>
                <option value="Optique">Optique</option>
                <option value="Câblage">Câblage</option>
                <option value="Équipement">Équipement</option>
                <option value="Énergie">Énergie</option>
                <option value="Composants">Composants</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Tous statuts</option>
                <option value="available">Disponible</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Toutes régions</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Matadi">Matadi</option>
                <option value="Goma">Goma</option>
              </select>
            </div>
          </div>

          {/* Tableau d'inventaire */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inventaire des Spares Parts</h3>
              <p className="text-gray-600 text-sm">État actuel du stock par région et ville</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
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
                  {spareParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{part.name}</div>
                          <div className="text-sm text-gray-500">{part.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{part.location.city}</span>
                        </div>
                        <div className="text-sm text-gray-500">{part.location.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{part.currentStock} {part.unit}</div>
                        <div className="text-sm text-gray-500">
                          Min: {part.minStock} | Max: {part.maxStock}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          part.status === 'available' ? 'bg-green-100 text-green-800' :
                          part.status === 'low_stock' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {part.status === 'available' && <CheckCircle size={12} className="mr-1" />}
                          {part.status === 'low_stock' && <AlertTriangle size={12} className="mr-1" />}
                          {part.status === 'out_of_stock' && <XCircle size={12} className="mr-1" />}
                          <span>
                            {part.status === 'available' && 'Disponible'}
                            {part.status === 'low_stock' && 'Stock faible'}
                            {part.status === 'out_of_stock' && 'Rupture'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewPartDetails(part)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          {canModifyStock && (
                            <button 
                              onClick={() => handleEditPart(part)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier le stock"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une transaction..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="completed">Terminé</option>
                <option value="rejected">Rejeté</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Toutes régions</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Matadi">Matadi</option>
                <option value="Goma">Goma</option>
              </select>

              <button
                onClick={handleNewTransaction}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Nouvelle Transaction</span>
              </button>
            </div>
          </div>

          {/* Tableau des transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <p className="text-gray-600 text-sm">Historique des entrées et sorties</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.sparePartName}</div>
                        <div className="text-sm text-gray-500">{transaction.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'in' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                          <span>
                            {transaction.type === 'in' ? 'Entrée' : 'Sortie'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.requester}</div>
                        <div className="text-sm text-gray-500">{transaction.requesterRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.location.city}</div>
                        <div className="text-sm text-gray-500">{transaction.location.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'pending' && <Clock size={12} className="mr-1" />}
                          {transaction.status === 'approved' && <CheckCircle size={12} className="mr-1" />}
                          {transaction.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                          {transaction.status === 'rejected' && <XCircle size={12} className="mr-1" />}
                          <span>
                            {transaction.status === 'pending' && 'En attente'}
                            {transaction.status === 'approved' && 'Approuvé'}
                            {transaction.status === 'completed' && 'Terminé'}
                            {transaction.status === 'rejected' && 'Rejeté'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.requestDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          {transaction.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveTransaction(transaction.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approuver"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleRejectTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Rejeter"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {transaction.status === 'approved' && (
                            <button 
                              onClick={() => handleCompleteTransaction(transaction.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Marquer comme terminé"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une demande..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="completed">Terminé</option>
                <option value="rejected">Rejeté</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">Toutes urgences</option>
                <option value="low">Faible</option>
                <option value="normal">Normale</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Tableau des demandes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Demandes de Transaction</h3>
              <p className="text-gray-600 text-sm">Gestion des demandes de validation</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.sparePartName}</div>
                        <div className="text-sm text-gray-500">{transaction.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'in' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                          <span>
                            {transaction.type === 'in' ? 'Entrée' : 'Sortie'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.requester}</div>
                        <div className="text-sm text-gray-500">{transaction.requesterRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                          transaction.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          transaction.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.urgency === 'urgent' && <AlertTriangle size={12} className="mr-1" />}
                          {transaction.urgency === 'high' && <Clock size={12} className="mr-1" />}
                          <span>
                            {transaction.urgency === 'urgent' && 'Urgente'}
                            {transaction.urgency === 'high' && 'Élevée'}
                            {transaction.urgency === 'normal' && 'Normale'}
                            {transaction.urgency === 'low' && 'Faible'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'pending' && <Clock size={12} className="mr-1" />}
                          {transaction.status === 'approved' && <CheckCircle size={12} className="mr-1" />}
                          {transaction.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                          {transaction.status === 'rejected' && <XCircle size={12} className="mr-1" />}
                          <span>
                            {transaction.status === 'pending' && 'En attente'}
                            {transaction.status === 'approved' && 'Approuvé'}
                            {transaction.status === 'completed' && 'Terminé'}
                            {transaction.status === 'rejected' && 'Rejeté'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.requestDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          {transaction.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveTransaction(transaction.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approuver"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleRejectTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Rejeter"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {transaction.status === 'approved' && (
                            <button 
                              onClick={() => handleCompleteTransaction(transaction.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Marquer comme terminé"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour nouvelle transaction */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Transaction</h3>
              <button
                onClick={handleCloseTransactionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement *
                </label>
                <select
                  value={newTransactionForm.sparePartId}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, sparePartId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un équipement</option>
                  {spareParts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.name} - Stock: {part.currentStock} {part.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de transaction *
                </label>
                <select
                  value={newTransactionForm.type}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, type: e.target.value as 'in' | 'out' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="out">Sortie</option>
                  <option value="in">Entrée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={newTransactionForm.quantity}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région *
                </label>
                <select
                  value={newTransactionForm.location.region}
                  onChange={(e) => setNewTransactionForm(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, region: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Lubumbashi">Lubumbashi</option>
                  <option value="Matadi">Matadi</option>
                  <option value="Goma">Goma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={newTransactionForm.location.city}
                  onChange={(e) => setNewTransactionForm(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ville"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison *
                </label>
                <input
                  type="text"
                  value={newTransactionForm.reason}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Raison de la transaction"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  value={newTransactionForm.comments}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Commentaires supplémentaires"
                />
              </div>

              {/* Note informative sur la validation */}
              <div className="md:col-span-2">
                <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    <span className="text-sm font-medium">
                      Validation requise : Cette transaction nécessitera l'approbation d'un manager avant d'être traitée.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseTransactionModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleTransactionSubmit}
                disabled={!newTransactionForm.sparePartId || !newTransactionForm.reason}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer la transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour détails de transaction */}
      {showTransactionDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la Transaction</h3>
              <button
                onClick={handleCloseTransactionDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Équipement</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.sparePartName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTransaction.type === 'in' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.type === 'in' ? 'Entrée' : 'Sortie'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantité</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedTransaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedTransaction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.status === 'pending' && 'En attente'}
                    {selectedTransaction.status === 'approved' && 'Approuvé'}
                    {selectedTransaction.status === 'completed' && 'Terminé'}
                    {selectedTransaction.status === 'rejected' && 'Rejeté'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Demandeur</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.requester}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.requesterRole}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localisation</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.location.city}, {selectedTransaction.location.region}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de demande</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransaction.requestDate).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Raison</label>
                <p className="text-sm text-gray-900">{selectedTransaction.reason}</p>
              </div>

              {selectedTransaction.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commentaires</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.comments}</p>
                </div>
              )}

              {selectedTransaction.approvedBy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approuvé par</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.approvedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'approbation</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.approvalDate && new Date(selectedTransaction.approvalDate).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseTransactionDetailsModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier un stock (admin seulement) */}
      {showEditPartModal && editingPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le Stock</h3>
              <button
                onClick={handleCloseEditPartModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'équipement
                </label>
                <input
                  type="text"
                  value={editingPart.name}
                  onChange={(e) => setEditingPart(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock actuel
                </label>
                <input
                  type="number"
                  value={editingPart.currentStock}
                  onChange={(e) => setEditingPart(prev => prev ? { 
                    ...prev, 
                    currentStock: parseInt(e.target.value) || 0,
                    status: (parseInt(e.target.value) || 0) > prev.minStock ? 'available' : 'low_stock'
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock minimum
                </label>
                <input
                  type="number"
                  value={editingPart.minStock}
                  onChange={(e) => setEditingPart(prev => prev ? { ...prev, minStock: parseInt(e.target.value) || 0 } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock maximum
                </label>
                <input
                  type="number"
                  value={editingPart.maxStock}
                  onChange={(e) => setEditingPart(prev => prev ? { ...prev, maxStock: parseInt(e.target.value) || 0 } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseEditPartModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEditPartSubmit}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour détails d'un équipement */}
      {showPartDetailsModal && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Détails de l'Équipement</h3>
              <button
                onClick={handleClosePartDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Informations Générales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de l'équipement</label>
                    <p className="text-sm text-gray-900 font-medium">{selectedPart.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <p className="text-sm text-gray-900">{selectedPart.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedPart.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unité</label>
                    <p className="text-sm text-gray-900">{selectedPart.unit}</p>
                  </div>
                </div>
              </div>

              {/* Gestion des stocks */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Gestion des Stocks</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700">Stock Actuel</label>
                    <p className="text-2xl font-bold text-blue-600">{selectedPart.currentStock}</p>
                    <p className="text-xs text-gray-500">{selectedPart.unit}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                    <p className="text-lg font-semibold text-orange-600">{selectedPart.minStock}</p>
                    <p className="text-xs text-gray-500">{selectedPart.unit}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700">Stock Maximum</label>
                    <p className="text-lg font-semibold text-green-600">{selectedPart.maxStock}</p>
                    <p className="text-xs text-gray-500">{selectedPart.unit}</p>
                  </div>
                </div>
                
                {/* Barre de progression du stock */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Niveau de stock</span>
                    <span>{Math.round((selectedPart.currentStock / selectedPart.maxStock) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedPart.currentStock <= selectedPart.minStock 
                          ? 'bg-red-500' 
                          : selectedPart.currentStock <= selectedPart.minStock * 1.5 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((selectedPart.currentStock / selectedPart.maxStock) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Localisation et fournisseur */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Localisation et Fournisseur</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Région</label>
                    <p className="text-sm text-gray-900">{selectedPart.location.region}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville</label>
                    <p className="text-sm text-gray-900">{selectedPart.location.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entrepôt</label>
                    <p className="text-sm text-gray-900">{selectedPart.location.warehouse}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                    <p className="text-sm text-gray-900">{selectedPart.supplier}</p>
                  </div>
                </div>
              </div>

              {/* Statut et informations */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Statut et Informations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPart.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedPart.status === 'low_stock' 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPart.status === 'available' && 'Disponible'}
                      {selectedPart.status === 'low_stock' && 'Stock Faible'}
                      {selectedPart.status === 'out_of_stock' && 'Rupture de Stock'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dernière mise à jour</label>
                    <p className="text-sm text-gray-900">{selectedPart.lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Transactions récentes pour cet équipement */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Transactions Récentes</h4>
                <div className="space-y-2">
                  {transactions
                    .filter(t => t.sparePartId === selectedPart.id)
                    .slice(0, 5)
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'in' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'in' ? 'Entrée' : 'Sortie'}
                          </span>
                          <span className="text-sm text-gray-900">{transaction.quantity} {selectedPart.unit}</span>
                          <span className="text-sm text-gray-600">- {transaction.reason}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.requestDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  {transactions.filter(t => t.sparePartId === selectedPart.id).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">Aucune transaction récente</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleClosePartDetailsModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour nouvelle demande */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Demande de Transaction</h3>
              <button
                onClick={handleCloseRequestModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement *
                </label>
                <select
                  value={newRequestForm.sparePartId}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, sparePartId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un équipement</option>
                  {spareParts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.name} - Stock: {part.currentStock} {part.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de transaction *
                </label>
                <select
                  value={newRequestForm.type}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, type: e.target.value as 'in' | 'out' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="out">Sortie</option>
                  <option value="in">Entrée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={newRequestForm.quantity}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'urgence *
                </label>
                <select
                  value={newRequestForm.urgency}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, urgency: e.target.value as 'low' | 'normal' | 'high' | 'urgent' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Faible</option>
                  <option value="normal">Normale</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région *
                </label>
                <select
                  value={newRequestForm.location.region}
                  onChange={(e) => setNewRequestForm(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, region: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Lubumbashi">Lubumbashi</option>
                  <option value="Matadi">Matadi</option>
                  <option value="Goma">Goma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={newRequestForm.location.city}
                  onChange={(e) => setNewRequestForm(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ville"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison prévue
                </label>
                <input
                  type="date"
                  value={newRequestForm.expectedDeliveryDate}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison *
                </label>
                <input
                  type="text"
                  value={newRequestForm.reason}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Raison de la demande"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  value={newRequestForm.comments}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Commentaires supplémentaires"
                />
              </div>

              {/* Note informative sur la validation */}
              <div className="md:col-span-2">
                <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    <span className="text-sm font-medium">
                      Cette demande sera envoyée à votre manager pour validation avant traitement.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseRequestModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRequestSubmit}
                disabled={!newRequestForm.sparePartId || !newRequestForm.reason}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Soumettre la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour export Excel */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Export Excel</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={exportDateRange.startDate}
                  onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={exportDateRange.endDate}
                  onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Download size={16} className="mr-2 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    L'export inclura toutes les transactions dans la période sélectionnée avec tous les détails.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
