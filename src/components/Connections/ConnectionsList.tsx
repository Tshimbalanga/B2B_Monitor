import React, { useState } from 'react';
import { 
  Network, 
  MapPin, 
  Activity, 
  Signal,
  Filter,
  Search,
  Eye,
  Settings
} from 'lucide-react';
import { Connection } from '../../types';

interface ConnectionsListProps {
  connections: Connection[];
  onViewDetails: (connection: Connection) => void;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({ 
  connections, 
  onViewDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || connection.status === statusFilter;
    const matchesType = typeFilter === 'all' || connection.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-700 bg-green-50 border-green-200',
      in_progress: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      planned: 'text-blue-700 bg-blue-50 border-blue-200',
      suspended: 'text-red-700 bg-red-50 border-red-200',
      terminated: 'text-gray-700 bg-gray-50 border-gray-200',
      deactivated: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.planned;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fiber': return '🌐';
      case 'radwin': return '📡';
      case 'mw_rtn': return '🔗';
      case 'ptn': return '🔌';
      default: return '🔌';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Active',
      in_progress: 'En cours',
      planned: 'Planifiée',
      suspended: 'Suspendue',
      terminated: 'Résiliée',
      deactivated: 'Désactivée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      fiber: 'Fibre Optique',
      radwin: 'Radwin',
      mw_rtn: 'MW RTN',
      ptn: 'PTN',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Liaisons</h2>
        <p className="text-gray-600 mt-1">Supervision et gestion du parc de liaisons</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client ou ID de liaison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="in_progress">En cours</option>
                <option value="planned">Planifiée</option>
                <option value="suspended">Suspendue</option>
                <option value="deactivated">Désactivée</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les types</option>
                <option value="fiber">Fibre</option>
                <option value="radwin">Radwin</option>
                <option value="mw_rtn">MW RTN</option>
                <option value="ptn">PTN</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liaison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration Réseau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConnections.map((connection) => (
                <tr key={connection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(connection.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {connection.id}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {connection.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {connection.clientName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getTypeLabel(connection.type)} - {connection.capacity}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">VLAN:</span> {connection.vlan}</div>
                      <div><span className="font-medium">IP:</span> {connection.ipAddress}</div>
                      <div><span className="font-medium">Site:</span> {connection.site}</div>
                      <div><span className="font-medium">Gateway:</span> {connection.gateway}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                      {getStatusLabel(connection.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Utilisation:</span>
                        <span className="font-medium">{connection.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${connection.utilization}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Disponibilité:</span>
                        <span className="font-medium text-green-600">{connection.availability}%</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{connection.sla}</div>
                      <div className="text-gray-500">
                        {connection.assignedTo && `Assigné à ${connection.assignedTo}`}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetails(connection)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title="Voir les détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Configuration"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};