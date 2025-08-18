import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  Save,
  Network,
  Upload,
  Image
} from 'lucide-react';
import { Connection } from '../../types';

interface IncidentFormProps {
  connections: Connection[];
  currentUser: any;
  onClose: () => void;
  onSubmit: (incidentData: any) => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ 
  connections, 
  currentUser,
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    connectionId: '',
    title: '',
    description: '',
    severity: 'medium',
    reportedBy: currentUser?.name || '',
    clientName: '',
    location: '',
    priority: 'medium',
    category: 'performance',
    assignedTo: 'maintenance',
    status: 'open',
    ticketType: 'degradation',
    screenshot: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill client name and location when connection is selected
    if (name === 'connectionId' && value) {
      const selectedConnection = connections.find(c => c.id === value);
      if (selectedConnection) {
        setFormData(prev => ({
          ...prev,
          clientName: selectedConnection.clientName,
          location: selectedConnection.location
        }));
      }
    }

    // Auto-set priority based on ticket type
    if (name === 'ticketType') {
      let priority = 'medium';
      let severity = 'medium';
      
      if (value === 'indisponibilite') {
        priority = 'critical';
        severity = 'critical';
      } else if (value === 'degradation') {
        priority = 'medium';
        severity = 'medium';
      } else if (value === 'information') {
        priority = 'low';
        severity = 'low';
      }
      
      setFormData(prev => ({
        ...prev,
        priority,
        severity
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size <= 5 * 1024 * 1024) { // 5MB max
          setFormData(prev => ({ ...prev, screenshot: file }));
          setErrors(prev => ({ ...prev, screenshot: '' }));
        } else {
          setErrors(prev => ({ ...prev, screenshot: 'La taille du fichier ne doit pas dépasser 5MB' }));
        }
      } else {
        setErrors(prev => ({ ...prev, screenshot: 'Veuillez sélectionner un fichier image' }));
      }
    }
  };

  const removeScreenshot = () => {
    setFormData(prev => ({ ...prev, screenshot: null }));
    setErrors(prev => ({ ...prev, screenshot: '' }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size <= 5 * 1024 * 1024) { // 5MB max
          setFormData(prev => ({ ...prev, screenshot: file }));
          setErrors(prev => ({ ...prev, screenshot: '' }));
        } else {
          setErrors(prev => ({ ...prev, screenshot: 'La taille du fichier ne doit pas dépasser 5MB' }));
        }
      } else {
        setErrors(prev => ({ ...prev, screenshot: 'Veuillez sélectionner un fichier image' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }
    if (!formData.connectionId) {
      newErrors.connectionId = 'Veuillez sélectionner une liaison';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Déterminer l'équipe à activer selon le type de ticket
      let activatedTeam = 'SAV'; // Par défaut
      
      if (formData.ticketType === 'indisponibilite') {
        activatedTeam = 'BO'; // Back Office pour les indisponibilités
      } else if (formData.ticketType === 'degradation') {
        activatedTeam = 'SAV'; // SAV pour les dégradations
      } else if (formData.ticketType === 'information') {
        activatedTeam = 'NOC'; // NOC pour les demandes d'information
      }

      const incidentData = {
        ...formData,
        id: `INC-${Date.now()}`,
        status: 'open',
        reportedDate: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + (formData.severity === 'critical' ? 2 : formData.severity === 'high' ? 4 : 8) * 60 * 60 * 1000).toISOString(),
        assignedTo: 'maintenance',
        ticketLifecycle: [
          {
            step: 'created',
            status: 'completed',
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'Système',
            comment: 'Ticket créé automatiquement'
          }
        ],
        activatedTeam
      };
      
      onSubmit(incidentData);
      onClose();
    }
  };

  const ticketTypeOptions = [
    { value: 'degradation', label: 'Dégradation de services', color: 'text-yellow-600' },
    { value: 'indisponibilite', label: 'Indisponibilité des services', color: 'text-red-600' },
    { value: 'information', label: 'Demande d\'information', color: 'text-blue-600' },
  ];

  const severityOptions = [
    { value: 'low', label: 'Faible', color: 'text-green-600' },
    { value: 'medium', label: 'Moyen', color: 'text-yellow-600' },
    { value: 'high', label: 'Élevé', color: 'text-orange-600' },
    { value: 'critical', label: 'Critique', color: 'text-red-600' },
  ];

  const categoryOptions = [
    { value: 'performance', label: 'Performance' },
    { value: 'connectivity', label: 'Connectivité' },
    { value: 'hardware', label: 'Matériel' },
    { value: 'software', label: 'Logiciel' },
    { value: 'security', label: 'Sécurité' },
    { value: 'other', label: 'Autre' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Créer un Ticket d'Incident</h2>
              <p className="text-gray-600 text-sm">Signaler un nouveau problème ou dysfonctionnement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText size={20} />
                <span>Informations Principales</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liaison concernée *
                </label>
                <select
                  name="connectionId"
                  value={formData.connectionId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.connectionId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une liaison</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.id} - {connection.clientName} ({connection.location})
                    </option>
                  ))}
                </select>
                {errors.connectionId && (
                  <p className="text-red-600 text-sm mt-1">{errors.connectionId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de ticket *
                </label>
                <select
                  name="ticketType"
                  value={formData.ticketType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {ticketTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'incident *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Résumé court du problème"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez le problème en détail..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sévérité
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  >
                    {severityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  >
                    {severityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigné à
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  >
                    <option value="maintenance">Équipe Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User size={20} />
                <span>Informations Complémentaires</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signalé par
                </label>
                <input
                  type="text"
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleInputChange}
                  placeholder="Nom de la personne qui signale"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Nom du client (auto-rempli)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Localisation (auto-remplie)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capture d'écran (optionnel)
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-orange-400 bg-orange-50' 
                      : formData.screenshot 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-orange-400'
                  }`}
                >
                  {formData.screenshot ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Image size={20} className="text-green-600" />
                        <span className="text-green-600 font-medium">Capture d'écran ajoutée</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{formData.screenshot.name}</p>
                        <p>{formatFileSize(formData.screenshot.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload size={24} className="mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Glissez-déposez une image ici ou{' '}
                          <label className="text-orange-600 hover:text-orange-800 cursor-pointer">
                            sélectionnez un fichier
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Formats acceptés: JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.screenshot && (
                  <p className="text-red-600 text-sm mt-1">{errors.screenshot}</p>
                )}
              </div>
            </div>
          </div>

          {/* Aperçu du ticket */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du Ticket</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Type:</span>
                <span className={`font-medium ${ticketTypeOptions.find(t => t.value === formData.ticketType)?.color}`}>
                  {ticketTypeOptions.find(t => t.value === formData.ticketType)?.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Priorité:</span>
                <span className={`font-medium ${severityOptions.find(s => s.value === formData.priority)?.color}`}>
                  {severityOptions.find(s => s.value === formData.priority)?.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">SLA:</span>
                <span className="font-medium">
                  {formData.severity === 'critical' ? '2h' : 
                   formData.severity === 'high' ? '4h' : 
                   formData.severity === 'medium' ? '8h' : '24h'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Assigné à:</span>
                <span className="font-medium text-blue-600">Maintenance</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Créer le Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};