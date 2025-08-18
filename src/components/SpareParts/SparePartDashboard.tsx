import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Activity,
  BarChart3
} from 'lucide-react';
import { SparePart, SparePartTransaction, SparePartLocation } from '../../data/mockData';

interface SparePartDashboardProps {
  spareParts: SparePart[];
  transactions: SparePartTransaction[];
  locations: SparePartLocation[];
  totalParts: number;
  totalValue: number;
  lowStockParts: number;
  outOfStockParts: number;
  pendingTransactions: number;
}

export const SparePartDashboard: React.FC<SparePartDashboardProps> = ({
  spareParts,
  transactions,
  locations,
  totalParts,
  totalValue,
  lowStockParts,
  outOfStockParts,
  pendingTransactions
}) => {
  // Données pour les graphiques
  const stockByCategory = spareParts.reduce((acc, part) => {
    acc[part.category] = (acc[part.category] || 0) + part.currentStock;
    return acc;
  }, {} as {[key: string]: number});

  const stockByRegion = spareParts.reduce((acc, part) => {
    acc[part.location.region] = (acc[part.location.region] || 0) + part.currentStock;
    return acc;
  }, {} as {[key: string]: number});

  const valueByRegion = spareParts.reduce((acc, part) => {
    acc[part.location.region] = (acc[part.location.region] || 0) + (part.currentStock * part.unitPrice);
    return acc;
  }, {} as {[key: string]: number});

  // Données pour les graphiques
  const categoryData = Object.entries(stockByCategory).map(([category, stock]) => ({
    category,
    stock,
    value: spareParts
      .filter(p => p.category === category)
      .reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0)
  }));

  const regionData = Object.entries(stockByRegion).map(([region, stock]) => ({
    region,
    stock,
    value: valueByRegion[region] || 0
  }));

  // Données pour l'évolution des transactions
  const transactionTrends = [
    { month: 'Jan', in: 45, out: 32 },
    { month: 'Fév', in: 52, out: 38 },
    { month: 'Mar', in: 48, out: 41 },
    { month: 'Avr', in: 61, out: 35 },
    { month: 'Mai', in: 55, out: 42 },
    { month: 'Jun', in: 67, out: 39 }
  ];

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'low_stock': return '#f59e0b';
      case 'out_of_stock': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Équipements</p>
              <p className="text-2xl font-bold text-gray-900">{totalParts}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Totale</p>
              <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()} USD</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockParts}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="category" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
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
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'stock') return [value, 'Stock'];
                  if (name === 'value') return [`${value.toLocaleString()} USD`, 'Valeur'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="stock" fill="#3b82f6" name="Stock" />
              <Bar dataKey="value" fill="#10b981" name="Valeur (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par région */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Région</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ region, value }) => `${region}: ${value.toLocaleString()} USD`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value.toLocaleString()} USD`, 'Valeur']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution des transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Transactions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={transactionTrends}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
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
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'in') return [value, 'Entrées'];
                if (name === 'out') return [value, 'Sorties'];
                return [value, name];
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="in" 
              stroke="#10b981" 
              fill="url(#colorIn)" 
              name="Entrées"
            />
            <Area 
              type="monotone" 
              dataKey="out" 
              stroke="#ef4444" 
              fill="url(#colorOut)" 
              name="Sorties"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Détail par région et ville */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail par Région et Ville</h3>
          <p className="text-gray-600 text-sm">Quantité et valeur des équipements par localisation</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre d'Équipements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Totale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipements
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={`${location.region}-${location.city}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{location.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{location.city}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{location.totalParts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {location.totalValue.toLocaleString()} USD
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {Object.entries(location.parts).map(([partName, partData]) => (
                        <div key={partName} className="text-xs text-gray-600">
                          {partName}: {partData.quantity} ({partData.value.toLocaleString()} USD)
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Équipements en stock faible */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Faible</h3>
            <AlertTriangle size={20} className="text-orange-600" />
          </div>
          <div className="space-y-3">
            {spareParts
              .filter(part => part.status === 'low_stock')
              .slice(0, 5)
              .map(part => (
                <div key={part.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{part.name}</div>
                    <div className="text-xs text-gray-600">{part.location.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">
                      {part.currentStock} {part.unit}
                    </div>
                    <div className="text-xs text-gray-600">
                      Min: {part.minStock}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Transactions récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div className="space-y-3">
            {transactions
              .slice(0, 5)
              .map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{transaction.sparePartName}</div>
                    <div className="text-xs text-gray-600">{transaction.requester}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(transaction.requestDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};




