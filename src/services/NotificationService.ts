import { Incident, User, Request } from '../types';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  type: 'client' | 'sav' | 'team';
}

export interface NotificationLog {
  id: string;
  ticketId: string;
  step: string;
  recipients: NotificationRecipient[];
  template: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  channel: 'email' | 'sms' | 'both';
  content: string;
}

class NotificationService {
  private notificationLogs: NotificationLog[] = [];

  // Templates de notifications pour les tickets
  private ticketTemplates: NotificationTemplate[] = [
    // Email - Ticket créé
    {
      id: 'ticket_created_email',
      name: 'Ticket Créé - Email',
      type: 'email',
      subject: 'Nouveau ticket #{ticket_id} créé - {client_name}',
      content: `Bonjour {client_name},

Un nouveau ticket a été créé pour votre service.

Détails du ticket :
- Numéro : {ticket_id}
- Titre : {ticket_title}
- Description : {ticket_description}
- Priorité : {priority}
- Gravité : {severity}
- Date de création : {created_date}

Nos équipes techniques ont été notifiées et travaillent activement à la résolution de ce problème.

Nous vous tiendrons informés de l'évolution de la situation.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'ticket_title', 'ticket_description', 'priority', 'severity', 'created_date']
    },

    // SMS - Ticket créé
    {
      id: 'ticket_created_sms',
      name: 'Ticket Créé - SMS',
      type: 'sms',
      content: 'Orange: Ticket #{ticket_id} créé pour {client_name}. Priorité: {priority}. Nos équipes sont mobilisées.',
      variables: ['ticket_id', 'client_name', 'priority']
    },

    // Email - Ticket acquitté
    {
      id: 'ticket_acknowledged_email',
      name: 'Ticket Acquitté - Email',
      type: 'email',
      subject: 'Ticket #{ticket_id} acquitté - {client_name}',
      content: `Bonjour {client_name},

Votre ticket #{ticket_id} a été acquitté par nos équipes techniques.

Détails :
- Numéro : {ticket_id}
- Acquitté par : {acknowledged_by}
- Date d'acquittement : {acknowledged_date}
- Équipe assignée : {assigned_team}

Nos techniciens analysent actuellement le problème et vous tiendront informés des prochaines étapes.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'acknowledged_by', 'acknowledged_date', 'assigned_team']
    },

    // SMS - Ticket acquitté
    {
      id: 'ticket_acknowledged_sms',
      name: 'Ticket Acquitté - SMS',
      type: 'sms',
      content: 'Orange: Ticket #{ticket_id} acquitté par {acknowledged_by}. Équipe {assigned_team} mobilisée.',
      variables: ['ticket_id', 'acknowledged_by', 'assigned_team']
    },

    // Email - Équipe activée
    {
      id: 'team_activated_email',
      name: 'Équipe Activée - Email',
      type: 'email',
      subject: 'Équipe technique activée - Ticket #{ticket_id}',
      content: `Bonjour {client_name},

L'équipe technique a été activée pour résoudre votre ticket #{ticket_id}.

Détails :
- Numéro : {ticket_id}
- Équipe activée : {activated_team}
- Date d'activation : {activated_date}
- Technicien responsable : {technician_name}

L'intervention est en cours. Nous vous informerons dès que le problème sera résolu.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'activated_team', 'activated_date', 'technician_name']
    },

    // SMS - Équipe activée
    {
      id: 'team_activated_sms',
      name: 'Équipe Activée - SMS',
      type: 'sms',
      content: 'Orange: Équipe {activated_team} activée pour ticket #{ticket_id}. Intervention en cours.',
      variables: ['activated_team', 'ticket_id']
    },

    // Email - Ticket en cours
    {
      id: 'ticket_in_progress_email',
      name: 'Ticket en Cours - Email',
      type: 'email',
      subject: 'Intervention en cours - Ticket #{ticket_id}',
      content: `Bonjour {client_name},

L'intervention sur votre ticket #{ticket_id} est en cours.

Détails :
- Numéro : {ticket_id}
- Statut : Intervention en cours
- Technicien : {technician_name}
- Dernière mise à jour : {last_update}
- Commentaire : {comment}

Nous vous tiendrons informés de l'avancement.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'technician_name', 'last_update', 'comment']
    },

    // SMS - Ticket en cours
    {
      id: 'ticket_in_progress_sms',
      name: 'Ticket en Cours - SMS',
      type: 'sms',
      content: 'Orange: Intervention en cours sur ticket #{ticket_id}. Technicien {technician_name} sur place.',
      variables: ['ticket_id', 'technician_name']
    },

    // Email - Ticket résolu
    {
      id: 'ticket_resolved_email',
      name: 'Ticket Résolu - Email',
      type: 'email',
      subject: 'Problème résolu - Ticket #{ticket_id}',
      content: `Bonjour {client_name},

Votre ticket #{ticket_id} a été résolu avec succès.

Détails :
- Numéro : {ticket_id}
- Date de résolution : {resolved_date}
- Résolu par : {resolved_by}
- Solution appliquée : {resolution}
- Temps de résolution : {resolution_time}

Votre service est maintenant opérationnel. Merci de votre patience.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'resolved_date', 'resolved_by', 'resolution', 'resolution_time']
    },

    // SMS - Ticket résolu
    {
      id: 'ticket_resolved_sms',
      name: 'Ticket Résolu - SMS',
      type: 'sms',
      content: 'Orange: Ticket #{ticket_id} résolu. Service opérationnel. Temps: {resolution_time}.',
      variables: ['ticket_id', 'resolution_time']
    },

    // Email - Ticket fermé
    {
      id: 'ticket_closed_email',
      name: 'Ticket Fermé - Email',
      type: 'email',
      subject: 'Ticket #{ticket_id} fermé - {client_name}',
      content: `Bonjour {client_name},

Votre ticket #{ticket_id} a été fermé.

Détails :
- Numéro : {ticket_id}
- Date de fermeture : {closed_date}
- Fermé par : {closed_by}
- Résumé : {summary}

Si vous rencontrez d'autres problèmes, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Orange Business Services`,
      variables: ['ticket_id', 'client_name', 'closed_date', 'closed_by', 'summary']
    },

    // SMS - Ticket fermé
    {
      id: 'ticket_closed_sms',
      name: 'Ticket Fermé - SMS',
      type: 'sms',
      content: 'Orange: Ticket #{ticket_id} fermé. Merci de votre confiance.',
      variables: ['ticket_id']
    },

    // Email - Notification SAV
    {
      id: 'sav_notification_email',
      name: 'Notification SAV - Email',
      type: 'email',
      subject: 'Nouveau ticket #{ticket_id} - Action requise',
      content: `Bonjour {sav_name},

Un nouveau ticket nécessite votre intervention.

Détails du ticket :
- Numéro : {ticket_id}
- Client : {client_name}
- Titre : {ticket_title}
- Description : {ticket_description}
- Priorité : {priority}
- Gravité : {severity}
- Date de création : {created_date}

Veuillez traiter ce ticket dans les plus brefs délais.

Cordialement,
Système de notifications`,
      variables: ['sav_name', 'ticket_id', 'client_name', 'ticket_title', 'ticket_description', 'priority', 'severity', 'created_date']
    },

    // SMS - Notification SAV
    {
      id: 'sav_notification_sms',
      name: 'Notification SAV - SMS',
      type: 'sms',
      content: 'Orange SAV: Nouveau ticket #{ticket_id} - {client_name}. Priorité: {priority}. Action requise.',
      variables: ['ticket_id', 'client_name', 'priority']
    }
  ];

  // Obtenir les destinataires pour un ticket selon l'étape
  private getRecipients(ticket: Incident, step: string): NotificationRecipient[] {
    const recipients: NotificationRecipient[] = [];

    // Ajouter le client (seulement pour résolution et fermeture)
    if (ticket.clientName && (step === 'resolved' || step === 'closed')) {
      recipients.push({
        id: 'client',
        name: ticket.clientName,
        email: `${ticket.clientName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
        phone: '+243999999999', // Numéro fictif
        role: 'client',
        type: 'client'
      });
    }

    // Équipes disponibles
    const allTeams = [
      { id: 'sav-1', name: 'Marc SAV', email: 'marc.sav@orange.com', phone: '+243888888888', role: 'SAV', type: 'sav' },
      { id: 'sav-2', name: 'Pierre Durand', email: 'pierre.durand@orange.com', phone: '+243777777777', role: 'SAV', type: 'sav' },
      { id: 'bo-1', name: 'Nathalie BO', email: 'nathalie.bo@orange.com', phone: '+243666666666', role: 'BO', type: 'sav' },
      { id: 'fme-1', name: 'David FME', email: 'david.fme@orange.com', phone: '+243555555555', role: 'FME', type: 'sav' },
      { id: 'noc-1', name: 'Caroline NOC', email: 'caroline.noc@orange.com', phone: '+243444444444', role: 'NOC', type: 'sav' }
    ];

    // Logique selon l'étape
    switch (step) {
      case 'created':
        // Ticket créé : notifier tous les SAV
        recipients.push(...allTeams.filter(member => member.role === 'SAV'));
        break;

      case 'acknowledged':
        // Ticket acquitté : SAV + NOC (si NOC a assigné le ticket)
        recipients.push(...allTeams.filter(member => member.role === 'SAV'));
        // Ajouter NOC seulement si c'est le NOC qui a assigné le ticket
        if (ticket.assignedTo === 'NOC' || ticket.activatedTeam === 'NOC') {
          recipients.push(...allTeams.filter(member => member.role === 'NOC'));
        }
        break;

      case 'team_activated':
        // Équipe activée : seulement l'équipe concernée
        if (ticket.activatedTeam) {
          recipients.push(...allTeams.filter(member => member.role === ticket.activatedTeam));
        }
        break;

      case 'in_progress':
        // En cours : seulement l'équipe concernée
        if (ticket.activatedTeam) {
          recipients.push(...allTeams.filter(member => member.role === ticket.activatedTeam));
        }
        break;

      case 'resolved':
        // Résolu : Client + SAV
        recipients.push(...allTeams.filter(member => member.role === 'SAV'));
        break;

      case 'closed':
        // Fermé : Client + SAV
        recipients.push(...allTeams.filter(member => member.role === 'SAV'));
        break;

      default:
        // Par défaut : SAV
        recipients.push(...allTeams.filter(member => member.role === 'SAV'));
    }

    return recipients;
  }

  // Remplacer les variables dans un template
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }

  // Envoyer une notification
  private async sendNotification(
    template: NotificationTemplate,
    recipients: NotificationRecipient[],
    variables: Record<string, string>,
    ticketId: string,
    step: string
  ): Promise<void> {
    const content = this.replaceVariables(template.content, variables);
    const subject = template.subject ? this.replaceVariables(template.subject, variables) : '';

    // Simuler l'envoi
    console.log(`📧 Envoi ${template.type} - ${template.name}`);
    console.log(`📨 Destinataires: ${recipients.map(r => r.email).join(', ')}`);
    console.log(`📱 Sujet: ${subject}`);
    console.log(`📄 Contenu: ${content}`);

    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enregistrer dans les logs
    const log: NotificationLog = {
      id: `notif-${Date.now()}`,
      ticketId,
      step,
      recipients,
      template: template.name,
      sentAt: new Date().toISOString(),
      status: 'sent',
      channel: template.type,
      content
    };

    this.notificationLogs.push(log);
    console.log(`✅ Notification envoyée avec succès: ${log.id}`);
  }

  // Notifier pour une étape de ticket
  public async notifyTicketStep(ticket: Incident, step: string, additionalData?: Record<string, string>): Promise<void> {
    console.log(`🔔 Notification pour ticket ${ticket.id} - étape: ${step}`);

    const recipients = this.getRecipients(ticket, step);
    
    // Log détaillé des destinataires
    console.log(`📋 Destinataires pour l'étape ${step}:`);
    recipients.forEach(recipient => {
      console.log(`  - ${recipient.name} (${recipient.role}) - ${recipient.email}`);
    });
    const baseVariables = {
      ticket_id: ticket.id,
      client_name: ticket.clientName || 'Client',
      ticket_title: ticket.title || 'Sans titre',
      ticket_description: ticket.description || 'Aucune description',
      priority: ticket.priority || 'Normal',
      severity: ticket.severity || 'Normal',
      created_date: new Date(ticket.reportedDate).toLocaleString('fr-FR'),
      acknowledged_by: ticket.acknowledgedBy || 'Système',
      acknowledged_date: ticket.acknowledgedAt ? new Date(ticket.acknowledgedAt).toLocaleString('fr-FR') : 'N/A',
      assigned_team: ticket.activatedTeam || 'SAV',
      activated_team: ticket.activatedTeam || 'SAV',
      activated_date: ticket.activatedAt ? new Date(ticket.activatedAt).toLocaleString('fr-FR') : 'N/A',
      technician_name: ticket.assignedTo || 'Technicien',
      last_update: new Date().toLocaleString('fr-FR'),
      comment: additionalData?.comment || 'Aucun commentaire',
      resolved_date: new Date().toLocaleString('fr-FR'),
      resolved_by: additionalData?.resolvedBy || 'Technicien',
      resolution: additionalData?.resolution || 'Problème résolu',
      resolution_time: additionalData?.resolutionTime || 'N/A',
      closed_date: new Date().toLocaleString('fr-FR'),
      closed_by: additionalData?.closedBy || 'Système',
      summary: additionalData?.summary || 'Ticket fermé',
      sav_name: recipients.find(r => r.type === 'sav')?.name || 'Équipe SAV'
    };

    // Sélectionner les templates selon l'étape
    let templates: NotificationTemplate[] = [];

    switch (step) {
      case 'created':
        // Ticket créé : notification client + notification SAV
        templates = this.ticketTemplates.filter(t => 
          t.id === 'ticket_created_email' || t.id === 'ticket_created_sms' || 
          t.id === 'sav_notification_email' || t.id === 'sav_notification_sms'
        );
        break;
      case 'acknowledged':
        // Ticket acquitté : notification client + notification SAV/NOC
        templates = this.ticketTemplates.filter(t => 
          t.id === 'ticket_acknowledged_email' || t.id === 'ticket_acknowledged_sms' ||
          t.id === 'sav_notification_email' || t.id === 'sav_notification_sms'
        );
        break;
      case 'team_activated':
        // Équipe activée : notification client seulement
        templates = this.ticketTemplates.filter(t => 
          t.id === 'team_activated_email' || t.id === 'team_activated_sms'
        );
        break;
      case 'in_progress':
        // En cours : notification client seulement
        templates = this.ticketTemplates.filter(t => 
          t.id === 'ticket_in_progress_email' || t.id === 'ticket_in_progress_sms'
        );
        break;
      case 'resolved':
        // Résolu : notification client + notification SAV
        templates = this.ticketTemplates.filter(t => 
          t.id === 'ticket_resolved_email' || t.id === 'ticket_resolved_sms' ||
          t.id === 'sav_notification_email' || t.id === 'sav_notification_sms'
        );
        break;
      case 'closed':
        // Fermé : notification client + notification SAV
        templates = this.ticketTemplates.filter(t => 
          t.id === 'ticket_closed_email' || t.id === 'ticket_closed_sms' ||
          t.id === 'sav_notification_email' || t.id === 'sav_notification_sms'
        );
        break;
    }

    // Log des templates sélectionnés
    console.log(`📧 Templates sélectionnés pour l'étape ${step}:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.type})`);
    });

    // Envoyer les notifications
    for (const template of templates) {
      let templateRecipients: NotificationRecipient[] = [];

      if (template.id.includes('sav_notification')) {
        // Notifications SAV : filtrer selon l'étape
        switch (step) {
          case 'created':
            // Ticket créé : tous les SAV
            templateRecipients = recipients.filter(r => r.role === 'SAV');
            break;
          case 'acknowledged':
            // Ticket acquitté : SAV + NOC (si applicable)
            templateRecipients = recipients.filter(r => r.role === 'SAV' || r.role === 'NOC');
            break;
          case 'resolved':
          case 'closed':
            // Résolu/Fermé : tous les SAV
            templateRecipients = recipients.filter(r => r.role === 'SAV');
            break;
          default:
            templateRecipients = recipients.filter(r => r.role === 'SAV');
        }
      } else {
        // Notifications client : seulement les clients
        templateRecipients = recipients.filter(r => r.type === 'client');
      }

      if (templateRecipients.length > 0) {
        await this.sendNotification(template, templateRecipients, baseVariables, ticket.id, step);
      }
    }
  }

  // Obtenir les logs de notifications
  public getNotificationLogs(): NotificationLog[] {
    return this.notificationLogs;
  }

  // Obtenir les logs pour un ticket spécifique
  public getNotificationLogsForTicket(ticketId: string): NotificationLog[] {
    return this.notificationLogs.filter(log => log.ticketId === ticketId);
  }

  // Obtenir les templates disponibles
  public getTemplates(): NotificationTemplate[] {
    return this.ticketTemplates;
  }

  // Tester l'envoi d'une notification
  public async testNotification(templateId: string, testRecipients: NotificationRecipient[]): Promise<void> {
    const template = this.ticketTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trouvé`);
    }

    const testVariables = {
      ticket_id: 'TEST-001',
      client_name: 'Client Test',
      ticket_title: 'Test de notification',
      ticket_description: 'Ceci est un test',
      priority: 'Normal',
      severity: 'Normal',
      created_date: new Date().toLocaleString('fr-FR'),
      acknowledged_by: 'Test User',
      acknowledged_date: new Date().toLocaleString('fr-FR'),
      assigned_team: 'SAV',
      activated_team: 'SAV',
      activated_date: new Date().toLocaleString('fr-FR'),
      technician_name: 'Test Tech',
      last_update: new Date().toLocaleString('fr-FR'),
      comment: 'Test commentaire',
      resolved_date: new Date().toLocaleString('fr-FR'),
      resolved_by: 'Test Tech',
      resolution: 'Test resolution',
      resolution_time: '1 heure',
      closed_date: new Date().toLocaleString('fr-FR'),
      closed_by: 'Test User',
      summary: 'Test summary',
      sav_name: 'Test SAV'
    };

    await this.sendNotification(template, testRecipients, testVariables, 'TEST-001', 'test');
  }
}

export const notificationService = new NotificationService();

// Fonction pour calculer le nombre de notifications pour un utilisateur
export const calculateNotificationCount = (
  user: User | null,
  incidents: Incident[],
  requests: Request[]
): number => {
  if (!user) return 0;

  let count = 0;

  // Notifications pour les tickets selon le rôle de l'utilisateur
  const userIncidents = incidents.filter(incident => {
    // Pour les utilisateurs FME/BO, voir leurs tickets assignés
    if ((user.role === 'maintenance' && user.subDepartment === 'FME') || 
        (user.role === 'maintenance' && user.subDepartment === 'BO')) {
      return incident.assignedTo === user.name;
    }
    
    // Pour les clients, voir leurs propres tickets
    if (user.role === 'client') {
      return incident.clientName === user.name;
    }
    
    // Pour SAV/NOC, voir tous les tickets
    if ((user.role === 'maintenance' && user.subDepartment === 'SAV') || 
        (user.role === 'maintenance' && user.subDepartment === 'NOC')) {
      return true;
    }
    
    return false;
  });

  // Compter les tickets selon le rôle et le statut
  userIncidents.forEach(incident => {
    if (user.role === 'client') {
      // Pour les clients : notifier seulement si le ticket est résolu ou fermé (pour information)
      if (incident.status === 'resolved' || incident.status === 'closed') {
        count++;
      }
    } else if (user.role === 'maintenance') {
      // Pour FME/BO : notifier si le ticket leur est assigné et nécessite une action
      if (incident.assignedTo === user.name) {
        if (incident.status === 'acknowledged' || incident.status === 'in_progress') {
          count++;
        }
      }
      // Pour SAV/NOC : notifier tous les tickets qui nécessitent une action
      if ((user.subDepartment === 'SAV' || user.subDepartment === 'NOC')) {
        if (incident.status === 'open' || incident.status === 'acknowledged' || incident.status === 'in_progress') {
          count++;
        }
      }
    }
  });

  // Notifications pour les demandes de validation
  const userRequests = requests.filter(request => {
    // Pour les commerciaux, voir leurs demandes soumises
    if (user.role === 'commercial') {
      return request.submittedBy === user.name;
    }
    
    // Pour les chefs de projet, voir les demandes en validation
    if (user.role === 'project') {
      return request.status === 'in_validation' || 
             request.status === 'ready_to_start' ||
             request.status === 'in_handover' ||
             request.status === 'deactivation_requested';
    }
    
    // Pour les administrateurs, voir toutes les demandes
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }
    
    return false;
  });

  // Compter les demandes selon le rôle et le statut
  userRequests.forEach(request => {
    if (user.role === 'commercial') {
      // Pour les commerciaux : notifier leurs demandes en attente de validation
      if (request.status === 'pending' || request.status === 'in_validation') {
        count++;
      }
    } else if (user.role === 'project') {
      // Pour les chefs de projet : notifier les demandes qui nécessitent leur validation
      if (request.status === 'in_validation' || 
          request.status === 'ready_to_start' ||
          request.status === 'in_handover' ||
          request.status === 'deactivation_requested') {
        count++;
      }
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      // Pour les administrateurs : notifier toutes les demandes en attente
      if (request.status === 'pending' || 
          request.status === 'in_validation' ||
          request.status === 'ready_to_start' ||
          request.status === 'in_handover' ||
          request.status === 'deactivation_requested') {
        count++;
      }
    }
  });

  return count;
};
