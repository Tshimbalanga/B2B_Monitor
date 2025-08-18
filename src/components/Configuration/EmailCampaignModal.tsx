import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  MapPin,
  User,
  Send,
  X,
  Eye,
  FileText,
  Globe,
  Building,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { dialogService } from '../../services/dialogService';

interface Client {
  id: string;
  name: string;
  email: string;
  region: string;
  city: string;
  company: string;
}

interface EmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

export const EmailCampaignModal: React.FC<EmailCampaignModalProps> = ({
  isOpen,
  onClose,
  clients
}) => {
  const [step, setStep] = useState<'recipients' | 'content' | 'preview' | 'sending'>('recipients');
  const [selectedRecipients, setSelectedRecipients] = useState<'all' | 'region' | 'city' | 'specific'>('all');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sendingProgress, setSendingProgress] = useState(0);

  // Réinitialiser le modal quand il s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStep('recipients');
      setSelectedRecipients('all');
      setSelectedRegion('');
      setSelectedCity('');
      setSelectedClients([]);
      setEmailSubject('');
      setEmailContent('');
      setSelectedTemplate('');
      setSendingProgress(0);
    }
  }, [isOpen]);

  // Extraire les régions et villes uniques
  const regions = [...new Set(clients.map(client => client.region))];
  const cities = selectedRegion 
    ? [...new Set(clients.filter(client => client.region === selectedRegion).map(client => client.city))]
    : [...new Set(clients.map(client => client.city))];

  // Filtrer les clients selon la sélection
  const getFilteredClients = () => {
    switch (selectedRecipients) {
      case 'all':
        return clients;
      case 'region':
        return selectedRegion ? clients.filter(client => client.region === selectedRegion) : [];
      case 'city':
        return selectedCity ? clients.filter(client => client.city === selectedCity) : [];
      case 'specific':
        return clients.filter(client => selectedClients.includes(client.id));
      default:
        return [];
    }
  };

  const filteredClients = getFilteredClients();

  // Templates d'emails prédéfinis
  const emailTemplates = [
    {
      id: 'maintenance',
      name: 'Maintenance Planifiée',
      subject: 'Maintenance planifiée - {region}',
      content: `Bonjour {client_name},

Nous vous informons qu'une maintenance planifiée aura lieu dans votre région ({region}) le {date}.

Détails de la maintenance :
- Date : {date}
- Heure : {time}
- Durée estimée : {duration}
- Impact : {impact}

Nous nous excusons pour la gêne occasionnée et nous vous remercions de votre compréhension.

Cordialement,
L'équipe Orange Business Services`
    },
    {
      id: 'incident',
      name: 'Incident en cours',
      subject: 'Incident technique - {region}',
      content: `Bonjour {client_name},

Nous vous informons qu'un incident technique a été détecté dans votre région ({region}).

Détails de l'incident :
- Type : {incident_type}
- Description : {description}
- Statut : {status}
- Temps de résolution estimé : {estimated_time}

Nos équipes techniques travaillent activement à la résolution de cet incident.

Nous vous tiendrons informés de l'évolution de la situation.

Cordialement,
L'équipe Orange Business Services`
    },
    {
      id: 'newsletter',
      name: 'Newsletter Mensuelle',
      subject: 'Newsletter Orange Business Services - {month}',
      content: `Bonjour {client_name},

Voici notre newsletter mensuelle avec les dernières actualités et améliorations de nos services.

Au sommaire :
- Nouvelles fonctionnalités
- Améliorations de performance
- Actualités de l'entreprise
- Conseils et bonnes pratiques

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Orange Business Services`
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  const handleSendEmails = async () => {
    setStep('sending');
    setSendingProgress(0);

    // Simulation de l'envoi progressif
    for (let i = 0; i <= filteredClients.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setSendingProgress((i / filteredClients.length) * 100);
    }

    // Afficher le résultat avec les emails
    const emailList = filteredClients.map(client => client.email).join(', ');
    dialogService.success('Emails Envoyés', `${filteredClients.length} email(s) envoyé(s) avec succès !\n\nDestinataires : ${emailList}`);
    onClose();
  };

  const replaceTemplateVariables = (text: string) => {
    return text
      .replace('{client_name}', 'Nom du Client')
      .replace('{region}', selectedRegion || 'Région')
      .replace('{city}', selectedCity || 'Ville')
      .replace('{date}', new Date().toLocaleDateString('fr-FR'))
      .replace('{time}', '14:00')
      .replace('{duration}', '2 heures')
      .replace('{impact}', 'Minimal')
      .replace('{incident_type}', 'Problème de connectivité')
      .replace('{description}', 'Interruption temporaire du service')
      .replace('{status}', 'En cours de résolution')
      .replace('{estimated_time}', '30 minutes')
      .replace('{month}', new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campagne d'Email</h2>
              <p className="text-sm text-gray-600">Envoi d'emails en masse aux clients</p>
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
          {/* Étapes */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'recipients' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'recipients' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Destinataires</span>
              </div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className={`flex items-center space-x-2 ${step === 'content' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'content' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Contenu</span>
              </div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Aperçu</span>
              </div>
            </div>
          </div>

          {/* Étape 1: Sélection des destinataires */}
          {step === 'recipients' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélection des Destinataires</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Type de sélection</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="recipients"
                          value="all"
                          checked={selectedRecipients === 'all'}
                          onChange={(e) => setSelectedRecipients(e.target.value as any)}
                          className="text-blue-600"
                        />
                        <Globe size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium">Tous les clients</div>
                          <div className="text-sm text-gray-500">{clients.length} client(s)</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="recipients"
                          value="region"
                          checked={selectedRecipients === 'region'}
                          onChange={(e) => setSelectedRecipients(e.target.value as any)}
                          className="text-blue-600"
                        />
                        <MapPin size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium">Par région</div>
                          <div className="text-sm text-gray-500">Sélectionner une région</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="recipients"
                          value="city"
                          checked={selectedRecipients === 'city'}
                          onChange={(e) => setSelectedRecipients(e.target.value as any)}
                          className="text-blue-600"
                        />
                        <Building size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium">Par ville</div>
                          <div className="text-sm text-gray-500">Sélectionner une ville</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="recipients"
                          value="specific"
                          checked={selectedRecipients === 'specific'}
                          onChange={(e) => setSelectedRecipients(e.target.value as any)}
                          className="text-blue-600"
                        />
                        <User size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium">Clients spécifiques</div>
                          <div className="text-sm text-gray-500">Sélectionner individuellement</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Sélection par région */}
                    {selectedRecipients === 'region' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner une région</option>
                          {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Sélection par ville */}
                    {selectedRecipients === 'city' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner une ville</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Sélection de clients spécifiques */}
                    {selectedRecipients === 'specific' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Clients</label>
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                          {clients.map(client => (
                            <label key={client.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedClients([...selectedClients, client.id]);
                                  } else {
                                    setSelectedClients(selectedClients.filter(id => id !== client.id));
                                  }
                                }}
                                className="text-blue-600"
                              />
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-gray-500">{client.email}</div>
                                <div className="text-xs text-gray-400">{client.city}, {client.region}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Résumé des destinataires */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Résumé des destinataires</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Users size={16} />
                          <span>{filteredClients.length} client(s) sélectionné(s)</span>
                        </div>
                        {filteredClients.length > 0 && (
                          <div className="mt-2 max-h-20 overflow-y-auto">
                            {filteredClients.slice(0, 5).map(client => (
                              <div key={client.id} className="text-xs text-gray-500">
                                • {client.name} ({client.email})
                              </div>
                            ))}
                            {filteredClients.length > 5 && (
                              <div className="text-xs text-gray-400">
                                ... et {filteredClients.length - 5} autre(s)
                              </div>
                            )}
                          </div>
                        )}
                        {filteredClients.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border">
                            <div className="text-xs font-medium text-blue-800">Emails qui seront envoyés :</div>
                            <div className="text-xs text-blue-700 mt-1">
                              {filteredClients.map(client => client.email).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep('content')}
                  disabled={filteredClients.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Contenu de l'email */}
          {step === 'content' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenu de l'Email</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Templates */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Templates prédéfinis</label>
                    <div className="space-y-2">
                      {emailTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            selectedTemplate === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{template.subject}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Éditeur */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Sujet de l'email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                      <textarea
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contenu de l'email..."
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 mb-2">Variables disponibles</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>• {'{client_name}'} - Nom du client</div>
                        <div>• {'{region}'} - Région du client</div>
                        <div>• {'{city}'} - Ville du client</div>
                        <div>• {'{date}'} - Date actuelle</div>
                        <div>• {'{time}'} - Heure actuelle</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('recipients')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!emailSubject || !emailContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aperçu
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Aperçu */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de l'Email</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aperçu de l'email */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Aperçu</h4>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">De:</div>
                        <div className="font-medium">Orange Business Services &lt;noreply@orange.cd&gt;</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">À:</div>
                        <div className="font-medium">{filteredClients.length} destinataire(s)</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {filteredClients.map(client => client.email).join(', ')}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">Sujet:</div>
                        <div className="font-medium">{replaceTemplateVariables(emailSubject)}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">Contenu:</div>
                        <div className="mt-2 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                          {replaceTemplateVariables(emailContent)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Résumé de la campagne */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Résumé de la campagne</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destinataires:</span>
                        <span className="font-medium">{filteredClients.length} client(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Régions:</span>
                        <span className="font-medium">{[...new Set(filteredClients.map(c => c.region))].length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Villes:</span>
                        <span className="font-medium">{[...new Set(filteredClients.map(c => c.city))].length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taille estimée:</span>
                        <span className="font-medium">{(emailContent.length * filteredClients.length / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium">Attention</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Cette action enverra {filteredClients.length} email(s). Assurez-vous que le contenu est correct avant de continuer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('content')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSendEmails}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Send size={16} />
                  <span>Envoyer les emails</span>
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Envoi en cours */}
          {step === 'sending' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Envoi en cours...</h3>
                <p className="text-gray-600">Envoi de {filteredClients.length} email(s)</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{Math.round(sendingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sendingProgress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {Math.round(sendingProgress)} / {filteredClients.length} email(s) envoyé(s)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
