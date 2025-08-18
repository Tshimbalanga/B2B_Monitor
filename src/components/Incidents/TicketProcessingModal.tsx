import React, { useState } from 'react';
import { 
  X, 
  Wrench,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { dialogService } from '../../services/dialogService';

interface TicketProcessingModalProps {
  incident: any;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (incidentId: string, processingData: any) => void;
}

export const TicketProcessingModal: React.FC<TicketProcessingModalProps> = ({ 
  incident, 
  currentUser,
  isOpen, 
  onClose,
  onProcess
}) => {
  const [processingData, setProcessingData] = useState({
    rootCause: '',
    actionTaken: '',
    interventionImages: [] as File[],
    gpsLocation: {
      latitude: '',
      longitude: '',
      address: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen || !incident) return null;

  // Fonction pour obtenir la localisation GPS
  const getGPSLocation = (): Promise<{latitude: string, longitude: string, address: string}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback: utiliser des coordonnées par défaut (Kinshasa)
        resolve({
          latitude: '-4.4419',
          longitude: '15.2663',
          address: 'Kinshasa, RDC'
        });
        return;
      }

      setGpsStatus('loading');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Essayer d'obtenir l'adresse via reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            
            setGpsStatus('success');
            resolve({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address
            });
          } catch (error) {
            setGpsStatus('success');
            resolve({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: `${latitude}, ${longitude}`
            });
          }
        },
        (error) => {
          console.error('Erreur GPS:', error);
          setGpsStatus('error');
          // Fallback: coordonnées par défaut
          resolve({
            latitude: '-4.4419',
            longitude: '15.2663',
            address: 'Kinshasa, RDC'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProcessingData(prev => ({
      ...prev,
      interventionImages: [...prev.interventionImages, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setProcessingData(prev => ({
      ...prev,
      interventionImages: prev.interventionImages.filter((_, i) => i !== index)
    }));
  };

  const handleProcessTicket = async () => {
    if (!processingData.rootCause.trim() || !processingData.actionTaken.trim()) {
      dialogService.error('Validation Requise', 'Veuillez remplir la cause racine et l\'action effectuée');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtenir la localisation GPS pour le FME
      let gpsData = processingData.gpsLocation;
      if (currentUser.subDepartment === 'FME') {
        gpsData = await getGPSLocation();
      }

      const finalProcessingData = {
        rootCause: processingData.rootCause,
        actionTaken: processingData.actionTaken,
        interventionImages: processingData.interventionImages,
        gpsLocation: gpsData,
        processedBy: currentUser.name,
        processedAt: new Date().toISOString()
      };

      onProcess(incident.id, finalProcessingData);
      
      // Reset form
      setProcessingData({
        rootCause: '',
        actionTaken: '',
        interventionImages: [],
        gpsLocation: { latitude: '', longitude: '', address: '' }
      });
      setGpsStatus('idle');
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      dialogService.error('Erreur Traitement', 'Erreur lors du traitement du ticket');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProcessingData({
      rootCause: '',
      actionTaken: '',
      interventionImages: [],
      gpsLocation: { latitude: '', longitude: '', address: '' }
    });
    setGpsStatus('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 p-2 rounded-lg">
              <Wrench size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Traitement du Ticket #{incident.id}</h2>
              <p className="text-gray-600 text-sm">Remplissez les informations de traitement</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Informations du ticket */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ticket à traiter</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Titre:</span> {incident.title}</p>
              <p><span className="font-medium">Client:</span> {incident.clientName}</p>
              <p><span className="font-medium">Type:</span> {incident.ticketType}</p>
            </div>
          </div>

          {/* Formulaire de traitement */}
          <div className="space-y-6">
            {/* Cause racine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause racine du problème *
              </label>
              <textarea
                value={processingData.rootCause}
                onChange={(e) => setProcessingData(prev => ({ ...prev, rootCause: e.target.value }))}
                rows={4}
                placeholder="Décrivez la cause racine du problème identifiée..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Action effectuée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action effectuée lors de l'intervention *
              </label>
              <textarea
                value={processingData.actionTaken}
                onChange={(e) => setProcessingData(prev => ({ ...prev, actionTaken: e.target.value }))}
                rows={4}
                placeholder="Décrivez en détail l'action effectuée pour résoudre le problème..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Images d'intervention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images de l'intervention
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                
                {/* Aperçu des images */}
                {processingData.interventionImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {processingData.interventionImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Localisation GPS pour FME */}
            {currentUser.subDepartment === 'FME' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin size={20} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">Localisation GPS</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    La localisation GPS sera automatiquement capturée lors du traitement.
                  </p>
                  
                  {/* Statut GPS */}
                  <div className="flex items-center space-x-2">
                    {gpsStatus === 'idle' && (
                      <AlertCircle size={16} className="text-blue-500" />
                    )}
                    {gpsStatus === 'loading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {gpsStatus === 'success' && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    {gpsStatus === 'error' && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    
                    <span className="text-sm text-blue-700">
                      {gpsStatus === 'idle' && 'GPS sera capturé automatiquement'}
                      {gpsStatus === 'loading' && 'Capture GPS en cours...'}
                      {gpsStatus === 'success' && 'GPS capturé avec succès'}
                      {gpsStatus === 'error' && 'Erreur GPS - Utilisation des coordonnées par défaut'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Informations de traitement */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Wrench size={16} className="text-purple-600" />
                <span className="font-medium text-purple-900">Informations de traitement</span>
              </div>
              <div className="text-sm text-purple-700 space-y-1">
                <p><span className="font-medium">Traité par:</span> {currentUser.name}</p>
                <p><span className="font-medium">Département:</span> {currentUser.subDepartment}</p>
                <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleProcessTicket}
            disabled={!processingData.rootCause.trim() || !processingData.actionTaken.trim() || isSubmitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Wrench size={16} />
            <span>{isSubmitting ? 'Traitement...' : 'Traiter le ticket'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};




