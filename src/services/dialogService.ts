import { DialogConfig } from '../components/common/CustomDialog';

type DialogCallback = (config: DialogConfig) => void;

class DialogService {
  private listeners: DialogCallback[] = [];

  subscribe(callback: DialogCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notify(config: DialogConfig) {
    this.listeners.forEach(listener => listener(config));
  }

  // Success dialog
  success(title: string, message: string, options?: Partial<DialogConfig>) {
    this.notify({
      type: 'success',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }

  // Error dialog
  error(title: string, message: string, options?: Partial<DialogConfig>) {
    this.notify({
      type: 'error',
      title,
      message,
      ...options
    });
  }

  // Warning dialog
  warning(title: string, message: string, options?: Partial<DialogConfig>) {
    this.notify({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  // Info dialog
  info(title: string, message: string, options?: Partial<DialogConfig>) {
    this.notify({
      type: 'info',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }

  // Confirmation dialog
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    options?: Partial<DialogConfig>
  ) {
    this.notify({
      type: 'warning',
      title,
      message,
      showCancel: true,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm,
      onCancel,
      ...options
    });
  }

  // Custom dialog
  show(config: DialogConfig) {
    this.notify(config);
  }
}

export const dialogService = new DialogService();
