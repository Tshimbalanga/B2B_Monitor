import React, { useState, useEffect } from 'react';
import { X, Database, TestTube, Play, Stop, Trash2, Eye, Edit } from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { DatabaseConfig, DatabaseConnection } from '../../types/database';
import { dialogService } from '../../services/dialogService';

interface DatabaseIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseIntegrationModal: React.FC<DatabaseIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'connections' | 'query'>('connections');
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);

  // Formulaire de nouvelle connexion
  const [newConnection, setNewConnection] = useState<DatabaseConfig>({
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
    timeout: 30,
    connectionLimit: 10
  });

  const supportedDatabases = databaseService.getSupportedDatabases();

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = () => {
    const activeConnections = databaseService.getActiveConnections();
    setConnections(activeConnections);
    if (activeConnections.length > 0 && !selectedConnection) {
      setSelectedConnection(activeConnections[0].id);
    }
  };

  const handleAddConnection = async () => {
    try {
      const result = await databaseService.testConnection(newConnection);
      if (result.success) {
        setShowAddForm(false);
        setNewConnection({
          type: 'mysql',
          host: '',
          port: 3306,
          database: '',
          username: '',
          password: '',
          ssl: false,
          timeout: 30,
          connectionLimit: 10
        });
        loadConnections();
      } else {
        dialogService.error('Erreur Connexion', `Erreur: ${result.message}`);
      }
    } catch (error) {
      dialogService.error('Erreur Ajout', `Erreur lors de l'ajout: ${error}`);
    }
  };

  const handleEditConnection = async () => {
    if (!editingConnection) return;
    
    try {
      const result = await databaseService.testConnection(editingConnection.config);
      if (result.success) {
        setShowEditForm(false);
        setEditingConnection(null);
        loadConnections();
      } else {
        dialogService.error('Erreur Connexion', `Erreur: ${result.message}`);
      }
    } catch (error) {
      dialogService.error('Erreur Modification', `Erreur lors de la modification: ${error}`);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette connexion ?')) {
      await databaseService.closeConnection(connectionId);
      loadConnections();
    }
  };

  const handleExecuteQuery = async () => {
    if (!selectedConnection || !query.trim()) return;

    setIsExecuting(true);
    try {
      const result = await databaseService.executeQuery(selectedConnection, query);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({
        success: false,
        error: `Erreur d'exécution: ${error}`,
        executionTime: 0,
        rowsAffected: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'error': return '🟡';
      default: return '⚪';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Intégration des Bases de Données</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'connections' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connexions
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'query' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requêtes SQL
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'connections' && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Connexions de Base de Données</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Nouvelle Connexion</span>
                </button>
              </div>

              {/* Liste des connexions */}
              <div className="grid gap-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(connection.status)}</span>
                        <div>
                          <h4 className="font-medium">{connection.config.database}</h4>
                          <p className="text-sm text-gray-600">
                            {supportedDatabases[connection.config.type]?.name} - {connection.config.host}:{connection.config.port}
                          </p>
                          <p className="text-xs text-gray-500">
                            Dernier test: {connection.lastTest.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                        <button
                          onClick={() => {
                            setEditingConnection(connection);
                            setShowEditForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Tables */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Tables ({connection.tables.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {connection.tables.slice(0, 8).map((table, index) => (
                          <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {table.name}
                          </div>
                        ))}
                        {connection.tables.length > 8 && (
                          <div className="text-xs text-gray-500 px-2 py-1">
                            +{connection.tables.length - 8} autres
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {connections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune connexion configurée</p>
                    <p className="text-sm">Cliquez sur "Nouvelle Connexion" pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'query' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Requêtes SQL</h3>
              
              {/* Sélection de connexion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connexion
                </label>
                <select
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner une connexion</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.config.database} ({connection.config.host})
                    </option>
                  ))}
                </select>
              </div>

              {/* Éditeur de requête */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requête SQL
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM table_name WHERE condition;"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>

              {/* Bouton d'exécution */}
              <button
                onClick={handleExecuteQuery}
                disabled={!selectedConnection || !query.trim() || isExecuting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exécution...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Exécuter</span>
                  </>
                )}
              </button>

              {/* Résultats */}
              {queryResult && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Résultats</h4>
                    <div className="text-sm text-gray-600">
                      {queryResult.executionTime}ms - {queryResult.rowsAffected} lignes
                    </div>
                  </div>
                  
                  {queryResult.success ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border">
                        <thead>
                          <tr className="bg-gray-50">
                            {queryResult.data && queryResult.data.length > 0 && 
                              Object.keys(queryResult.data[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">
                                  {key}
                                </th>
                              ))
                            }
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.data?.map((row, index) => (
                            <tr key={index} className="border-t">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-sm border">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-red-600 bg-red-50 p-3 rounded">
                      {queryResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal d'ajout de connexion */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Nouvelle Connexion</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de base de données</label>
                  <select
                    value={newConnection.type}
                    onChange={(e) => setNewConnection({
                      ...newConnection,
                      type: e.target.value as any,
                      port: supportedDatabases[e.target.value as keyof typeof supportedDatabases]?.port || 3306
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(supportedDatabases).map(([key, db]) => (
                      <option key={key} value={key}>{db.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hôte</label>
                  <input
                    type="text"
                    value={newConnection.host}
                    onChange={(e) => setNewConnection({...newConnection, host: e.target.value})}
                    placeholder="localhost"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={newConnection.port}
                    onChange={(e) => setNewConnection({...newConnection, port: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base de données</label>
                  <input
                    type="text"
                    value={newConnection.database}
                    onChange={(e) => setNewConnection({...newConnection, database: e.target.value})}
                    placeholder="nom_base"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                  <input
                    type="text"
                    value={newConnection.username}
                    onChange={(e) => setNewConnection({...newConnection, username: e.target.value})}
                    placeholder="username"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newConnection.password}
                    onChange={(e) => setNewConnection({...newConnection, password: e.target.value})}
                    placeholder="password"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newConnection.ssl}
                    onChange={(e) => setNewConnection({...newConnection, ssl: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Utiliser SSL</label>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddConnection}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tester et Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition de connexion */}
        {showEditForm && editingConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Modifier la Connexion</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de base de données</label>
                  <select
                    value={editingConnection.config.type}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {
                        ...editingConnection.config,
                        type: e.target.value as any,
                        port: supportedDatabases[e.target.value as keyof typeof supportedDatabases]?.port || 3306
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(supportedDatabases).map(([key, db]) => (
                      <option key={key} value={key}>{db.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hôte</label>
                  <input
                    type="text"
                    value={editingConnection.config.host}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, host: e.target.value}
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={editingConnection.config.port}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, port: parseInt(e.target.value)}
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base de données</label>
                  <input
                    type="text"
                    value={editingConnection.config.database}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, database: e.target.value}
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                  <input
                    type="text"
                    value={editingConnection.config.username}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, username: e.target.value}
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={editingConnection.config.password}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, password: e.target.value}
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConnection.config.ssl}
                    onChange={(e) => setEditingConnection({
                      ...editingConnection,
                      config: {...editingConnection.config, ssl: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Utiliser SSL</label>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingConnection(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditConnection}
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

export default DatabaseIntegrationModal;
