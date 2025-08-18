import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Network, 
  User, 
  MapPin, 
  Mail, 
  Phone,
  Upload,
  File,
  Trash2,
  Settings,
  Server,
  Globe,
  Router,
  Calendar
} from 'lucide-react';

interface RequestLaunchFormProps {
  request: any;
  onClose: () => void;
  onSubmit: (launchData: any) => void;
}

export const RequestLaunchForm: React.FC<RequestLaunchFormProps> = ({ 
  request, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    vlanClient: '',
    ipClient: '',
    typeService: '',
    typeLiaison: '',
    routerName: '',
    farendSite: '',
    gateway: '',
    lldDesign: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceTypes = [
    'Internet',
    'VPN',
    'Dedicated Line',
    'MPLS',
    'Ethernet',
    'Fiber Optic',
    'Wireless'
  ];

  const liaisonTypes = [
    'Point-to-Point',
    'Point-to-Multipoint',
    'Mesh',
    'Star',
    'Ring',
    'Bus'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vlanClient.trim()) {
      newErrors.vlanClient = 'Le VLAN du client est requis';
    } else if (!/^\d{1,4}$/.test(formData.vlanClient)) {
      newErrors.vlanClient = 'Le VLAN doit être un nombre entre 1 et 4094';
    }

    if (!formData.ipClient.trim()) {
      newErrors.ipClient = 'L\'IP du client est requise';
    } else if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(formData.ipClient)) {
      newErrors.ipClient = 'Format d\'IP invalide';
    }

    if (!formData.typeService) {
      newErrors.typeService = 'Le type de service est requis';
    }

    if (!formData.typeLiaison) {
      newErrors.typeLiaison = 'Le type de liaison est requis';
    }

    if (!formData.routerName.trim()) {
      newErrors.routerName = 'Le nom du routeur est requis';
    }

    if (!formData.farendSite.trim()) {
      newErrors.farendSite = 'Le site distant est requis';
    }

    if (!formData.gateway.trim()) {
      newErrors.gateway = 'La passerelle est requise';
    } else if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(formData.gateway)) {
      newErrors.gateway = 'Format de passerelle invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const launchData = {
        requestId: request.id,
        vlanClient: formData.vlanClient.trim(),
        ipClient: formData.ipClient.trim(),
        typeService: formData.typeService,
        typeLiaison: formData.typeLiaison,
        routerName: formData.routerName.trim(),
        farendSite: formData.farendSite.trim(),
        gateway: formData.gateway.trim(),
        lldDesign: formData.lldDesign ? {
          name: formData.lldDesign.name,
          size: formData.lldDesign.size,
          type: formData.lldDesign.type
        } : null,
        launchDate: new Date().toISOString(),
        status: 'launched'
      };
      
      onSubmit(launchData);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, lldDesign: 'Le fichier ne doit pas dépasser 20MB' }));
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, lldDesign: 'Format de fichier non supporté. Utilisez PDF, JPG, PNG ou DOC' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, lldDesign: file }));
      setErrors(prev => ({ ...prev, lldDesign: '' }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, lldDesign: null }));
    setErrors(prev => ({ ...prev, lldDesign: '' }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Play size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lancement de la Liaison</h2>
              <p className="text-sm text-gray-600">Configuration technique et mise en service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Informations du client */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Informations du client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-blue-600" />
                <span><strong>Client:</strong> {request.clientName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-600" />
                <span><strong>Localisation:</strong> {request.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-600" />
                <span><strong>Email:</strong> {request.clientEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-blue-600" />
                <span><strong>Contact:</strong> {request.clientContact}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Network size={16} className="text-blue-600" />
                <span><strong>Capacité:</strong> {request.capacity}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-blue-600" />
                <span><strong>Date de livraison:</strong> {new Date(request.deliveryDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Formulaire de configuration */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-semibold text-gray-900">Configuration technique</h3>
            
            {/* Configuration réseau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vlanClient" className="block text-sm font-medium text-gray-700 mb-2">
                  VLAN du client *
                </label>
                <div className="relative">
                  <Network size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    id="vlanClient"
                    value={formData.vlanClient}
                    onChange={(e) => handleInputChange('vlanClient', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.vlanClient ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1-4094"
                    min="1"
                    max="4094"
                  />
                </div>
                {errors.vlanClient && (
                  <p className="mt-1 text-sm text-red-600">{errors.vlanClient}</p>
                )}
              </div>

              <div>
                <label htmlFor="ipClient" className="block text-sm font-medium text-gray-700 mb-2">
                  IP du client *
                </label>
                <div className="relative">
                  <Server size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="ipClient"
                    value={formData.ipClient}
                    onChange={(e) => handleInputChange('ipClient', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.ipClient ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="192.168.1.1"
                  />
                </div>
                {errors.ipClient && (
                  <p className="mt-1 text-sm text-red-600">{errors.ipClient}</p>
                )}
              </div>
            </div>

            {/* Types de service et liaison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="typeService" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de service *
                </label>
                <select
                  id="typeService"
                  value={formData.typeService}
                  onChange={(e) => handleInputChange('typeService', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.typeService ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un type de service</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.typeService && (
                  <p className="mt-1 text-sm text-red-600">{errors.typeService}</p>
                )}
              </div>

              <div>
                <label htmlFor="typeLiaison" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de liaison *
                </label>
                <select
                  id="typeLiaison"
                  value={formData.typeLiaison}
                  onChange={(e) => handleInputChange('typeLiaison', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.typeLiaison ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un type de liaison</option>
                  {liaisonTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.typeLiaison && (
                  <p className="mt-1 text-sm text-red-600">{errors.typeLiaison}</p>
                )}
              </div>
            </div>

            {/* Configuration routeur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="routerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du routeur *
                </label>
                <div className="relative">
                  <Router size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="routerName"
                    value={formData.routerName}
                    onChange={(e) => handleInputChange('routerName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.routerName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="ROUTER-001"
                  />
                </div>
                {errors.routerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.routerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="farendSite" className="block text-sm font-medium text-gray-700 mb-2">
                  Site distant (Far-end) *
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="farendSite"
                    value={formData.farendSite}
                    onChange={(e) => handleInputChange('farendSite', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.farendSite ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Site distant"
                  />
                </div>
                {errors.farendSite && (
                  <p className="mt-1 text-sm text-red-600">{errors.farendSite}</p>
                )}
              </div>
            </div>

            {/* Passerelle */}
            <div>
              <label htmlFor="gateway" className="block text-sm font-medium text-gray-700 mb-2">
                Passerelle (Gateway) *
              </label>
              <div className="relative">
                <Settings size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="gateway"
                  value={formData.gateway}
                  onChange={(e) => handleInputChange('gateway', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.gateway ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="192.168.1.254"
                />
              </div>
              {errors.gateway && (
                <p className="mt-1 text-sm text-red-600">{errors.gateway}</p>
              )}
            </div>

            {/* Upload LLD Design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Design LLD (Low Level Design) - Optionnel
              </label>
              
              {!formData.lldDesign ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez-déposez le document LLD ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 20MB)
                  </p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    id="lld-upload"
                  />
                  <label
                    htmlFor="lld-upload"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                  >
                    <File size={16} className="mr-2" />
                    Sélectionner un fichier
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File size={20} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.lldDesign.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.lldDesign.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.lldDesign && (
                <p className="mt-1 text-sm text-red-600">{errors.lldDesign}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play size={16} className="inline mr-2" />
                Lancer la liaison
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};








