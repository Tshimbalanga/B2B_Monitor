export interface TicketAutoManagementConfig {
  // Configuration pour la clôture automatique des tickets résolus
  autoCloseResolvedAfterHours: number; // 48h par défaut
  
  // Configuration pour l'alerte des tickets non traités
  alertUnprocessedAfterHours: number; // 5h par défaut
  
  // Configuration pour les équipes autorisées à clôturer
  allowedCloseTeams: string[]; // ['NOC', 'SAV']
}

export const DEFAULT_CONFIG: TicketAutoManagementConfig = {
  autoCloseResolvedAfterHours: 48,
  alertUnprocessedAfterHours: 5,
  allowedCloseTeams: ['NOC', 'SAV']
};

export interface TicketStatus {
  id: string;
  status: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  activatedTeam?: string;
  clientName: string;
  title: string;
  slaDeadline: string;
}

export interface AutoManagementResult {
  ticketsToClose: TicketStatus[];
  ticketsToAlert: TicketStatus[];
  alerts: string[];
}

/**
 * Vérifie si un ticket doit être clôturé automatiquement
 */
export const shouldAutoCloseTicket = (
  ticket: TicketStatus, 
  config: TicketAutoManagementConfig = DEFAULT_CONFIG
): boolean => {
  if (ticket.status !== 'resolved') return false;
  if (!ticket.resolvedAt) return false;
  
  const resolvedTime = new Date(ticket.resolvedAt);
  const now = new Date();
  const hoursSinceResolved = (now.getTime() - resolvedTime.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceResolved >= config.autoCloseResolvedAfterHours;
};

/**
 * Vérifie si un ticket doit générer une alerte pour non-traitement
 */
export const shouldAlertUnprocessedTicket = (
  ticket: TicketStatus,
  config: TicketAutoManagementConfig = DEFAULT_CONFIG
): boolean => {
  if (ticket.status !== 'in_progress') return false;
  if (!ticket.acknowledgedAt) return false;
  
  // Vérifier si c'est un ticket assigné à BO ou FME
  const isBOorFME = ticket.assignedTo === 'BO' || ticket.assignedTo === 'FME' || 
                   ticket.activatedTeam === 'BO' || ticket.activatedTeam === 'FME';
  
  if (!isBOorFME) return false;
  
  const acknowledgedTime = new Date(ticket.acknowledgedAt);
  const now = new Date();
  const hoursSinceAcknowledged = (now.getTime() - acknowledgedTime.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceAcknowledged >= config.alertUnprocessedAfterHours;
};

/**
 * Analyse tous les tickets et retourne les actions à effectuer
 */
export const analyzeTicketsForAutoManagement = (
  tickets: TicketStatus[],
  config: TicketAutoManagementConfig = DEFAULT_CONFIG
): AutoManagementResult => {
  const ticketsToClose: TicketStatus[] = [];
  const ticketsToAlert: TicketStatus[] = [];
  const alerts: string[] = [];
  
  tickets.forEach(ticket => {
    // Vérifier la clôture automatique
    if (shouldAutoCloseTicket(ticket, config)) {
      ticketsToClose.push(ticket);
      alerts.push(`Ticket ${ticket.id} (${ticket.title}) sera clôturé automatiquement - résolu depuis plus de ${config.autoCloseResolvedAfterHours}h`);
    }
    
    // Vérifier les alertes de non-traitement
    if (shouldAlertUnprocessedTicket(ticket, config)) {
      ticketsToAlert.push(ticket);
      alerts.push(`ALERTE: Ticket ${ticket.id} (${ticket.title}) non traité depuis plus de ${config.alertUnprocessedAfterHours}h par ${ticket.assignedTo || ticket.activatedTeam}`);
    }
  });
  
  return {
    ticketsToClose,
    ticketsToAlert,
    alerts
  };
};

/**
 * Formate la durée en heures et minutes
 */
export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

/**
 * Calcule le temps écoulé depuis une date donnée
 */
export const getTimeSince = (dateString: string): { hours: number; formatted: string } => {
  const date = new Date(dateString);
  const now = new Date();
  const hours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  return {
    hours,
    formatted: formatDuration(hours)
  };
};

/**
 * Génère un message d'alerte pour un ticket non traité
 */
export const generateUnprocessedAlertMessage = (ticket: TicketStatus): string => {
  const timeSince = getTimeSince(ticket.acknowledgedAt!);
  const team = ticket.assignedTo || ticket.activatedTeam;
  
  return `🚨 ALERTE: Ticket ${ticket.id} non traité depuis ${timeSince.formatted}
  
📋 Détails:
• Titre: ${ticket.title}
• Client: ${ticket.clientName}
• Équipe responsable: ${team}
• Accepté le: ${new Date(ticket.acknowledgedAt!).toLocaleString('fr-FR')}
• Échéance SLA: ${new Date(ticket.slaDeadline).toLocaleString('fr-FR')}

⚠️ Action requise: Traitement immédiat du ticket`;
};

/**
 * Génère un message de clôture automatique
 */
export const generateAutoCloseMessage = (ticket: TicketStatus): string => {
  const timeSince = getTimeSince(ticket.resolvedAt!);
  
  return `✅ CLÔTURE AUTOMATIQUE: Ticket ${ticket.id} clôturé automatiquement
  
📋 Détails:
• Titre: ${ticket.title}
• Client: ${ticket.clientName}
• Résolu le: ${new Date(ticket.resolvedAt!).toLocaleString('fr-FR')}
• Temps écoulé depuis résolution: ${timeSince.formatted}

🔒 Le ticket a été automatiquement clôturé après 48h de résolution`;
};




