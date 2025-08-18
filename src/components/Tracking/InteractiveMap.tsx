import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface InteractiveMapProps {
  fmeData: FMELocation[];
  onFmeClick?: (fme: FMELocation) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  fmeData, 
  onFmeClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Créer la carte centrée sur le Congo RDC
    const map = L.map(mapRef.current).setView([-4.4419, 15.2663], 6);
    mapInstanceRef.current = map;

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ajouter une couche pour les frontières du Congo RDC (simplifiée)
    const congoBoundary = L.polygon([
      [5.5, 12.0], // Nord-ouest
      [5.5, 31.0], // Nord-est
      [-13.5, 31.0], // Sud-est
      [-13.5, 12.0], // Sud-ouest
      [5.5, 12.0] // Retour au point de départ
    ], {
      color: '#2563eb',
      weight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.1
    }).addTo(map);

    // Ajouter des marqueurs pour les principales villes du Congo RDC
    const majorCities = [
      { name: 'Kinshasa', lat: -4.4419, lng: 15.2663 },
      { name: 'Lubumbashi', lat: -11.6647, lng: 27.4793 },
      { name: 'Mbuji-Mayi', lat: -6.1360, lng: 23.5898 },
      { name: 'Kananga', lat: -5.8962, lng: 22.4167 },
      { name: 'Kisangani', lat: 0.5167, lng: 25.2000 },
      { name: 'Goma', lat: -1.6791, lng: 29.2289 },
      { name: 'Bukavu', lat: -2.5000, lng: 28.8667 },
      { name: 'Kolwezi', lat: -10.7167, lng: 25.4667 },
      { name: 'Likasi', lat: -10.9833, lng: 26.7333 },
      { name: 'Tshikapa', lat: -6.4167, lng: 20.8000 }
    ];

    majorCities.forEach(city => {
      const cityMarker = L.circleMarker([city.lat, city.lng], {
        radius: 6,
        fillColor: '#1f2937',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      cityMarker.bindTooltip(city.name, {
        permanent: false,
        direction: 'top',
        className: 'city-tooltip'
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Créer des icônes personnalisées pour chaque statut
    const createCustomIcon = (status: string) => {
      const colors = {
        available: '#10b981',
        busy: '#ef4444',
        offline: '#f59e0b'
      };

      return L.divIcon({
        className: 'custom-fme-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: ${colors[status as keyof typeof colors]};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
          ">
            F
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    // Ajouter les marqueurs FME
    fmeData.forEach(fme => {
      const marker = L.marker([fme.latitude, fme.longitude], {
        icon: createCustomIcon(fme.status)
      }).addTo(mapInstanceRef.current!);

      // Créer le contenu du popup
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background-color: ${
                fme.status === 'available' ? '#10b981' :
                fme.status === 'busy' ? '#ef4444' : '#f59e0b'
              };
              border-radius: 50%;
              margin-right: 8px;
            "></div>
            <strong style="color: #1f2937;">${fme.name}</strong>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <strong>Statut:</strong> ${
              fme.status === 'available' ? 'Disponible' :
              fme.status === 'busy' ? 'Occupé' : 'Hors ligne'
            }
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <strong>Localisation:</strong> ${fme.address}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
            <strong>Dernière mise à jour:</strong> ${new Date(fme.lastUpdate).toLocaleTimeString()}
          </div>
          ${
            fme.currentTicket ? `
              <div style="
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 4px;
                padding: 8px;
                margin-top: 8px;
              ">
                <div style="font-size: 12px; font-weight: bold; color: #92400e; margin-bottom: 4px;">
                  Ticket en cours: ${fme.currentTicket.id}
                </div>
                <div style="font-size: 11px; color: #92400e;">
                  ${fme.currentTicket.title}
                </div>
                <div style="font-size: 11px; color: #92400e;">
                  Client: ${fme.currentTicket.clientName}
                </div>
              </div>
            ` : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      // Ajouter un gestionnaire de clic
      marker.on('click', () => {
        if (onFmeClick) {
          onFmeClick(fme);
        }
      });

      markersRef.current.push(marker);
    });
  }, [fmeData, onFmeClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ zIndex: 1 }}
      />
      
      {/* Légende */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
        <div className="text-sm font-medium text-gray-900 mb-2">Légende</div>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Occupé</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Hors ligne</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Villes principales</span>
          </div>
        </div>
      </div>
    </div>
  );
};
