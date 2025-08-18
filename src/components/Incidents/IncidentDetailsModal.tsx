import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar,
  AlertTriangle,
  MapPin,
  Network,
  FileText,
  Image,
  Clock,
  CheckCircle,
  Wrench,
  Activity,
  Edit,
  Save,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { TicketProcessingModal } from './TicketProcessingModal';
import { TicketTimelineModal } from './TicketTimelineModal';
import { dialogService } from '../../services/dialogService';

interface IncidentDetailsModalProps {
  incident: any;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (incidentId: string, updateData: any) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({ 
  incident, 
  currentUser,
  isOpen, 
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    priority: incident?.priority || 'medium',
    severity: incident?.severity || 'medium',
    ticketType: incident?.ticketType || 'degradation',
    location: incident?.location || '',
    clientName: incident?.clientName || ''
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    cause: '',
    solution: '',
    images: [] as File[]
  });
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // Synchroniser les données d'édition quand l'incident change
  useEffect(() => {
    if (incident) {
      setEditData({
        title: incident.title || '',
        description: incident.description || '',
        priority: incident.priority || 'medium',
        severity: incident.severity || 'medium',
        ticketType: incident.ticketType || 'degradation',
        location: incident.location || '',
        clientName: incident.clientName || ''
      });
    }
  }, [incident]);

  if (!isOpen || !incident) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'text-red-700 bg-red-50 border-red-200',
      acknowledged: 'text-orange-700 bg-orange-50 border-orange-200',
      team_activated: 'text-blue-700 bg-blue-50 border-blue-200',
      in_progress: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      resolved: 'text-green-700 bg-green-50 border-green-200',
      closed: 'text-gray-700 bg-gray-50 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Ouvert',
      acknowledged: 'Acquitté',
      team_activated: 'Équipe activée',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'text-green-700 bg-green-50 border-green-200',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      critical: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  // Fonctions pour le nouveau workflow
  const canAcceptTicket = () => {
    return incident.status === 'acknowledged' && 
           (currentUser.role === 'maintenance' || currentUser.role === 'admin');
  };

  const canRejectTicket = () => {
    return incident.status === 'acknowledged' && 
           (currentUser.role === 'maintenance' || currentUser.role === 'admin');
  };

  const canResolveTicket = () => {
    return incident.status === 'in_progress' && 
           (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME');
  };

  const canProcessTicket = () => {
    return incident.status === 'in_progress' && 
           (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME' || currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV');
  };

  const canCloseTicket = () => {
    return incident.status === 'resolved' && 
           (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV' || currentUser.role === 'admin');
  };

  const canReopenTicket = () => {
    return incident.status === 'closed' && 
           (currentUser.role === 'client' || currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV' || currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME');
  };

  const canComment = () => {
    return currentUser.role === 'client' || 
           currentUser.subDepartment === 'NOC' || 
           currentUser.subDepartment === 'SAV' || 
           currentUser.subDepartment === 'BO' || 
           currentUser.subDepartment === 'FME';
  };

  // Fonction pour déterminer si l'utilisateur peut voir les détails complets
  const canViewFullDetails = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      return true;
    }
    
    if (currentUser.role === 'maintenance') {
      if (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') {
        return true; // NOC et SAV voient tout
      } else if (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME') {
        // BO et FME voient seulement leurs tickets
        return incident.reportedBy === currentUser.name || 
               incident.assignedTo === currentUser.subDepartment ||
               incident.activatedTeam === currentUser.subDepartment;
      }
    }
    
    if (currentUser.role === 'client') {
      // Les clients voient seulement si le ticket est fermé
      const isOwnTicket = incident.reportedBy === currentUser.name || 
                         incident.clientName === currentUser.name;
      return isOwnTicket && incident.status === 'closed';
    }
    
    return false;
  };

  // Fonction pour déterminer si l'utilisateur peut voir les informations de traitement
  const canViewProcessingDetails = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      return true;
    }
    
    if (currentUser.role === 'maintenance') {
      if (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') {
        return true; // NOC et SAV voient tout
      } else if (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME') {
        // BO et FME voient seulement leurs propres traitements
        return incident.processing?.processedBy === currentUser.name;
      }
    }
    
    if (currentUser.role === 'client') {
      // Les clients ne voient jamais les détails de traitement
      return false;
    }
    
    return false;
  };

  // Nouvelles fonctions pour les tickets résolus
  const canRemettreTicket = () => {
    return incident.status === 'resolved' && 
           (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV' || currentUser.role === 'admin');
  };

  const canFermerTicket = () => {
    return incident.status === 'resolved' && 
           (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV' || currentUser.role === 'admin');
  };

  const handleRemettreTicket = () => {
    if (!comment.trim()) {
      dialogService.error('Commentaire Requis', 'Veuillez ajouter un commentaire pour remettre le ticket');
      return;
    }

    const now = new Date().toISOString();
    const updateData = {
      ...incident,
      status: 'in_progress',
      processedAt: now,
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'remis',
          timestamp: now,
          user: currentUser.name,
          comment: comment.trim()
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleFermerTicket = () => {
    if (!comment.trim()) {
      dialogService.error('Commentaire Requis', 'Veuillez ajouter un commentaire pour fermer le ticket');
      return;
    }

    const now = new Date().toISOString();
    const updateData = {
      ...incident,
      status: 'closed',
      closedAt: now,
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'closed',
          timestamp: now,
          user: currentUser.name,
          comment: comment.trim()
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleAcceptTicket = async () => {
    try {
      let gpsData = { latitude: '', longitude: '', address: '' };
      
      // Obtenir la localisation GPS pour le FME lors de l'acquittement
      if (currentUser.subDepartment === 'FME') {
        gpsData = await getGPSLocation();
      }

      const now = new Date().toISOString();
      const updateData = {
        ...incident,
        status: 'in_progress',
        acknowledgedAt: now,
        acknowledgedBy: currentUser.name,
        acknowledgmentGPS: currentUser.subDepartment === 'FME' ? gpsData : undefined,
        ticketLifecycle: [
          ...incident.ticketLifecycle,
          {
            step: 'accepted',
            timestamp: now,
            user: currentUser.name,
            comment: `${comment.trim() || 'Ticket accepté pour traitement'}${gpsData.address ? ` - Localisation: ${gpsData.address}` : ''}`
          }
        ]
      };
      onUpdate(incident.id, updateData);
      setComment('');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      dialogService.error('Erreur Acceptation', 'Erreur lors de l\'acceptation du ticket');
    }
  };

  const handleRejectTicket = () => {
    const updateData = {
      ...incident,
      status: 'open',
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'rejected',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: comment.trim() || 'Ticket rejeté'
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleResolveTicket = () => {
    if (!resolutionData.cause.trim() || !resolutionData.solution.trim()) {
      dialogService.error('Validation Requise', 'Veuillez remplir la cause et la solution');
      return;
    }

    const updateData = {
      ...incident,
      status: 'resolved',
      resolution: {
        cause: resolutionData.cause,
        solution: resolutionData.solution,
        images: resolutionData.images,
        resolvedBy: currentUser.name,
        resolvedAt: new Date().toISOString()
      },
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'resolved',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: `Résolu: ${resolutionData.solution}`
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setResolutionData({ cause: '', solution: '', images: [] });
  };

  const handleCloseTicket = () => {
    const updateData = {
      ...incident,
      status: 'closed',
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'closed',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: comment.trim() || 'Ticket fermé'
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleReopenTicket = () => {
    if (!comment.trim()) {
      dialogService.error('Commentaire Requis', 'Veuillez ajouter un commentaire pour réouvrir le ticket');
      return;
    }

    const updateData = {
      ...incident,
      status: 'open',
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'reopened',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: comment.trim()
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;

    const updateData = {
      ...incident,
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'comment',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: comment.trim()
        }
      ]
    };
    onUpdate(incident.id, updateData);
    setComment('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setResolutionData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };



  // Fonction pour obtenir la localisation GPS
  const getGPSLocation = (): Promise<{latitude: string, longitude: string, address: string}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback: utiliser des coordonnées par défaut (Kinshasa)
        resolve({
          latitude: '-4.4419',
          longitude: '15.2663',
          address: 'Kinshasa, RDC'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Essayer d'obtenir l'adresse via reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            
            resolve({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address
            });
          } catch (error) {
            resolve({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: `${latitude}, ${longitude}`
            });
          }
        },
        (error) => {
          console.error('Erreur GPS:', error);
          // Fallback: coordonnées par défaut
          resolve({
            latitude: '-4.4419',
            longitude: '15.2663',
            address: 'Kinshasa, RDC'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const handleProcessTicket = (incidentId: string, processingData: any) => {
    const updateData = {
      ...incident,
      status: 'resolved',
      processing: processingData,
      ticketLifecycle: [
        ...incident.ticketLifecycle,
        {
          step: 'processed',
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          comment: `Traité: ${processingData.actionTaken}${processingData.gpsLocation.address ? ` - Localisation: ${processingData.gpsLocation.address}` : ''}`
        }
      ]
    };
    onUpdate(incidentId, updateData);
  };

  const getTicketTypeLabel = (type: string) => {
    const labels = {
      degradation: 'Dégradation de services',
      indisponibilite: 'Indisponibilité des services',
      information: 'Demande d\'information',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTicketTypeColor = (type: string) => {
    const colors = {
      degradation: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      indisponibilite: 'text-red-700 bg-red-50 border-red-200',
      information: 'text-blue-700 bg-blue-50 border-blue-200',
    };
    return colors[type as keyof typeof colors] || colors.degradation;
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'created':
        return 'Ticket créé';
      case 'acknowledged':
        return 'Ticket acquitté';
      case 'team_activated':
        return 'Équipe activée';
      case 'investigation':
        return 'Investigation en cours';
      case 'resolution':
        return 'Résolution';
      case 'closed':
        return 'Ticket fermé';
      case 'updated':
        return 'Ticket modifié';
      case 'reopened':
        return 'Ticket rouvert';
      default:
        return step;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (slaDeadline: string, status: string) => {
    if (status === 'resolved' || status === 'closed') return false;
    return new Date() > new Date(slaDeadline);
  };

  const getCurrentHandler = () => {
    if (incident.status === 'open') {
      return 'Équipe Maintenance (en attente d\'acquittement)';
    } else if (incident.status === 'acknowledged') {
      return 'Équipe Maintenance (en attente d\'activation d\'équipe)';
    } else if (incident.status === 'team_activated') {
      return `Équipe ${incident.activatedTeam || 'Activée'} (en cours de traitement)`;
    } else if (incident.status === 'in_progress') {
      return 'Équipe en charge (investigation en cours)';
    } else if (incident.status === 'resolved') {
      return 'Résolu';
    } else if (incident.status === 'closed') {
      return 'Fermé';
    }
    return 'Non assigné';
  };

  const getCurrentHandlerIcon = () => {
    if (incident.status === 'open') {
      return <AlertTriangle size={16} className="text-red-600" />;
    } else if (incident.status === 'acknowledged') {
      return <CheckCircle size={16} className="text-orange-600" />;
    } else if (incident.status === 'team_activated') {
      return <Wrench size={16} className="text-blue-600" />;
    } else if (incident.status === 'in_progress') {
      return <Activity size={16} className="text-yellow-600" />;
    } else if (incident.status === 'resolved') {
      return <CheckCircle size={16} className="text-green-600" />;
    } else if (incident.status === 'closed') {
      return <CheckCircle size={16} className="text-gray-600" />;
    }
    return <User size={16} className="text-gray-600" />;
  };

  const canEdit = () => {
    return currentUser?.role === 'maintenance' || currentUser?.role === 'admin';
  };

  const canClose = () => {
    return (currentUser?.role === 'maintenance' || currentUser?.role === 'admin') && 
           incident.status !== 'closed';
  };

  const canReopen = () => {
    return (currentUser?.role === 'maintenance' || currentUser?.role === 'admin') && 
           incident.status === 'closed';
  };

  const handleEdit = () => {
    setEditData({
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      severity: incident.severity,
      ticketType: incident.ticketType,
      location: incident.location,
      clientName: incident.clientName
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const newLifecycleStep = {
        step: 'updated',
        status: 'completed',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur inconnu',
        comment: comment.trim() || 'Ticket modifié'
      };

      const updatedLifecycle = [
        ...(incident.ticketLifecycle || []),
        newLifecycleStep
      ];

      onUpdate(incident.id, {
        ...editData,
        ticketLifecycle: updatedLifecycle
      });

      setIsEditing(false);
      setComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newLifecycleStep = {
        step: 'closed',
        status: 'completed',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur inconnu',
        comment: comment.trim() || 'Ticket fermé'
      };

      const updatedLifecycle = [
        ...(incident.ticketLifecycle || []),
        newLifecycleStep
      ];

      onUpdate(incident.id, {
        status: 'closed',
        ticketLifecycle: updatedLifecycle
      });

      setComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    if (!comment.trim()) {
      dialogService.error('Commentaire Requis', 'Veuillez ajouter un commentaire pour rouvrir le ticket.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir rouvrir ce ticket ?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newLifecycleStep = {
        step: 'reopened',
        status: 'completed',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur inconnu',
        comment: comment.trim()
      };

      const updatedLifecycle = [
        ...(incident.ticketLifecycle || []),
        newLifecycleStep
      ];

      onUpdate(incident.id, {
        status: 'open',
        ticketLifecycle: updatedLifecycle
      });

      setComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erreur lors de la réouverture:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setComment('');
    setEditData({
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      severity: incident.severity,
      ticketType: incident.ticketType,
      location: incident.location,
      clientName: incident.clientName
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                 {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-gray-200">
           <div className="flex items-center space-x-3">
             <div className="bg-orange-50 p-2 rounded-lg">
               <FileText size={24} className="text-orange-600" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900">Détails du Ticket #{incident.id}</h2>
               <p className="text-gray-600 text-sm">Informations complètes du ticket d'incident</p>
             </div>
           </div>
                                               <div className="flex items-center space-x-2">
               {/* Accepter/Rejeter le ticket */}
               {canAcceptTicket() && canViewFullDetails() && !isEditing && (
                 <>
                   <button
                     onClick={handleAcceptTicket}
                     className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                     title="Accepter le ticket"
                   >
                     <CheckCircle size={20} />
                   </button>
                   <button
                     onClick={handleRejectTicket}
                     className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                     title="Rejeter le ticket"
                   >
                     <XCircle size={20} />
                   </button>
                 </>
               )}

                              {/* Traiter le ticket */}
                {canProcessTicket() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={() => setShowProcessingModal(true)}
                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                    title="Traiter le ticket"
                  >
                    <Wrench size={20} />
                  </button>
                )}

                {/* Résoudre le ticket */}
                {canResolveTicket() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={() => {
                      const cause = prompt('Cause du problème:');
                      const solution = prompt('Solution appliquée:');
                      if (cause && solution) {
                        setResolutionData({ cause, solution, images: [] });
                        handleResolveTicket();
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                    title="Résoudre le ticket"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}

               {/* Fermer le ticket */}
               {canCloseTicket() && canViewFullDetails() && !isEditing && (
                 <button
                   onClick={handleCloseTicket}
                   className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50"
                   title="Clôturer le ticket"
                 >
                   <XCircle size={20} />
                 </button>
               )}

                              {/* Remettre le ticket (pour tickets résolus) */}
                {canRemettreTicket() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={handleRemettreTicket}
                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50"
                    title="Remettre le ticket en cours"
                  >
                    <RotateCcw size={20} />
                  </button>
                )}

                {/* Fermer le ticket (pour tickets résolus) */}
                {canFermerTicket() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={handleFermerTicket}
                    className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50"
                    title="Fermer définitivement le ticket"
                  >
                    <XCircle size={20} />
                  </button>
                )}

                {/* Réouvrir le ticket */}
                {canReopenTicket() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={handleReopenTicket}
                    className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50"
                    title="Réouvrir le ticket"
                  >
                    <RotateCcw size={20} />
                  </button>
                )}

                               {/* Timeline du ticket */}
                {canViewFullDetails() && (
                  <button
                    onClick={() => setShowTimelineModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50"
                    title="Voir la timeline du ticket"
                  >
                    <Clock size={20} />
                  </button>
                )}

                {/* Modifier le ticket */}
                {canEdit() && canViewFullDetails() && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                    title="Modifier le ticket"
                  >
                    <Edit size={20} />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
            </div>
         </div>

                 <div className="p-6">
           {/* Message d'information pour les clients */}
           {currentUser.role === 'client' && incident.status !== 'closed' && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
               <div className="flex items-center space-x-2">
                 <AlertTriangle size={20} className="text-yellow-600" />
                 <div>
                   <h3 className="font-semibold text-yellow-900">Information</h3>
                   <p className="text-yellow-800 text-sm">
                     En tant que client, vous ne pouvez voir les détails complets de ce ticket que lorsqu'il sera fermé. 
                     Seuls les équipes NOC et SAV ont accès aux informations en temps réel.
                   </p>
                 </div>
               </div>
             </div>
           )}

                      {/* Informations principales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
               <FileText size={20} />
               <span>Informations Principales</span>
             </h3>
                                                       {isEditing ? (
                    /* Formulaire d'édition normal */
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre du ticket
                        </label>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de ticket
                          </label>
                          <select
                            value={editData.ticketType}
                            onChange={(e) => setEditData(prev => ({ ...prev, ticketType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="degradation">Dégradation de services</option>
                            <option value="indisponibilite">Indisponibilité des services</option>
                            <option value="information">Demande d'information</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priorité
                          </label>
                          <select
                            value={editData.priority}
                            onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="low">Faible</option>
                            <option value="medium">Moyen</option>
                            <option value="high">Élevé</option>
                            <option value="critical">Critique</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sévérité
                          </label>
                          <select
                            value={editData.severity}
                            onChange={(e) => setEditData(prev => ({ ...prev, severity: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="low">Faible</option>
                            <option value="medium">Moyen</option>
                            <option value="high">Élevé</option>
                            <option value="critical">Critique</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaire (optionnel)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={2}
                          placeholder="Ajoutez un commentaire sur les modifications..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{incident.title}</h4>
                        <p className="text-gray-700 mb-4">{incident.description}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTicketTypeColor(incident.ticketType)}`}>
                            {getTicketTypeLabel(incident.ticketType)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Priorité:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.priority)}`}>
                            {getSeverityLabel(incident.priority)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                            {getStatusLabel(incident.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                     {/* Informations client et liaison */}
           <div className="bg-blue-50 rounded-lg p-4 mb-6">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
               <User size={20} />
               <span>Informations Client</span>
             </h3>
             {isEditing ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Nom du client
                   </label>
                   <input
                     type="text"
                     value={editData.clientName}
                     onChange={(e) => setEditData(prev => ({ ...prev, clientName: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Localisation
                   </label>
                   <input
                     type="text"
                     value={editData.location}
                     onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                   />
                 </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="flex items-center space-x-2">
                   <User size={16} className="text-gray-400" />
                   <div>
                     <p className="text-sm text-gray-600">Client</p>
                     <p className="font-medium">{incident.clientName}</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <MapPin size={16} className="text-gray-400" />
                   <div>
                     <p className="text-sm text-gray-600">Localisation</p>
                     <p className="font-medium">{incident.location}</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Network size={16} className="text-gray-400" />
                   <div>
                     <p className="text-sm text-gray-600">Liaison</p>
                     <p className="font-medium">{incident.connectionId}</p>
                   </div>
                 </div>
               </div>
             )}
           </div>

          {/* Informations temporelles */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar size={20} />
              <span>Informations Temporelles</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Signalé le</p>
                  <p className="font-medium">{formatDate(incident.reportedDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Échéance SLA</p>
                  <p className={`font-medium ${isOverdue(incident.slaDeadline, incident.status) ? 'text-red-600' : ''}`}>
                    {formatDate(incident.slaDeadline)}
                    {isOverdue(incident.slaDeadline, incident.status) && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">En retard</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Signalé par</p>
                  <p className="font-medium">{incident.reportedBy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personne en charge actuellement */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Wrench size={20} />
              <span>Personne en Charge</span>
            </h3>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-200">
              {getCurrentHandlerIcon()}
              <div>
                <p className="font-medium text-gray-900">{getCurrentHandler()}</p>
                {incident.acknowledgedBy && (
                  <p className="text-sm text-gray-600">
                    Acquitté par: {incident.acknowledgedBy} le {formatDate(incident.acknowledgedAt)}
                  </p>
                )}
                {incident.activatedTeam && (
                  <p className="text-sm text-gray-600">
                    Équipe activée: {incident.activatedTeam} le {formatDate(incident.activatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

                     {/* Capture d'écran si disponible */}
           {incident.screenshot && (
             <div className="bg-yellow-50 rounded-lg p-4 mb-6">
               <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <Image size={20} />
                 <span>Capture d'Écran</span>
               </h3>
               <div className="bg-white rounded-lg p-4 border border-yellow-200">
                 <div className="flex items-center space-x-2 mb-2">
                   <Image size={16} className="text-yellow-600" />
                   <span className="text-sm text-gray-600">Capture d'écran jointe</span>
                 </div>
                 <p className="text-sm text-gray-700">{incident.screenshot.name}</p>
               </div>
             </div>
           )}

                       {/* Informations de traitement si disponible */}
            {incident.processing && canViewProcessingDetails() && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Wrench size={20} />
                  <span>Informations de Traitement</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cause racine</h4>
                      <p className="text-gray-700 text-sm">{incident.processing.rootCause}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Action effectuée</h4>
                      <p className="text-gray-700 text-sm">{incident.processing.actionTaken}</p>
                    </div>
                  </div>
                  
                  {incident.processing.gpsLocation && incident.processing.gpsLocation.address && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin size={16} className="text-blue-600" />
                        <span className="font-medium text-blue-900">Localisation GPS</span>
                      </div>
                      <p className="text-sm text-blue-700">{incident.processing.gpsLocation.address}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Coordonnées: {incident.processing.gpsLocation.latitude}, {incident.processing.gpsLocation.longitude}
                      </p>
                    </div>
                  )}

                  {incident.processing.interventionImages && incident.processing.interventionImages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Images d'intervention</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {incident.processing.interventionImages.map((file: File, index: number) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Intervention ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Traité par:</span> {incident.processing.processedBy}</p>
                    <p><span className="font-medium">Date de traitement:</span> {formatDate(incident.processing.processedAt)}</p>
                  </div>
                </div>
              </div>
            )}

                                           {/* Section des commentaires */}
           {canComment() && canViewFullDetails() && (
             <div className="bg-blue-50 rounded-lg p-4 mb-6">
               <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <FileText size={20} />
                 <span>Ajouter un Commentaire</span>
               </h3>
               <div className="space-y-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Commentaire
                   </label>
                   <textarea
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     rows={3}
                     placeholder="Ajoutez un commentaire sur ce ticket..."
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                   />
                 </div>
                 <div className="flex justify-end">
                   <button
                     onClick={handleAddComment}
                     disabled={!comment.trim()}
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                   >
                     <FileText size={16} />
                     <span>Ajouter le commentaire</span>
                   </button>
                 </div>
               </div>
             </div>
           )}

          

                       {/* Section de résolution pour BO/FME */}
            {canResolveTicket() && canViewFullDetails() && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Résolution du Ticket</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cause du problème *
                    </label>
                    <textarea
                      value={resolutionData.cause}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, cause: e.target.value }))}
                      rows={3}
                      placeholder="Décrivez la cause du problème..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solution appliquée *
                    </label>
                    <textarea
                      value={resolutionData.solution}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, solution: e.target.value }))}
                      rows={3}
                      placeholder="Décrivez la solution appliquée..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images de résolution
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleResolveTicket}
                      disabled={!resolutionData.cause.trim() || !resolutionData.solution.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle size={16} />
                      <span>Résoudre le ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

                                           {/* Actions pour tickets résolus */}
             {(canRemettreTicket() || canFermerTicket()) && canViewFullDetails() && (
               <div className="bg-green-50 rounded-lg p-4 mb-6">
                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                   <CheckCircle size={20} />
                   <span>Actions sur le Ticket Résolu</span>
                 </h3>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Commentaire *
                     </label>
                     <textarea
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       rows={3}
                       placeholder="Ajoutez un commentaire pour votre action..."
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                     />
                   </div>
                   <div className="flex justify-end space-x-3">
                     {canRemettreTicket() && (
                       <button
                         onClick={handleRemettreTicket}
                         disabled={!comment.trim()}
                         className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                       >
                         <RotateCcw size={16} />
                         <span>Remettre en cours</span>
                       </button>
                     )}
                     {canFermerTicket() && (
                       <button
                         onClick={handleFermerTicket}
                         disabled={!comment.trim()}
                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                       >
                         <XCircle size={16} />
                         <span>Fermer définitivement</span>
                       </button>
                     )}
                   </div>
                 </div>
               </div>
             )}

            {/* Actions pour tickets fermés */}
             {canReopenTicket() && canViewFullDetails() && (
               <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                   <RotateCcw size={20} />
                   <span>Réouverture du Ticket</span>
                 </h3>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Commentaire de réouverture *
                     </label>
                     <textarea
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       rows={3}
                       placeholder="Expliquez pourquoi vous rouvrez ce ticket..."
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     />
                   </div>
                   <div className="flex justify-end">
                     <button
                       onClick={handleReopenTicket}
                       disabled={!comment.trim()}
                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                     >
                       <RotateCcw size={16} />
                       <span>Rouvrir le Ticket</span>
                     </button>
                   </div>
                 </div>
               </div>
             )}

                       {/* Cycle de vie du ticket */}
            {incident.ticketLifecycle && incident.ticketLifecycle.length > 0 && canViewFullDetails() && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Activity size={20} />
                  <span>Historique du Ticket</span>
                </h3>
                <div className="space-y-3">
                  {incident.ticketLifecycle.map((step: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                        <Activity size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{step.step}</h4>
                            <p className="text-sm text-gray-600">
                              {step.user} - {formatDate(step.timestamp)}
                            </p>
                            {step.comment && (
                              <p className="text-sm text-gray-700 mt-1">{step.comment}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                            {getStatusLabel(step.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Actions finales */}
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

             {/* Modal de traitement des tickets */}
       <TicketProcessingModal
         incident={incident}
         currentUser={currentUser}
         isOpen={showProcessingModal}
         onClose={() => setShowProcessingModal(false)}
         onProcess={handleProcessTicket}
       />

       {/* Modal de timeline du ticket */}
       <TicketTimelineModal
         incident={incident}
         isOpen={showTimelineModal}
         onClose={() => setShowTimelineModal(false)}
       />
     </div>
   );
 };
