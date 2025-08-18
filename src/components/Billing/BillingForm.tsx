import React, { useState } from 'react';
import { X, Calendar, User, Building, DollarSign, FileText, Plus, Trash2, Upload, Paperclip } from 'lucide-react';
import { dialogService } from '../../services/dialogService';

interface BillingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (billingData: any) => void;
}

const BillingForm: React.FC<BillingFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    billingAddress: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ],
    subtotal: 0,
    taxRate: 16, // TVA RDC
    taxAmount: 0,
    total: 0,
    notes: '',
    paymentTerms: '30 jours',
    currency: 'USD',
    attachments: [] as File[]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FACT-${year}${month}-${random}`;
  };

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculer le total de l'item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = calculateItemTotal(
        field === 'quantity' ? value : newItems[index].quantity,
        field === 'unitPrice' ? value : newItems[index].unitPrice
      );
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    
    // Recalculer les totaux
    setTimeout(calculateTotals, 0);
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      setTimeout(calculateTotals, 0);
    }
  };

  // Fonctions pour gérer les fichiers joints
  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      
      // Validation des fichiers
      const validFiles = newFiles.filter(file => {
        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          dialogService.error('Fichier Trop Volumineux', `Le fichier ${file.name} est trop volumineux. Taille maximale: 10MB`);
          return false;
        }
        
        // Vérifier le type de fichier
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          dialogService.error('Type de Fichier Non Supporté', `Le type de fichier ${file.name} n'est pas supporté.`);
          return false;
        }
        
        return true;
      });
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }
    
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email du client est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Format d\'email invalide';
    }
    
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'La date de facture est requise';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est requise';
    }
    
    // Vérifier les items
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item${index}Description`] = 'La description est requise';
      }
      if (item.quantity <= 0) {
        newErrors[`item${index}Quantity`] = 'La quantité doit être supérieure à 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item${index}UnitPrice`] = 'Le prix unitaire ne peut pas être négatif';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const billingData = {
        ...formData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        invoiceNumber: formData.invoiceNumber || generateInvoiceNumber()
      };
      
      onSubmit(billingData);
      onClose();
      
             // Reset form
       setFormData({
         clientName: '',
         clientEmail: '',
         clientPhone: '',
         billingAddress: '',
         invoiceNumber: '',
         invoiceDate: new Date().toISOString().split('T')[0],
         dueDate: '',
         items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
         subtotal: 0,
         taxRate: 16,
         taxAmount: 0,
         total: 0,
         notes: '',
         paymentTerms: '30 jours',
         currency: 'USD',
         attachments: []
       });
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DollarSign size={24} style={{ color: '#059669' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Nouvelle Facture
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Créer une nouvelle facture pour un client
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#9ca3af'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Informations client */}
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: '#6b7280' }} />
                Informations Client
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${errors.clientName ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="Nom complet du client"
                  />
                  {errors.clientName && (
                    <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.clientName}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${errors.clientEmail ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="email@exemple.com"
                  />
                  {errors.clientEmail && (
                    <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.clientEmail}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Adresse de facturation
                  </label>
                  <textarea
                    value={formData.billingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Adresse complète du client"
                  />
                </div>
              </div>
            </div>

            {/* Informations facture */}
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: '#6b7280' }} />
                Informations Facture
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder={generateInvoiceNumber()}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Date de facture *
                    </label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.invoiceDate ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.invoiceDate && (
                      <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.invoiceDate}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Date d'échéance *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.dueDate ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.dueDate && (
                      <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.dueDate}</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Conditions de paiement
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="immediate">Paiement immédiat</option>
                      <option value="7 jours">7 jours</option>
                      <option value="15 jours">15 jours</option>
                      <option value="30 jours">30 jours</option>
                      <option value="45 jours">45 jours</option>
                      <option value="60 jours">60 jours</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Devise
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CDF">CDF (FC)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Articles / Services
              </h3>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <Plus size={16} />
                Ajouter un article
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.items.map((item, index) => (
                <div key={item.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: '12px',
                  alignItems: 'end',
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Description *
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors[`item${index}Description`] ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Description de l'article ou service"
                    />
                    {errors[`item${index}Description`] && (
                      <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors[`item${index}Description`]}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Quantité *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors[`item${index}Quantity`] ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors[`item${index}Quantity`] && (
                      <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors[`item${index}Quantity`]}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors[`item${index}UnitPrice`] ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors[`item${index}UnitPrice`] && (
                      <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors[`item${index}UnitPrice`]}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Total
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'FC'} {item.total.toFixed(2)}
                    </div>
                  </div>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Résumé
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Sous-total:</span>
                <span style={{ fontWeight: '600' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'FC'} {formData.subtotal.toFixed(2)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>TVA ({formData.taxRate}%):</span>
                <span style={{ fontWeight: '600' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'FC'} {formData.taxAmount.toFixed(2)}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '18px', 
                fontWeight: 'bold',
                paddingTop: '12px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <span style={{ color: '#111827' }}>Total:</span>
                <span style={{ color: '#059669' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'FC'} {formData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Pièces jointes */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={20} style={{ color: '#6b7280' }} />
              Pièces jointes
            </h3>
            
            {/* Zone de dépôt */}
            <div
              style={{
                border: `2px dashed ${dragActive ? '#059669' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: dragActive ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={32} style={{ color: '#6b7280', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
                Glissez-déposez vos fichiers ici
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                ou cliquez pour sélectionner des fichiers
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <Upload size={16} />
                Sélectionner des fichiers
              </label>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB par fichier)
              </p>
            </div>

            {/* Liste des fichiers joints */}
            {formData.attachments.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                  Fichiers joints ({formData.attachments.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} style={{ color: '#6b7280' }} />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                            {file.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Notes, conditions spéciales, ou informations supplémentaires..."
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              Créer la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
