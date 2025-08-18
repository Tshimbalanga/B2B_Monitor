import React, { useState, useEffect } from 'react';
import CustomDialog, { DialogConfig } from './CustomDialog';
import { dialogService } from '../../services/dialogService';

const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = dialogService.subscribe((config) => {
      setDialogConfig(config);
      setIsOpen(true);
    });

    return unsubscribe;
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setDialogConfig(null);
  };

  return (
    <>
      {children}
      {dialogConfig && (
        <CustomDialog
          isOpen={isOpen}
          config={dialogConfig}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default DialogProvider;
