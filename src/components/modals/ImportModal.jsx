import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { motion } from 'framer-motion';

const ImportModal = ({ open, onClose }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          // Aquí puedes procesar el contenido importado
          onClose();
        } catch (error) {
          console.error('Error al importar el archivo:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.2 },
        sx: {
          borderRadius: 2,
          background: theme.palette.background.paper,
          maxWidth: 'sm',
          width: '100%',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Importar Historial
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Selecciona un archivo JSON o CSV para importar el historial de operaciones.
        </DialogContentText>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 3,
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main,
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUploadIcon 
            sx={{ 
              fontSize: 48,
              color: theme.palette.primary.main,
              opacity: 0.7,
            }} 
          />
          <DialogContentText sx={{ textAlign: 'center' }}>
            Arrastra y suelta tu archivo aquí<br />
            o haz clic para seleccionarlo
          </DialogContentText>
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept=".json,.csv"
            onChange={handleImport}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal; 