import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Upload,
  File,
  Trash2
} from 'lucide-react';

interface RequestFormProps {
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    province: '',
    city: '',
    capacity: '',
    clientContact: '',
    clientEmail: '',
    deliveryDate: '',
    description: '',
    technicalRequirements: '',
    priority: 'medium' as const,
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Villes principales par province de la RDC
  const citiesByProvince: Record<string, string[]> = {
    'Kinshasa': ['Kinshasa', 'Gombe', 'Lingwala', 'Kasa-Vubu', 'Ngaliema', 'Limete', 'Masina', 'Kimbanseke', 'N\'djili', 'Mont-Ngafula', 'Ngaba', 'Bumbu', 'Makala', 'Selembao', 'Kalamu', 'Barumbu', 'Kintambo', 'Ngiri-Ngiri'],
    'Kongo Central': ['Matadi', 'Boma', 'Muanda', 'Kisantu', 'Mbanza-Ngungu', 'Lukula', 'Kasangulu', 'Kimpese', 'Seke-Banza', 'Tshela', 'Mangai', 'Inkisi', 'Madimba', 'Songololo'],
    'Kwango': ['Kenge', 'Popokabaka', 'Kasongo-Lunda', 'Feshi', 'Kahemba', 'Kenge', 'Kisantu', 'Kimbata', 'Masi-Manimba'],
    'Kwilu': ['Bandundu', 'Kikwit', 'Bulungu', 'Gungu', 'Idiofa', 'Masi-Manimba', 'Bagata', 'Mushie', 'Kutu', 'Bolobo', 'Yumbi', 'Oshwe', 'Mangai'],
    'Mai-Ndombe': ['Inongo', 'Kutu', 'Oshwe', 'Bolobo', 'Yumbi', 'Kiri', 'Kutu', 'Mushie'],
    'Kasaï': ['Luebo', 'Dekese', 'Ilebo', 'Mweka', 'Demba', 'Dibaya', 'Kazumba', 'Luebo'],
    'Kasaï Oriental': ['Mbuji-Mayi', 'Lubao', 'Lusambo', 'Kabinda', 'Mwene-Ditu', 'Gandajika', 'Lubao', 'Lusambo', 'Kabinda', 'Mwene-Ditu', 'Gandajika', 'Lubao', 'Lusambo', 'Kabinda', 'Mwene-Ditu', 'Gandajika'],
    'Lomami': ['Kabinda', 'Mwene-Ditu', 'Gandajika', 'Lubao', 'Lusambo', 'Kabinda', 'Mwene-Ditu', 'Gandajika'],
    'Sankuru': ['Lusambo', 'Lodja', 'Katako-Kombe', 'Lomela', 'Lubefu', 'Lusambo', 'Lodja', 'Katako-Kombe', 'Lomela', 'Lubefu'],
    'Maniema': ['Kindu', 'Kasongo', 'Kibombo', 'Punia', 'Kailo', 'Kindu', 'Kasongo', 'Kibombo', 'Punia', 'Kailo'],
    'Sud-Kivu': ['Bukavu', 'Uvira', 'Baraka', 'Kamituga', 'Kalehe', 'Kabare', 'Walungu', 'Shabunda', 'Mwenga', 'Fizi', 'Idjwi'],
    'Nord-Kivu': ['Goma', 'Butembo', 'Beni', 'Rutshuru', 'Masisi', 'Walikale', 'Nyiragongo', 'Lubero', 'Goma', 'Butembo', 'Beni', 'Rutshuru', 'Masisi', 'Walikale', 'Nyiragongo', 'Lubero'],
    'Ituri': ['Bunia', 'Aru', 'Mahagi', 'Djugu', 'Irumu', 'Mambasa', 'Bunia', 'Aru', 'Mahagi', 'Djugu', 'Irumu', 'Mambasa'],
    'Haut-Uélé': ['Isiro', 'Watsa', 'Niangara', 'Rungu', 'Dungu', 'Faradje', 'Niangara', 'Rungu', 'Dungu', 'Faradje'],
    'Bas-Uélé': ['Buta', 'Bondo', 'Ango', 'Bambesa', 'Buta', 'Bondo', 'Ango', 'Bambesa'],
    'Tshopo': ['Kisangani', 'Bafwasende', 'Banalia', 'Basoko', 'Isangi', 'Opala', 'Ubundu', 'Yahuma'],
    'Tshuapa': ['Boende', 'Ikela', 'Monkoto', 'Djolu', 'Befale', 'Bokungu'],
    'Mongala': ['Lisala', 'Bumba', 'Bongandanga', 'Lingala', 'Bumba', 'Bongandanga'],
    'Nord-Ubangi': ['Gbadolite', 'Bosobolo', 'Businga', 'Mobayi-Mbongo', 'Yakoma'],
    'Sud-Ubangi': ['Gemena', 'Budjala', 'Libenge', 'Zongo', 'Bomongo'],
    'Équateur': ['Mbandaka', 'Lukolela', 'Bikoro', 'Ingende', 'Bolomba', 'Bomongo'],
    'Haut-Lomami': ['Kamina', 'Kamina', 'Malemba-Nkulu', 'Kabongo', 'Bukama', 'Kamina', 'Malemba-Nkulu', 'Kabongo', 'Bukama'],
    'Lualaba': ['Kolwezi', 'Likasi', 'Kambove', 'Sakania', 'Kasenga', 'Kolwezi', 'Likasi', 'Kambove', 'Sakania', 'Kasenga'],
    'Haut-Katanga': ['Lubumbashi', 'Likasi', 'Kipushi', 'Kambove', 'Sakania', 'Kasenga', 'Pweto', 'Mitwaba', 'Manono', 'Malemba-Nkulu'],
    'Tanganyika': ['Kalemie', 'Manono', 'Moba', 'Kongolo', 'Kabalo', 'Kalemie', 'Manono', 'Moba', 'Kongolo', 'Kabalo']
  };

  const provinces = [
    'Kinshasa',
    'Kongo Central',
    'Kwango',
    'Kwilu',
    'Mai-Ndombe',
    'Kasaï',
    'Kasaï Oriental',
    'Lomami',
    'Sankuru',
    'Maniema',
    'Sud-Kivu',
    'Nord-Kivu',
    'Ituri',
    'Haut-Uélé',
    'Bas-Uélé',
    'Tshopo',
    'Tshuapa',
    'Mongala',
    'Nord-Ubangi',
    'Sud-Ubangi',
    'Équateur',
    'Haut-Lomami',
    'Lualaba',
    'Haut-Katanga',
    'Tanganyika'
  ];

  const capacities = [
    '10 Mbps',
    '20 Mbps',
    '30 Mbps',
    '40 Mbps',
    '50 Mbps',
    '60 Mbps',
    '70 Mbps',
    '80 Mbps',
    '90 Mbps',
    '100 Mbps',
    '200 Mbps',
    '300 Mbps',
    '400 Mbps',
    '500 Mbps',
    '600 Mbps',
    '700 Mbps',
    '800 Mbps',
    '900 Mbps',
    '1 Gbps',
    '2 Gbps',
    '3 Gbps'
  ];

  const priorities = [
    { value: 'low', label: 'Faible', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'Élevée', color: 'text-orange-600 bg-orange-50' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600 bg-red-50' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }

    if (!formData.province) {
      newErrors.province = 'La province est requise';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'La capacité est requise';
    }

    if (!formData.clientContact.trim()) {
      newErrors.clientContact = 'Le contact du client est requis';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email du client est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Format d\'email invalide';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'La date de livraison est requise';
    } else {
      const selectedDate = new Date(formData.deliveryDate);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.deliveryDate = 'La date de livraison ne peut pas être dans le passé';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newRequest = {
        id: `REQ-${Date.now()}`,
        clientName: formData.clientName.trim(),
        province: formData.province,
        city: formData.city.trim(),
        capacity: formData.capacity,
        clientContact: formData.clientContact.trim(),
        clientEmail: formData.clientEmail.trim(),
        deliveryDate: formData.deliveryDate,
        description: formData.description.trim(),
        technicalRequirements: formData.technicalRequirements.trim(),
        priority: formData.priority,
        status: 'pending',
        submittedBy: 'Utilisateur actuel', // Sera remplacé par l'utilisateur connecté
        submittedDate: new Date().toISOString(),
        attachedFile: attachedFile ? {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type
        } : null,
        location: `${formData.city}, ${formData.province}`,
        expectedSLA: '99.9%',
      };
      
      onSubmit(newRequest);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Réinitialiser la ville si la province change
      if (field === 'province') {
        newData.city = '';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'Le fichier ne doit pas dépasser 10MB' }));
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Format de fichier non supporté. Utilisez PDF, JPG, PNG ou DOC' }));
        return;
      }
      
      setAttachedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setErrors(prev => ({ ...prev, file: '' }));
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Demande de Liaison</h2>
              <p className="text-sm text-gray-600">Formulaire de demande de connexion client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.clientName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              {errors.clientName && (
                <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label htmlFor="clientContact" className="block text-sm font-medium text-gray-700 mb-2">
                Contact client *
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="clientContact"
                  value={formData.clientContact}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.clientContact ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nom et téléphone"
                />
              </div>
              {errors.clientContact && (
                <p className="mt-1 text-sm text-red-600">{errors.clientContact}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email du client *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="clientEmail"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="client@entreprise.com"
              />
            </div>
            {errors.clientEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
            )}
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.province ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">{errors.province}</p>
              )}
            </div>

                         <div>
               <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                 Ville *
               </label>
               <div className="relative">
                 <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                 <select
                   id="city"
                   value={formData.city}
                   onChange={(e) => handleInputChange('city', e.target.value)}
                   className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                     errors.city ? 'border-red-300' : 'border-gray-300'
                   }`}
                 >
                   <option value="">Sélectionner une ville</option>
                   {formData.province && citiesByProvince[formData.province] ? (
                     citiesByProvince[formData.province].map((city) => (
                       <option key={city} value={city}>{city}</option>
                     ))
                   ) : (
                     <option value="" disabled>Sélectionnez d'abord une province</option>
                   )}
                 </select>
               </div>
               {errors.city && (
                 <p className="mt-1 text-sm text-red-600">{errors.city}</p>
               )}
               {formData.province && !citiesByProvince[formData.province] && (
                 <p className="mt-1 text-sm text-gray-500">Villes non disponibles pour cette province</p>
               )}
             </div>
          </div>

          {/* Capacité et date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Capacité requise *
              </label>
              <select
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une capacité</option>
                {capacities.map((capacity) => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date prévue de livraison *
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  id="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.deliveryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.deliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
              )}
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priorité de la demande
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorities.map((priority) => (
                <label
                  key={priority.value}
                  className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priority === priority.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.priority === priority.value ? 'bg-orange-600' : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-sm font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description de la demande *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Décrivez les besoins du client et les spécifications de la liaison..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Exigences techniques */}
          <div>
            <label htmlFor="technicalRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Exigences techniques (optionnel)
            </label>
            <textarea
              id="technicalRequirements"
              value={formData.technicalRequirements}
              onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Spécifications techniques particulières, contraintes, etc."
            />
          </div>

          {/* Upload de fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bon de commande (optionnel)
            </label>
            
            {!attachedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors"
                >
                  <File size={16} className="mr-2" />
                  Sélectionner un fichier
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File size={20} className="text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachedFile.size)}</p>
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
            
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
