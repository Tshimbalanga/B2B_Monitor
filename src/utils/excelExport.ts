// Fonction pour exporter les données en format Excel
export const exportToExcel = (data: any[], filters: any) => {
  // Créer le contenu CSV (format Excel compatible)
  let csvContent = '';
  
  // En-têtes
  const headers = [
    'Numéro de facture',
    'Client',
    'Montant',
    'Statut',
    'Date de facture',
    'Date d\'échéance',
    'Période',
    'ID Connexion'
  ];

  // Ajouter les en-têtes optionnels
  if (filters.includeAttachments) {
    headers.push('Pièces jointes');
  }
  if (filters.includeNotes) {
    headers.push('Notes');
  }

  csvContent += headers.join(',') + '\n';

  // Données
  data.forEach(invoice => {
    const row = [
      `"${invoice.id}"`,
      `"${invoice.clientName}"`,
      invoice.amount.toFixed(2),
      `"${invoice.status}"`,
      `"${formatDate(invoice.issueDate)}"`,
      `"${formatDate(invoice.dueDate)}"`,
      `"${invoice.period}"`,
      `"${invoice.connectionId}"`
    ];

    // Ajouter les données optionnelles
    if (filters.includeAttachments) {
      const attachmentCount = invoice.attachments ? invoice.attachments.length : 0;
      row.push(attachmentCount.toString());
    }
    if (filters.includeNotes) {
      const notes = invoice.notes || '';
      row.push(`"${notes.replace(/"/g, '""')}"`); // Échapper les guillemets
    }

    csvContent += row.join(',') + '\n';
  });

  // Créer le fichier et le télécharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Générer le nom de fichier
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  let fileName = `factures_export_${dateStr}_${timeStr}`;
  
  if (filters.clientFilter === 'specific' && filters.selectedClient) {
    fileName += `_${filters.selectedClient.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    const fromStr = filters.dateFrom ? filters.dateFrom : 'debut';
    const toStr = filters.dateTo ? filters.dateTo : 'fin';
    fileName += `_${fromStr}_${toStr}`;
  }
  
  fileName += '.csv';

  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Libérer l'URL
  URL.revokeObjectURL(link.href);
};

// Fonction pour formater les dates
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// Fonction pour créer un rapport détaillé
export const createDetailedReport = (data: any[], filters: any) => {
  // Calculer les statistiques
  const totalInvoices = data.length;
  const totalAmount = data.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = data.filter(inv => inv.status === 'paid');
  const pendingInvoices = data.filter(inv => inv.status === 'pending');
  const overdueInvoices = data.filter(inv => inv.status === 'overdue');
  
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Créer le contenu du rapport
  let reportContent = '';
  
  // En-tête du rapport
  reportContent += 'RAPPORT D\'EXPORT DES FACTURES\n';
  reportContent += '================================\n\n';
  
  // Informations sur les filtres
  reportContent += 'CRITÈRES D\'EXPORT:\n';
  reportContent += `- Période: ${filters.dateFrom || 'Début'} à ${filters.dateTo || 'Fin'}\n`;
  reportContent += `- Clients: ${filters.clientFilter === 'all' ? 'Tous' : filters.selectedClient}\n`;
  reportContent += `- Pièces jointes incluses: ${filters.includeAttachments ? 'Oui' : 'Non'}\n`;
  reportContent += `- Notes incluses: ${filters.includeNotes ? 'Oui' : 'Non'}\n\n`;
  
  // Statistiques
  reportContent += 'STATISTIQUES:\n';
  reportContent += `- Nombre total de factures: ${totalInvoices}\n`;
  reportContent += `- Montant total: $${totalAmount.toFixed(2)}\n`;
  reportContent += `- Factures payées: ${paidInvoices.length} ($${paidAmount.toFixed(2)})\n`;
  reportContent += `- Factures en attente: ${pendingInvoices.length} ($${pendingAmount.toFixed(2)})\n`;
  reportContent += `- Factures en retard: ${overdueInvoices.length} ($${overdueAmount.toFixed(2)})\n\n`;
  
  // Taux de paiement
  const paymentRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  reportContent += `- Taux de paiement: ${paymentRate.toFixed(1)}%\n\n`;
  
  // Détail par client (si applicable)
  if (filters.clientFilter === 'all') {
    const clientStats = data.reduce((acc, inv) => {
      if (!acc[inv.clientName]) {
        acc[inv.clientName] = { count: 0, amount: 0 };
      }
      acc[inv.clientName].count++;
      acc[inv.clientName].amount += inv.amount;
      return acc;
    }, {} as any);
    
    reportContent += 'DÉTAIL PAR CLIENT:\n';
    Object.entries(clientStats).forEach(([client, stats]: [string, any]) => {
      reportContent += `- ${client}: ${stats.count} facture(s), $${stats.amount.toFixed(2)}\n`;
    });
    reportContent += '\n';
  }
  
  // Date de génération
  reportContent += `Rapport généré le: ${new Date().toLocaleString('fr-FR')}\n`;
  
  return reportContent;
};

// Fonction pour exporter le rapport détaillé
export const exportDetailedReport = (data: any[], filters: any) => {
  const reportContent = createDetailedReport(data, filters);
  
  // Créer le fichier et le télécharger
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Générer le nom de fichier
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  let fileName = `rapport_factures_${dateStr}_${timeStr}`;
  
  if (filters.clientFilter === 'specific' && filters.selectedClient) {
    fileName += `_${filters.selectedClient.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  fileName += '.txt';

  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Libérer l'URL
  URL.revokeObjectURL(link.href);
};




