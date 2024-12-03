import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { motion } from 'framer-motion';

const ExportModal = ({ open, onClose, history }) => {
  const theme = useTheme();
  const [exportConfig, setExportConfig] = useState({
    format: 'json',
    includeDate: true,
    includeTime: true,
    onlyResults: false,
  });

  const handleExport = () => {
    try {
      let content = '';
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();

      if (exportConfig.format === 'csv') {
        const headers = ['Operación'];
        if (exportConfig.includeDate) headers.push('Fecha');
        if (exportConfig.includeTime) headers.push('Hora');

        content = headers.join(',') + '\n';
        content += history
          .map(op => {
            let line = [];
            if (exportConfig.onlyResults) {
              const result = typeof op === 'string' 
                ? op.split('=')[1]?.trim() || op
                : op.result || op;
              line.push(result);
            } else {
              line.push(typeof op === 'string' ? op : op.operation);
            }
            if (exportConfig.includeDate) line.push(date);
            if (exportConfig.includeTime) line.push(time);
            return line.join(',');
          })
          .join('\n');
      } else {
        const exportData = history.map(op => ({
          operation: typeof op === 'string' ? op : op.operation,
          result: typeof op === 'string' 
            ? op.split('=')[1]?.trim() 
            : op.result,
          date: exportConfig.includeDate ? date : undefined,
          time: exportConfig.includeTime ? time : undefined,
        }));

        content = JSON.stringify(exportData, null, 2);
      }

      const blob = new Blob(
        [content], 
        { type: exportConfig.format === 'csv' ? 'text/csv' : 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calculadora_historial_${date.replace(/\//g, '-')}.${exportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
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
        Exportar Historial
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Formato de exportación
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['json', 'csv'].map((format) => (
                <Button
                  key={format}
                  variant={exportConfig.format === format ? "contained" : "outlined"}
                  onClick={() => setExportConfig(prev => ({ ...prev, format }))}
                  sx={{ flex: 1 }}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Opciones
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={exportConfig.includeDate}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeDate: e.target.checked }))}
                  />
                }
                label="Incluir fecha"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={exportConfig.includeTime}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeTime: e.target.checked }))}
                  />
                }
                label="Incluir hora"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={exportConfig.onlyResults}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, onlyResults: e.target.checked }))}
                  />
                }
                label="Solo resultados"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleExport}
          startIcon={<FileDownloadIcon />}
        >
          Exportar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal; 