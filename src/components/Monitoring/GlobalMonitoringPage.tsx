import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Maximize2,
  Minimize2,
  Calendar,
  X,
  Settings,
  Grid,
  Grid3X3,
  Columns,
  Rows
} from 'lucide-react';
import { Connection } from '../../types';
import '../../styles/map.css';



interface GlobalMonitoringPageProps {
  connections: Connection[];
}

interface ClientAvailabilityData {
  time: string;
  uplink: number;
  downlink: number;
}

interface ClientAvailability {
  clientName: string;
  uplink: number;
  downlink: number;
  status: 'up' | 'down' | 'degraded';
  lastUpdate: string;
}

export const GlobalMonitoringPage: React.FC<GlobalMonitoringPageProps> = ({
  connections
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [clientStatusData, setClientStatusData] = useState<ClientAvailability[]>([]);
  
  // Nouvelles fonctionnalités
  const [updateInterval, setUpdateInterval] = useState<number>(10); // 10 secondes par défaut
  const [gridLayout, setGridLayout] = useState<'1' | '2' | '3' | '4'>('2'); // 2 colonnes par défaut
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [graphsPerPage, setGraphsPerPage] = useState<number>(12); // 12 graphiques par page par défaut

  // Générer des données de disponibilité par client pour les dernières 24h
  const generateClientAvailabilityData = (clientName: string, capacity: string, days: number = 1): ClientAvailabilityData[] => {
    const data: ClientAvailabilityData[] = [];
    const now = new Date();
    
    const totalHours = days * 24;
    
    for (let i = totalHours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Générer des variations réalistes avec des courbes plus fluides
      const timeOfDay = time.getHours();
      const baseUplink = 95 + Math.sin(timeOfDay / 24 * Math.PI) * 3 + (Math.random() * 2 - 1); // 92-98%
      const baseDownlink = 94 + Math.cos(timeOfDay / 24 * Math.PI) * 4 + (Math.random() * 2 - 1); // 90-98%
      
      data.push({
        time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        uplink: Math.round(baseUplink * 100) / 100,
        downlink: Math.round(baseDownlink * 100) / 100
      });
    }
    
    return data;
  };

  // Générer des données de disponibilité par client pour le tableau
  const generateClientStatusData = (): ClientAvailability[] => {
    return connections.map(conn => ({
      clientName: conn.clientName,
      uplink: conn.availability + (Math.random() * 5 - 2.5), // Variation ±2.5%
      downlink: conn.availability + (Math.random() * 3 - 1.5), // Variation ±1.5%
      status: conn.status === 'active' ? 'up' : conn.status === 'in_progress' ? 'degraded' : 'down',
      lastUpdate: new Date().toLocaleString('fr-FR')
    }));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    setClientStatusData(generateClientStatusData());
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Mise à jour automatique configurable
  useEffect(() => {
    // Initialisation des données
    setClientStatusData(generateClientStatusData());

    // Mise à jour automatique selon l'intervalle configuré
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      setClientStatusData(generateClientStatusData());
    }, updateInterval * 1000); // Convertir en millisecondes

    return () => clearInterval(interval);
  }, [connections, updateInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      case 'degraded':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'down':
        return <WifiOff size={16} className="text-red-600" />;
      case 'degraded':
        return <AlertTriangle size={16} className="text-orange-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'up':
        return 'Opérationnel';
      case 'down':
        return 'Hors service';
      case 'degraded':
        return 'Dégradé';
      default:
        return 'Inconnu';
    }
  };

  const getDaysFromTimeRange = (range: string): number => {
    switch (range) {
      case '1h': return 1/24;
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      default: return 1;
    }
  };

  // Statistiques globales
  const totalConnections = connections.length;
  const activeConnections = connections.filter(c => c.status === 'active').length;
  const inactiveConnections = connections.filter(c => c.status !== 'active').length;
  const averageAvailability = connections.reduce((acc, conn) => acc + conn.availability, 0) / connections.length;

  // Calculs de pagination
  const totalPages = Math.ceil(connections.length / graphsPerPage);
  const startIndex = (currentPage - 1) * graphsPerPage;
  const endIndex = startIndex + graphsPerPage;
  const currentConnections = connections.slice(startIndex, endIndex);

  // Fonction pour obtenir la classe CSS de la grille selon le layout
  const getGridClass = () => {
    switch (gridLayout) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 lg:grid-cols-2';
      case '3': return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
      case '4': return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4';
      default: return 'grid-cols-1 lg:grid-cols-2';
    }
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedChart(null); // Fermer les graphiques étendus lors du changement de page
  };

  // Fonction pour aller à la page suivante
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Fonction pour aller à la page précédente
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Global</h1>
          <p className="text-gray-600 mt-1">Surveillance en temps réel de la disponibilité des liaisons clients</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Mise à jour automatique toutes les {updateInterval} secondes
          </div>
          {totalPages > 1 && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Page {currentPage} sur {totalPages}
            </div>
          )}
          
          {/* Bouton de paramètres */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Paramètres</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings size={20} className="mr-2 text-orange-600" />
              Paramètres de monitoring
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration de l'intervalle de mise à jour */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Intervalle de mise à jour</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                    {updateInterval}s
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5s</span>
                  <span>5min</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 30, 60, 120, 300].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setUpdateInterval(interval)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        updateInterval === interval
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interval < 60 ? `${interval}s` : `${interval / 60}min`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Configuration de la disposition des graphiques */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Disposition des graphiques</h4>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setGridLayout('1')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                    gridLayout === '1'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Rows size={16} />
                  <span className="text-xs">1 colonne</span>
                </button>
                <button
                  onClick={() => setGridLayout('2')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                    gridLayout === '2'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Columns size={16} />
                  <span className="text-xs">2 colonnes</span>
                </button>
                <button
                  onClick={() => setGridLayout('3')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                    gridLayout === '3'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Grid3X3 size={16} />
                  <span className="text-xs">3 colonnes</span>
                </button>
                <button
                  onClick={() => setGridLayout('4')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                    gridLayout === '4'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Grid size={16} />
                  <span className="text-xs">4 colonnes</span>
                </button>
              </div>
            </div>
            
            {/* Configuration de la pagination */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Graphiques par page</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="6"
                    max="50"
                    step="6"
                    value={graphsPerPage}
                    onChange={(e) => {
                      setGraphsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Retour à la première page
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                    {graphsPerPage}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>6</span>
                  <span>50</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[6, 12, 18, 24, 30, 36, 42, 48].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setGraphsPerPage(count);
                        setCurrentPage(1); // Retour à la première page
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        graphsPerPage === count
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres améliorés */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="1h">Dernière heure</option>
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
            </select>
            
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les clients</option>
              {Array.from(new Set(connections.map(c => c.clientName))).map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>

            {/* Filtres de dates personnalisées */}
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="text-gray-600" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Date début"
              />
              <span className="text-gray-500">à</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Date fin"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download size={14} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Liaisons</p>
              <p className="text-2xl font-bold text-gray-900">{totalConnections}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wifi size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Liaisons Actives</p>
              <p className="text-2xl font-bold text-green-600">{activeConnections}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Liaisons Inactives</p>
              <p className="text-2xl font-bold text-red-600">{inactiveConnections}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <WifiOff size={20} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibilité Moyenne</p>
              <p className="text-2xl font-bold text-orange-600">{averageAvailability.toFixed(2)}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques d'évolution par client avec disposition configurable */}
      <div className={`grid ${getGridClass()} gap-6 mb-6`}>
        {currentConnections.map((connection) => {
          const clientData = generateClientAvailabilityData(connection.clientName, connection.capacity, getDaysFromTimeRange(selectedTimeRange));
          const clientStatus = clientStatusData.find(c => c.clientName === connection.clientName);
          const isExpanded = expandedChart === connection.id;
          
          return (
            <div key={connection.id} className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300 ${isExpanded ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{connection.clientName}</h3>
                  <p className="text-sm text-gray-600">{connection.location} - {connection.capacity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(clientStatus?.status || 'unknown')}
                  <span className={`text-sm font-medium ${clientStatus?.status === 'up' ? 'text-green-600' : clientStatus?.status === 'down' ? 'text-red-600' : 'text-orange-600'}`}>
                    {getStatusLabel(clientStatus?.status || 'unknown')}
                  </span>
                  <button
                    onClick={() => setExpandedChart(isExpanded ? null : connection.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={isExpanded ? 400 : 250}>
                <ComposedChart data={clientData}>
                  <defs>
                    {/* Gradient 3D pour le downlink (volume vert) */}
                    <linearGradient id={`downlinkGradient-${connection.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'uplink') return [`${value}%`, 'Uplink (ligne rouge)'];
                      if (name === 'downlink') return [`${value}%`, 'Downlink (volume vert)'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Heure: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '10px',
                      fontSize: '12px'
                    }}
                    formatter={(value: string) => {
                      if (value === 'uplink') return `Uplink ${clientStatus?.uplink.toFixed(1)}%`;
                      if (value === 'downlink') return `Downlink ${clientStatus?.downlink.toFixed(1)}%`;
                      return value;
                    }}
                  />
                  
                  {/* Volume vert pour le downlink */}
                  <Area 
                    type="monotone" 
                    dataKey="downlink" 
                    stroke="url(#downlinkGradient-${connection.id})"
                    fill="url(#downlinkGradient-${connection.id})"
                    strokeWidth={2}
                    name="downlink"
                  />
                  
                  {/* Ligne rouge fine continue pour l'uplink */}
                  <Line 
                    type="monotone" 
                    dataKey="uplink" 
                    stroke="#ef4444"
                    strokeWidth={1}
                    dot={false}
                    activeDot={{ r: 4, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 1 }}
                    name="uplink"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(endIndex, connections.length)} sur {connections.length} liaisons
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              <div className="flex items-center space-x-1">
                {/* Première page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}
                
                {/* Pages autour de la page courante */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {/* Dernière page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
