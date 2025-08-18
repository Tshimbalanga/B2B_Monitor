import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  Zap, 
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { Connection, MonitoringData } from '../../types';
import { generateMonitoringData } from '../../data/mockData';

interface MonitoringDashboardProps {
  connections: Connection[];
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ connections }) => {
  const [selectedConnection, setSelectedConnection] = useState<string>(connections[0]?.id || '');
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    latency: 0,
    packetLoss: 0,
    availability: 0,
    rxPower: 0,
    txPower: 0,
  });

  useEffect(() => {
    if (selectedConnection) {
      const data = generateMonitoringData(selectedConnection);
      setMonitoringData(data);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        const latest = data[data.length - 1];
        if (latest) {
          setRealTimeMetrics({
            latency: latest.latency + (Math.random() - 0.5) * 5,
            packetLoss: Math.max(0, latest.packetLoss + (Math.random() - 0.5) * 0.02),
            availability: Math.min(100, latest.availability + (Math.random() - 0.5) * 0.1),
            rxPower: latest.rxPower ? latest.rxPower + (Math.random() - 0.5) * 1 : 0,
            txPower: latest.txPower ? latest.txPower + (Math.random() - 0.5) * 0.5 : 0,
          });
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedConnection]);

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);
  
  const metrics = [
    {
      title: 'Latence',
      value: `${realTimeMetrics.latency.toFixed(1)} ms`,
      icon: Clock,
      color: realTimeMetrics.latency > 30 ? 'text-red-600' : 'text-green-600',
      bgColor: realTimeMetrics.latency > 30 ? 'bg-red-50' : 'bg-green-50',
      trend: realTimeMetrics.latency > 25 ? 'up' : 'down',
      status: realTimeMetrics.latency > 30 ? 'critical' : 'good',
    },
    {
      title: 'Perte de Paquets',
      value: `${(realTimeMetrics.packetLoss * 100).toFixed(3)}%`,
      icon: Activity,
      color: realTimeMetrics.packetLoss > 0.01 ? 'text-red-600' : 'text-green-600',
      bgColor: realTimeMetrics.packetLoss > 0.01 ? 'bg-red-50' : 'bg-green-50',
      trend: realTimeMetrics.packetLoss > 0.005 ? 'up' : 'down',
      status: realTimeMetrics.packetLoss > 0.01 ? 'warning' : 'good',
    },
    {
      title: 'Disponibilité',
      value: `${realTimeMetrics.availability.toFixed(2)}%`,
      icon: Wifi,
      color: realTimeMetrics.availability < 99 ? 'text-orange-600' : 'text-green-600',
      bgColor: realTimeMetrics.availability < 99 ? 'bg-orange-50' : 'bg-green-50',
      trend: realTimeMetrics.availability > 99.5 ? 'up' : 'down',
      status: realTimeMetrics.availability < 99 ? 'warning' : 'good',
    },
    {
      title: 'Puissance RX',
      value: selectedConnectionData?.type === 'fiber' ? `${realTimeMetrics.rxPower.toFixed(1)} dBm` : 'N/A',
      icon: ArrowDown,
      color: realTimeMetrics.rxPower < -25 ? 'text-red-600' : realTimeMetrics.rxPower < -20 ? 'text-orange-600' : 'text-green-600',
      bgColor: realTimeMetrics.rxPower < -25 ? 'bg-red-50' : realTimeMetrics.rxPower < -20 ? 'bg-orange-50' : 'bg-green-50',
      trend: realTimeMetrics.rxPower < -25 ? 'down' : 'stable',
      status: realTimeMetrics.rxPower < -25 ? 'critical' : realTimeMetrics.rxPower < -20 ? 'warning' : 'good',
      visible: selectedConnectionData?.type === 'fiber',
    },
    {
      title: 'Puissance TX',
      value: selectedConnectionData?.type === 'fiber' ? `${realTimeMetrics.txPower.toFixed(1)} dBm` : 'N/A',
      icon: ArrowUp,
      color: realTimeMetrics.txPower > 5 ? 'text-red-600' : realTimeMetrics.txPower > 2 ? 'text-orange-600' : 'text-green-600',
      bgColor: realTimeMetrics.txPower > 5 ? 'bg-red-50' : realTimeMetrics.txPower > 2 ? 'bg-orange-50' : 'bg-green-50',
      trend: realTimeMetrics.txPower > 5 ? 'up' : 'stable',
      status: realTimeMetrics.txPower > 5 ? 'critical' : realTimeMetrics.txPower > 2 ? 'warning' : 'good',
      visible: selectedConnectionData?.type === 'fiber',
    },
  ].filter(metric => metric.visible !== false);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Supervision Temps Réel</h2>
        <p className="text-gray-600 mt-1">Monitoring et performance des liaisons</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sélection de la Liaison</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Données en temps réel</span>
          </div>
        </div>
        
        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          {connections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {connection.id} - {connection.clientName} ({connection.location})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                           metric.trend === 'down' ? TrendingDown : Activity;
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon size={24} className={metric.color} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendIcon size={16} className="text-gray-400" />
                  {metric.status === 'critical' && (
                    <AlertTriangle size={16} className="text-red-500" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 text-sm">{metric.title}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    metric.status === 'good' ? 'bg-green-100 text-green-800' :
                    metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.status === 'good' ? 'Normal' :
                     metric.status === 'warning' ? 'Attention' : 'Critique'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedConnectionData?.type === 'fiber' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails Puissance Optique</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ArrowDown size={20} className="text-blue-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Puissance RX (Réception)</h4>
                    <p className="text-xs text-gray-600">Puissance reçue par l'équipement</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{realTimeMetrics.rxPower.toFixed(1)} dBm</div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    realTimeMetrics.rxPower < -25 ? 'bg-red-100 text-red-800' :
                    realTimeMetrics.rxPower < -20 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {realTimeMetrics.rxPower < -25 ? 'Faible' :
                     realTimeMetrics.rxPower < -20 ? 'Acceptable' : 'Optimale'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ArrowUp size={20} className="text-green-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Puissance TX (Émission)</h4>
                    <p className="text-xs text-gray-600">Puissance émise par l'équipement</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{realTimeMetrics.txPower.toFixed(1)} dBm</div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    realTimeMetrics.txPower > 5 ? 'bg-red-100 text-red-800' :
                    realTimeMetrics.txPower > 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {realTimeMetrics.txPower > 5 ? 'Élevée' :
                     realTimeMetrics.txPower > 2 ? 'Normale' : 'Optimale'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Seuils de référence :</h5>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• RX optimal : -20 à -15 dBm</div>
                  <div>• RX acceptable : -25 à -20 dBm</div>
                  <div>• TX optimal : -2 à +2 dBm</div>
                  <div>• TX normale : +2 à +5 dBm</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique de Performance</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Activity size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Graphique de performance</p>
              <p className="text-sm text-gray-400">Dernières 24 heures</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Actives</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-red-600" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Latence élevée détectée</h4>
                  <p className="text-xs text-red-600">Seuil dépassé: {'>'}30ms</p>
                </div>
              </div>
              <span className="text-xs text-red-600">Il y a 2 min</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Utilisation élevée</h4>
                  <p className="text-xs text-yellow-600">Capacité utilisée: {'>'}80%</p>
                </div>
              </div>
              <span className="text-xs text-yellow-600">Il y a 15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};