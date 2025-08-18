import React, { useState, useEffect } from 'react';
import { X, Wifi, Plus, Trash2, Edit, Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { networkService } from '../../services/networkService';
import { NetworkDevice, DeviceType, Protocol, SNMPConfig } from '../../types/network';
import { dialogService } from '../../services/dialogService';

interface NetworkIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkIntegrationModal: React.FC<NetworkIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'monitoring' | 'topology'>('devices');
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);

  // Formulaire de nouvel équipement
  const [newDevice, setNewDevice] = useState<Partial<NetworkDevice>>({
    name: '',
    type: 'router',
    ipAddress: '',
    protocol: 'SNMP',
    port: 161,
    location: '',
    description: '',
    snmpConfig: {
      version: 'v2c',
      community: 'public',
      timeout: 5000,
      retries: 3
    },
    credentials: {
      username: '',
      password: '',
      enablePassword: ''
    }
  });

  const supportedDevices = networkService.getSupportedDevices();

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = () => {
    const networkDevices = networkService.getDevices();
    setDevices(networkDevices);
  };

  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.ipAddress) {
      dialogService.error('Champs Requis', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const device: NetworkDevice = {
        id: `device_${Date.now()}`,
        name: newDevice.name!,
        type: newDevice.type!,
        ipAddress: newDevice.ipAddress!,
        protocol: newDevice.protocol!,
        port: newDevice.port,
        location: newDevice.location || '',
        description: newDevice.description || '',
        snmpConfig: newDevice.snmpConfig,
        credentials: newDevice.credentials,
        status: 'offline',
        lastSeen: new Date(),
        metrics: {
          timestamp: new Date(),
          cpu: 0,
          memory: 0,
          temperature: 0,
          uptime: 0,
          status: 'offline'
        }
      };

      const result = await networkService.addDevice(device);
      if (result.success) {
        setShowAddForm(false);
        setNewDevice({
          name: '',
          type: 'router',
          ipAddress: '',
          protocol: 'SNMP',
          port: 161,
          location: '',
          description: '',
          snmpConfig: {
            version: 'v2c',
            community: 'public',
            timeout: 5000,
            retries: 3
          },
          credentials: {
            username: '',
            password: '',
            enablePassword: ''
          }
        });
        loadDevices();
      } else {
        dialogService.error('Erreur Équipement', `Erreur: ${result.message}`);
      }
    } catch (error) {
      dialogService.error('Erreur Ajout', `Erreur lors de l'ajout: ${error}`);
    }
  };

  const handleEditDevice = async () => {
    if (!editingDevice) return;
    
    try {
      const result = await networkService.addDevice(editingDevice);
      if (result.success) {
        setShowEditForm(false);
        setEditingDevice(null);
        loadDevices();
      } else {
        dialogService.error('Erreur Équipement', `Erreur: ${result.message}`);
      }
    } catch (error) {
      dialogService.error('Erreur Modification', `Erreur lors de la modification: ${error}`);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      await networkService.removeDevice(deviceId);
      loadDevices();
    }
  };

  const handleCollectAllMetrics = async () => {
    setIsCollecting(true);
    setCollectionProgress(0);
    
    try {
      const totalDevices = devices.length;
      let completed = 0;
      
      for (const device of devices) {
        await networkService.collectMetrics(device.id);
        completed++;
        setCollectionProgress((completed / totalDevices) * 100);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulation
      }
      
      loadDevices(); // Recharger pour voir les nouvelles métriques
    } catch (error) {
      console.error('Erreur lors de la collecte:', error);
    } finally {
      setIsCollecting(false);
      setCollectionProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-800';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'offline': return <X className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-800" />;
      case 'maintenance': return <Activity className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    const icons = {
      router: '🌐',
      switch: '🔌',
      firewall: '🛡️',
      dns: '📡',
      dwdm: '💎',
      osn: '💎',
      rtn: '📡',
      ptn: '🔗'
    };
    return icons[type] || '🖥️';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Wifi className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Intégration Réseau</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'devices' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Équipements
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'monitoring' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'topology' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Topologie
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'devices' && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Équipements Réseau</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCollectAllMetrics}
                    disabled={isCollecting || devices.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isCollecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Collecte... {Math.round(collectionProgress)}%</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        <span>Collecter Métriques</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvel Équipement</span>
                  </button>
                </div>
              </div>

              {/* Progress bar pour la collecte */}
              {isCollecting && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${collectionProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Liste des équipements */}
              <div className="grid gap-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <p className="text-sm text-gray-600">
                            {supportedDevices[device.type]?.name} - {device.ipAddress}:{device.port}
                          </p>
                          <p className="text-xs text-gray-500">
                            {device.location} • {device.protocol} • Dernière vue: {device.lastSeen.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(device.status)}
                        <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                        <button
                          onClick={() => {
                            setEditingDevice(device);
                            setShowEditForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDevice(device.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Métriques rapides */}
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CPU:</span>
                        <span className="ml-1 font-medium">{device.metrics.cpu.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mémoire:</span>
                        <span className="ml-1 font-medium">{device.metrics.memory.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Température:</span>
                        <span className="ml-1 font-medium">{device.metrics.temperature.toFixed(1)}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Uptime:</span>
                        <span className="ml-1 font-medium">{Math.floor(device.metrics.uptime / 3600)}h</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {devices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun équipement configuré</p>
                    <p className="text-sm">Cliquez sur "Nouvel Équipement" pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Monitoring en Temps Réel</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getDeviceIcon(device.type)}</span>
                        <h4 className="font-medium">{device.name}</h4>
                      </div>
                      {getStatusIcon(device.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CPU</span>
                        <span className="text-sm font-medium">{device.metrics.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.metrics.cpu > 80 ? 'bg-red-500' : 
                            device.metrics.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${device.metrics.cpu}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mémoire</span>
                        <span className="text-sm font-medium">{device.metrics.memory.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.metrics.memory > 80 ? 'bg-red-500' : 
                            device.metrics.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${device.metrics.memory}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Température</span>
                        <span className="text-sm font-medium">{device.metrics.temperature.toFixed(1)}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Topologie Réseau</h3>
              
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="text-center py-8">
                  <Wifi className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">Carte Topologique</h4>
                  <p className="text-gray-500">
                    La visualisation de la topologie réseau sera disponible dans une prochaine version.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {devices.length} équipements détectés
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal d'ajout d'équipement */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Nouvel Équipement Réseau</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipement *</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    placeholder="Routeur Principal"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'équipement</label>
                  <select
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value as DeviceType})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(supportedDevices).map(([key, device]) => (
                      <option key={key} value={key}>{device.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP *</label>
                  <input
                    type="text"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
                    placeholder="192.168.1.1"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protocole</label>
                  <select
                    value={newDevice.protocol}
                    onChange={(e) => setNewDevice({...newDevice, protocol: e.target.value as Protocol})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="SNMP">SNMP</option>
                    <option value="SSH">SSH</option>
                    <option value="Telnet">Telnet</option>
                    <option value="REST API">REST API</option>
                    <option value="NETCONF">NETCONF</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={newDevice.port}
                    onChange={(e) => setNewDevice({...newDevice, port: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                    placeholder="Salle serveurs"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newDevice.description}
                    onChange={(e) => setNewDevice({...newDevice, description: e.target.value})}
                    placeholder="Description de l'équipement"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>

                {/* Configuration SNMP */}
                {newDevice.protocol === 'SNMP' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Configuration SNMP</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Version</label>
                        <select
                          value={newDevice.snmpConfig?.version}
                          onChange={(e) => setNewDevice({
                            ...newDevice,
                            snmpConfig: {...newDevice.snmpConfig, version: e.target.value as any}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="v1">SNMP v1</option>
                          <option value="v2c">SNMP v2c</option>
                          <option value="v3">SNMP v3</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Community</label>
                        <input
                          type="text"
                          value={newDevice.snmpConfig?.community}
                          onChange={(e) => setNewDevice({
                            ...newDevice,
                            snmpConfig: {...newDevice.snmpConfig, community: e.target.value}
                          })}
                          placeholder="public"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Credentials pour SSH/Telnet */}
                {(newDevice.protocol === 'SSH' || newDevice.protocol === 'Telnet') && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Identifiants</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Utilisateur</label>
                        <input
                          type="text"
                          value={newDevice.credentials?.username}
                          onChange={(e) => setNewDevice({
                            ...newDevice,
                            credentials: {...newDevice.credentials, username: e.target.value}
                          })}
                          placeholder="admin"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Mot de passe</label>
                        <input
                          type="password"
                          value={newDevice.credentials?.password}
                          onChange={(e) => setNewDevice({
                            ...newDevice,
                            credentials: {...newDevice.credentials, password: e.target.value}
                          })}
                          placeholder="password"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddDevice}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tester et Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition d'équipement */}
        {showEditForm && editingDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Modifier l'Équipement</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipement</label>
                  <input
                    type="text"
                    value={editingDevice.name}
                    onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'équipement</label>
                  <select
                    value={editingDevice.type}
                    onChange={(e) => setEditingDevice({...editingDevice, type: e.target.value as DeviceType})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(supportedDevices).map(([key, device]) => (
                      <option key={key} value={key}>{device.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP</label>
                  <input
                    type="text"
                    value={editingDevice.ipAddress}
                    onChange={(e) => setEditingDevice({...editingDevice, ipAddress: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protocole</label>
                  <select
                    value={editingDevice.protocol}
                    onChange={(e) => setEditingDevice({...editingDevice, protocol: e.target.value as Protocol})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="SNMP">SNMP</option>
                    <option value="SSH">SSH</option>
                    <option value="Telnet">Telnet</option>
                    <option value="REST API">REST API</option>
                    <option value="NETCONF">NETCONF</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={editingDevice.port}
                    onChange={(e) => setEditingDevice({...editingDevice, port: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingDevice.location}
                    onChange={(e) => setEditingDevice({...editingDevice, location: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingDevice.description}
                    onChange={(e) => setEditingDevice({...editingDevice, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDevice(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditDevice}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tester et Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkIntegrationModal;
