import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Map
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface FMETrackingData {
  id: string;
  name: string;
  phone: string;
  email: string;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  status: 'available' | 'busy' | 'offline';
  lastUpdate: string;
  currentTicket?: {
    id: string;
    title: string;
    clientName: string;
    status: string;
    acceptedAt: string;
  };
}

interface FMELocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'offline';
  currentTicket?: {
    id: string;
    title: string;
    clientName: string;
  };
  address: string;
  lastUpdate: string;
}

interface FMETrackingPageProps {
  incidents: any[];
  currentUser: any;
}

export const FMETrackingPage: React.FC<FMETrackingPageProps> = ({ 
  incidents, 
  currentUser 
}) => {
  const [fmeData, setFmeData] = useState<FMETrackingData[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedFME, setSelectedFME] = useState<FMETrackingData | null>(null);

  const generateFMETrackingData = (): FMETrackingData[] => {
    // Récupérer les incidents FME
    const fmeIncidents = incidents.filter(incident => 
      incident.assignedTo === 'FME' || 
      incident.activatedTeam === 'FME'
    );

    // Ajouter des FME simulés avec des positions réelles au Congo RDC
    const simulatedFME: FMETrackingData[] = [
      {
        id: 'fme-david-mukendi',
        name: 'David Mukendi',
        phone: '+243 812345678',
        email: 'david.mukendi@orange.cd',
        currentLocation: {
          latitude: -4.4419,
          longitude: 15.2663,
          address: 'Kinshasa, Gombe, Boulevard du 30 Juin',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        status: 'available',
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-paul-lubumbashi',
        name: 'Paul Mwamba',
        phone: '+243 823456789',
        email: 'paul.mwamba@orange.cd',
        currentLocation: {
          latitude: -11.6647,
          longitude: 27.4793,
          address: 'Lubumbashi, Centre-ville, Avenue du Commerce',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        currentTicket: {
          id: 'INC-008',
          title: 'Indisponibilité totale du service',
          clientName: 'Hôpital Provincial du Katanga',
          status: 'in_progress',
          acceptedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        status: 'busy',
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-marie-kasongo',
        name: 'Marie Kasongo',
        phone: '+243 834567890',
        email: 'marie.kasongo@orange.cd',
        currentLocation: {
          latitude: -6.1360,
          longitude: 23.5898,
          address: 'Mbuji-Mayi, Centre-ville, Avenue de la Paix',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        status: 'offline',
        lastUpdate: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-jean-mbemba',
        name: 'Jean Mbemba',
        phone: '+243 845678901',
        email: 'jean.mbemba@orange.cd',
        currentLocation: {
          latitude: -5.8962,
          longitude: 22.4167,
          address: 'Kananga, Centre-ville, Boulevard Lumumba',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        currentTicket: {
          id: 'INC-009',
          title: 'Problème de connectivité réseau',
          clientName: 'Banque Commerciale du Congo - Kananga',
          status: 'in_progress',
          acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        status: 'busy',
        lastUpdate: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-sophie-kisangani',
        name: 'Sophie Mwamba',
        phone: '+243 856789012',
        email: 'sophie.mwamba@orange.cd',
        currentLocation: {
          latitude: 0.5167,
          longitude: 25.2000,
          address: 'Kisangani, Centre-ville, Avenue du Fleuve',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        status: 'available',
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-marc-goma',
        name: 'Marc Nzuzi',
        phone: '+243 867890123',
        email: 'marc.nzuzi@orange.cd',
        currentLocation: {
          latitude: -1.6791,
          longitude: 29.2289,
          address: 'Goma, Centre-ville, Avenue de la Paix',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        currentTicket: {
          id: 'INC-010',
          title: 'Dégradation de service',
          clientName: 'Université de Goma',
          status: 'in_progress',
          acceptedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        status: 'busy',
        lastUpdate: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-luc-bukavu',
        name: 'Luc Bahati',
        phone: '+243 878901234',
        email: 'luc.bahati@orange.cd',
        currentLocation: {
          latitude: -2.5000,
          longitude: 28.8667,
          address: 'Bukavu, Centre-ville, Boulevard de la République',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        status: 'available',
        lastUpdate: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        id: 'fme-anne-kolwezi',
        name: 'Anne Tshibanda',
        phone: '+243 889012345',
        email: 'anne.tshibanda@orange.cd',
        currentLocation: {
          latitude: -10.7167,
          longitude: 25.4667,
          address: 'Kolwezi, Centre-ville, Avenue de l\'Indépendance',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        },
        status: 'available',
        lastUpdate: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      }
    ];

    return simulatedFME;
  };

  useEffect(() => {
    setFmeData(generateFMETrackingData());
    
    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(() => {
      setFmeData(generateFMETrackingData());
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [incidents]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200';
      case 'busy': return 'text-red-600 bg-red-50 border-red-200';
      case 'offline': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'busy': return <AlertTriangle size={16} />;
      case 'offline': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const stats = {
    total: fmeData.length,
    available: fmeData.filter(fme => fme.status === 'available').length,
    busy: fmeData.filter(fme => fme.status === 'busy').length,
    offline: fmeData.filter(fme => fme.status === 'offline').length
  };

  // Convertir les données FME pour la carte
  const fmeLocations: FMELocation[] = fmeData.map(fme => ({
    id: fme.id,
    name: fme.name,
    latitude: fme.currentLocation.latitude,
    longitude: fme.currentLocation.longitude,
    status: fme.status,
    currentTicket: fme.currentTicket ? {
      id: fme.currentTicket.id,
      title: fme.currentTicket.title,
      clientName: fme.currentTicket.clientName
    } : undefined,
    address: fme.currentLocation.address,
    lastUpdate: fme.lastUpdate
  }));

  const handleFMEClick = (fme: FMELocation) => {
    const selectedFME = fmeData.find(f => f.id === fme.id);
    if (selectedFME) {
      setSelectedFME(selectedFME);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contrôle des équipes terrain
          </h1>
          <p className="text-gray-600">
            Suivi en temps réel des équipes FME
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Occupés</p>
              <p className="text-2xl font-bold text-red-600">{stats.busy}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <XCircle size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hors ligne</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.offline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte interactive */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Map className="mr-2 text-orange-600" size={20} />
            Carte interactive du Congo RDC
          </h2>
          <div className="text-sm text-gray-500">
            Cliquez sur un marqueur pour voir les détails
          </div>
        </div>
        
        <InteractiveMap 
          fmeData={fmeLocations}
          onFmeClick={handleFMEClick}
        />
      </div>

      {/* Liste des FME */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des équipes FME
          </h2>
        </div>
        
        <div className="divide-y">
          {fmeData.map((fme) => (
            <div key={fme.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-orange-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{fme.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {fme.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail size={14} className="mr-1" />
                        {fme.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(fme.status)}`}>
                      {getStatusIcon(fme.status)}
                      <span className="ml-1">{getStatusLabel(fme.status)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(fme.lastUpdate)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Informations de localisation */}
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-2" />
                <span>{fme.currentLocation.address}</span>
              </div>
              
              {/* Ticket en cours si occupé */}
              {fme.currentTicket && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Ticket en cours : {fme.currentTicket.id}
                      </p>
                      <p className="text-xs text-orange-600">
                        {fme.currentTicket.title} - {fme.currentTicket.clientName}
                      </p>
                    </div>
                    <div className="text-xs text-orange-600">
                      Accepté {formatTimeAgo(fme.currentTicket.acceptedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


