import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  User,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SparePart, SparePartTransaction } from '../../data/mockData';

interface SparePartFormProps {
  transaction?: SparePartTransaction | null;
  spareParts: SparePart[];
  currentUser: any;
  onSubmit: (transaction: SparePartTransaction) => void;
  onClose: () => void;
}

export const SparePartForm: React.FC<SparePartFormProps> = ({
  transaction,
  spareParts,
  currentUser,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    sparePartId: '',
    type: 'out' as 'in' | 'out',
    quantity: 1,
    requester: currentUser?.name || '',
    requesterRole: currentUser?.role || '',
    requesterManager: '',
    project: '',
    reason: '',
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa'
    },
    comments: '',
    exitDocument: null as File | null
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (transaction) {
      setFormData({
        sparePartId: transaction.sparePartId,
        type: transaction.type,
        quantity: transaction.quantity,
        requester: transaction.requester,
        requesterRole: transaction.requesterRole,
        requesterManager: transaction.requesterManager,
        project: transaction.project || '',
        reason: transaction.reason,
        location: transaction.location,
        comments: transaction.comments || '',
        exitDocument: null
      });
    }
  }, [transaction]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.sparePartId) {
      newErrors.sparePartId = 'Veuillez sélectionner un équipement';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Veuillez indiquer la raison';
    }

    if (!formData.requesterManager.trim()) {
      newErrors.requesterManager = 'Veuillez indiquer le chef hiérarchique';
    }

    // Validation spécifique pour les sorties
    if (formData.type === 'out') {
      const selectedPart = spareParts.find(p => p.id === formData.sparePartId);
      if (selectedPart && formData.quantity > selectedPart.currentStock) {
        newErrors.quantity = `Stock insuffisant. Disponible: ${selectedPart.currentStock} ${selectedPart.unit}`;
      }

      if (!formData.exitDocument) {
        newErrors.exitDocument = 'Veuillez joindre le bon de sortie';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler l'upload du document
      let exitDocumentUrl = '';
      if (formData.exitDocument) {
        // Simuler l'upload
        exitDocumentUrl = `/documents/exit-doc-${Date.now()}.pdf`;
      }

      const newTransaction: SparePartTransaction = {
        id: transaction?.id || `TR-${Date.now()}`,
        sparePartId: formData.sparePartId,
        sparePartName: spareParts.find(p => p.id === formData.sparePartId)?.name || '',
        type: formData.type,
        quantity: formData.quantity,
        requester: formData.requester,
        requesterRole: formData.requesterRole,
        requesterManager: formData.requesterManager,
        project: formData.project || undefined,
        reason: formData.reason,
        location: formData.location,
        status: 'pending',
        requestDate: transaction?.requestDate || new Date().toISOString(),
        comments: formData.comments || undefined,
        exitDocument: formData.type === 'out' ? exitDocumentUrl : undefined
      };

      onSubmit(newTransaction);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, exitDocument: file }));
      setErrors(prev => ({ ...prev, exitDocument: '' }));
    }
  };

  const selectedPart = spareParts.find(p => p.id === formData.sparePartId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {transaction ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {formData.type === 'in' ? 'Entrée de stock' : 'Sortie de stock'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de transaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Transaction
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="in"
                  checked={formData.type === 'in'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'in' | 'out' }))}
                  className="mr-2"
                />
                <TrendingUp size={16} className="text-green-600 mr-1" />
                <span>Entrée</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="out"
                  checked={formData.type === 'out'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'in' | 'out' }))}
                  className="mr-2"
                />
                <TrendingDown size={16} className="text-red-600 mr-1" />
                <span>Sortie</span>
              </label>
            </div>
          </div>

          {/* Sélection de l'équipement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipement <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sparePartId}
              onChange={(e) => setFormData(prev => ({ ...prev, sparePartId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.sparePartId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un équipement</option>
              {spareParts.map(part => (
                <option key={part.id} value={part.id}>
                  {part.name} - {part.location.city} (Stock: {part.currentStock} {part.unit})
                </option>
              ))}
            </select>
            {errors.sparePartId && (
              <p className="text-red-500 text-sm mt-1">{errors.sparePartId}</p>
            )}
          </div>

          {/* Informations sur l'équipement sélectionné */}
          {selectedPart && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Informations sur l'équipement</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="ml-2 font-medium">{selectedPart.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Stock actuel:</span>
                  <span className={`ml-2 font-medium ${
                    selectedPart.status === 'low_stock' ? 'text-orange-600' :
                    selectedPart.status === 'out_of_stock' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedPart.currentStock} {selectedPart.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Localisation:</span>
                  <span className="ml-2 font-medium">{selectedPart.location.city}, {selectedPart.location.region}</span>
                </div>
                <div>
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="ml-2 font-medium">{selectedPart.unitPrice} USD</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
            {selectedPart && formData.type === 'out' && (
              <p className="text-sm text-gray-600 mt-1">
                Stock disponible: {selectedPart.currentStock} {selectedPart.unit}
              </p>
            )}
          </div>

          {/* Informations du demandeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandeur
              </label>
              <input
                type="text"
                value={formData.requester}
                onChange={(e) => setFormData(prev => ({ ...prev, requester: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <input
                type="text"
                value={formData.requesterRole}
                onChange={(e) => setFormData(prev => ({ ...prev, requesterRole: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled
              />
            </div>
          </div>

          {/* Chef hiérarchique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chef Hiérarchique <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.requesterManager}
              onChange={(e) => setFormData(prev => ({ ...prev, requesterManager: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.requesterManager ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du chef hiérarchique"
            />
            {errors.requesterManager && (
              <p className="text-red-500 text-sm mt-1">{errors.requesterManager}</p>
            )}
          </div>

          {/* Projet (pour les sorties) */}
          {formData.type === 'out' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projet (optionnel)
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nom du projet"
              />
            </div>
          )}

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez la raison de cette transaction..."
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <select
                value={formData.location.region}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, region: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Matadi">Matadi</option>
                <option value="Goma">Goma</option>
                <option value="Bukavu">Bukavu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <select
                value={formData.location.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, city: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Matadi">Matadi</option>
                <option value="Goma">Goma</option>
                <option value="Bukavu">Bukavu</option>
              </select>
            </div>
          </div>

          {/* Bon de sortie (pour les sorties) */}
          {formData.type === 'out' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bon de Sortie <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="exitDocument"
                />
                <label htmlFor="exitDocument" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Cliquez pour sélectionner un fichier ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX (max 5MB)
                  </p>
                </label>
              </div>
              {formData.exitDocument && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <FileText size={16} />
                  <span>{formData.exitDocument.name}</span>
                </div>
              )}
              {errors.exitDocument && (
                <p className="text-red-500 text-sm mt-1">{errors.exitDocument}</p>
              )}
            </div>
          )}

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires (optionnel)
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Commentaires supplémentaires..."
            />
          </div>

          {/* Informations de validation */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Processus de validation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Cette transaction nécessitera l'approbation de votre chef hiérarchique avant d'être traitée.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{transaction ? 'Mettre à jour' : 'Soumettre'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




