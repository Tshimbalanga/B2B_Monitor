import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MonitoringDashboard } from './components/Monitoring/MonitoringDashboard';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { ConnectionsList } from './components/Connections/ConnectionsList';
import { BillingDashboard } from './components/Billing/BillingDashboard';
import { IncidentsList } from './components/Incidents/IncidentsList';
import { FMETrackingPage } from './components/Tracking/FMETrackingPage';
import { GlobalMonitoringPage } from './components/Monitoring/GlobalMonitoringPage';
import { RequestsList } from './components/Requests/RequestsList';
import { DeactivationRequestsList } from './components/Requests/DeactivationRequestsList';
import { SparePartsManagement } from './components/SpareParts/SparePartsManagement';
import { UserManagement } from './components/Users/UserManagement';
import { ConfigurationDashboard } from './components/Configuration/ConfigurationDashboard';
import { LoginPage } from './components/Auth/LoginPage';
import DialogProvider from './components/common/DialogProvider';
import { NotificationModal } from './components/common/NotificationModal';
import { 
  mockConnections, 
  mockRequests, 
  mockIncidents,
  mockUsers 
} from './data/mockData';
import { Connection, Incident, User } from './types';
import { calculateNotificationCount } from './services/notificationService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    // Charger les données mock
    setConnections(mockConnections);
    setRequests(mockRequests);
    setIncidents(mockIncidents);
    setUsers(mockUsers);
  }, []);

  // Calculer le nombre de notifications pour l'utilisateur connecté
  const notificationCount = calculateNotificationCount(currentUser, incidents, requests);

  const handleNotificationClick = () => {
    setShowNotificationModal(true);
  };

  const handleNavigateToPage = (page: string, itemId?: string) => {
    setActiveTab(page);
    
    // Si un ID d'élément est fourni, on peut l'utiliser pour ouvrir directement le modal de détails
    if (itemId) {
      console.log(`Navigation vers ${page} avec l'élément ${itemId}`);
      
      if (page === 'incidents') {
        setSelectedIncidentId(itemId);
      } else if (page === 'requests') {
        setSelectedRequestId(itemId);
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleViewConnectionDetails = (connection: Connection) => {
    console.log('View connection details:', connection);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            connections={connections}
            incidents={incidents}
            requests={requests}
            users={users}
            currentUser={currentUser}
          />
        );
      case 'connections':
        return (
          <ConnectionsList 
            connections={connections}
            onViewDetails={handleViewConnectionDetails}
          />
        );
      case 'monitoring':
        return (
          <MonitoringDashboard 
            connections={connections}
          />
        );
      case 'incidents':
        return (
          <IncidentsList 
            incidents={incidents}
            connections={connections}
            currentUser={currentUser}
            onCreateIncident={() => {}}
            onUpdateIncident={() => {}}
            selectedIncidentId={selectedIncidentId}
            onIncidentSelected={() => setSelectedIncidentId(null)}
          />
        );
      case 'fme-tracking':
        return (
          <FMETrackingPage 
            incidents={incidents}
            currentUser={currentUser} 
          />
        );
      case 'reports':
        return (
          <GlobalMonitoringPage connections={connections} />
        );
      case 'requests':
        return (
          <RequestsList 
            requests={requests}
            currentUser={currentUser}
            onAddRequest={(requestData) => {
              // Ajouter une nouvelle demande
              const newRequest = {
                ...requestData,
                id: `REQ-${Date.now()}`,
                submittedDate: new Date().toISOString(),
                status: 'pending'
              };
              setRequests([...requests, newRequest]);
            }}
            onValidationUpdate={(requestId, validationData) => {
              // Mettre à jour la demande
              const updatedRequests = requests.map(req => 
                req.id === requestId ? { ...req, ...validationData } : req
              );
              setRequests(updatedRequests);
            }}
            onAddConnection={(connectionData) => {
              // Ajouter la nouvelle connexion
              const newConnection = {
                ...connectionData,
                id: `CONN-${Date.now()}`,
                createdDate: new Date().toISOString().split('T')[0]
              };
              setConnections([...connections, newConnection]);
            }}
            connections={connections}
            onConnectionDeactivation={(connectionId, deactivationData) => {
              // Gérer la désactivation de connexion
              console.log('Connection deactivation:', connectionId, deactivationData);
            }}
            selectedRequestId={selectedRequestId}
            onRequestSelected={() => setSelectedRequestId(null)}
          />
        );
      case 'deactivations':
        return (
          <DeactivationRequestsList 
            requests={requests}
            currentUser={currentUser} 
          />
        );
      case 'spare-parts':
        return (
          <SparePartsManagement currentUser={currentUser} />
        );
      case 'billing':
        return (
          <BillingDashboard />
        );
      case 'users':
        return (
          <UserManagement 
            users={users}
          />
        );
      case 'settings':
        return (
          <ConfigurationDashboard 
            currentUser={currentUser}
          />
        );
      default:
        return (
          <DashboardOverview 
            connections={connections}
            incidents={incidents}
            requests={requests}
            users={users}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <DialogProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          user={currentUser}
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={currentUser} 
            alertCount={notificationCount}
            onLogout={handleLogout} 
            onNotificationClick={handleNotificationClick}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {renderContent()}
          </main>
        </div>
      </div>
      
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        user={currentUser}
        incidents={incidents}
        requests={requests}
        onNavigateToPage={handleNavigateToPage}
      />
    </DialogProvider>
  );
}

export default App;