export interface TicketTimeline {
  status: string;
  label: string;
  timestamp: string;
  user: string;
  duration?: string;
  comment?: string;
}

export interface TicketDuration {
  fromStatus: string;
  toStatus: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export const getStatusLabel = (status: string): string => {
  const labels = {
    'open': 'Créé',
    'acknowledged': 'Assigné',
    'team_activated': 'Équipe Activée',
    'in_progress': 'En Traitement',
    'resolved': 'Résolu',
    'closed': 'Fermé',
  };
  return labels[status as keyof typeof labels] || status;
};

export const getStatusIcon = (status: string): string => {
  const icons = {
    'open': '📝',
    'acknowledged': '👤',
    'team_activated': '🔧',
    'in_progress': '⚡',
    'resolved': '✅',
    'closed': '🔒',
  };
  return icons[status as keyof typeof icons] || '📋';
};

export const formatDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}j ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const calculateTicketTimeline = (incident: any): TicketTimeline[] => {
  const timeline: TicketTimeline[] = [];
  
  // Ajouter la création
  if (incident.reportedDate) {
    timeline.push({
      status: 'open',
      label: 'Créé',
      timestamp: incident.reportedDate,
      user: incident.reportedBy,
      comment: 'Ticket créé'
    });
  }
  
  // Ajouter l'assignation
  if (incident.acknowledgedAt) {
    timeline.push({
      status: 'acknowledged',
      label: 'Assigné',
      timestamp: incident.acknowledgedAt,
      user: incident.acknowledgedBy || 'Système',
      comment: 'Ticket assigné à l\'équipe maintenance'
    });
  }
  
  // Ajouter l'activation d'équipe
  if (incident.activatedAt) {
    timeline.push({
      status: 'team_activated',
      label: 'Équipe Activée',
      timestamp: incident.activatedAt,
      user: incident.activatedTeam || 'Système',
      comment: `Équipe ${incident.activatedTeam} activée`
    });
  }
  
  // Ajouter le traitement
  if (incident.processing?.processedAt) {
    timeline.push({
      status: 'in_progress',
      label: 'En Traitement',
      timestamp: incident.processing.processedAt,
      user: incident.processing.processedBy,
      comment: 'Traitement en cours'
    });
  }
  
  // Ajouter la résolution
  if (incident.resolution?.resolvedAt) {
    timeline.push({
      status: 'resolved',
      label: 'Résolu',
      timestamp: incident.resolution.resolvedAt,
      user: incident.resolution.resolvedBy,
      comment: 'Ticket résolu'
    });
  } else if (incident.processing?.processedAt) {
    // Si pas de résolution séparée, utiliser le traitement comme résolution
    timeline.push({
      status: 'resolved',
      label: 'Résolu',
      timestamp: incident.processing.processedAt,
      user: incident.processing.processedBy,
      comment: 'Ticket traité et résolu'
    });
  }
  
  // Ajouter la fermeture
  if (incident.status === 'closed') {
    // Chercher la dernière action de fermeture dans le lifecycle
    const closeStep = incident.ticketLifecycle?.find((step: any) => step.step === 'closed');
    if (closeStep) {
      timeline.push({
        status: 'closed',
        label: 'Fermé',
        timestamp: closeStep.timestamp,
        user: closeStep.user,
        comment: closeStep.comment || 'Ticket fermé'
      });
    }
  }
  
  // Calculer les durées
  for (let i = 0; i < timeline.length - 1; i++) {
    const current = timeline[i];
    const next = timeline[i + 1];
    current.duration = formatDuration(current.timestamp, next.timestamp);
  }
  
  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const calculateTotalDuration = (incident: any): string => {
  const timeline = calculateTicketTimeline(incident);
  if (timeline.length < 2) return 'N/A';
  
  const start = timeline[0].timestamp;
  const end = timeline[timeline.length - 1].timestamp;
  
  return formatDuration(start, end);
};

export const getCurrentStatusDuration = (incident: any): string => {
  const timeline = calculateTicketTimeline(incident);
  if (timeline.length === 0) return 'N/A';
  
  const lastStatus = timeline[timeline.length - 1];
  const now = new Date();
  const lastTimestamp = new Date(lastStatus.timestamp);
  
  return formatDuration(lastStatus.timestamp, now.toISOString());
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getStatusColor = (status: string): string => {
  const colors = {
    'open': 'text-red-700 bg-red-50 border-red-200',
    'acknowledged': 'text-orange-700 bg-orange-50 border-orange-200',
    'team_activated': 'text-blue-700 bg-blue-50 border-blue-200',
    'in_progress': 'text-yellow-700 bg-yellow-50 border-yellow-200',
    'resolved': 'text-green-700 bg-green-50 border-green-200',
    'closed': 'text-gray-700 bg-gray-50 border-gray-200',
  };
  return colors[status as keyof typeof colors] || colors.open;
};




