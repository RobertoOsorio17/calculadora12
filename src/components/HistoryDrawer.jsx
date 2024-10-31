import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  Divider,
  useTheme,
  Fab,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Grid,
  Switch,
  Snackbar
} from '@mui/material';
import {
  History as HistoryIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryDrawer = ({ 
  open, 
  onClose, 
  history, 
  onSelectOperation, 
  onDeleteOperation,
  onToggleFavorite,
  onCopyResult,
  onImportData
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeDate: true,
    includeFavorites: true,
    includeType: true
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Categorizar operaciones
  const categorizedHistory = useMemo(() => {
    return history.map(op => {
      const operation = typeof op === 'string' ? op : op.operation;
      return {
        operation,
        type: operation && (
          operation.includes('sin') || operation.includes('cos') || operation.includes('tan') 
            ? 'scientific' 
            : operation.includes('√') || operation.includes('²') 
              ? 'advanced' 
              : 'basic'
        ),
        date: op.timestamp || new Date(),
        isFavorite: op.isFavorite || false
      };
    });
  }, [history]);

  // Filtrar operaciones
  const filteredHistory = useMemo(() => {
    let filtered = categorizedHistory;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(op => 
        op.operation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tab
    switch (activeTab) {
      case 1: // Favoritos
        filtered = filtered.filter(op => op.isFavorite === true);
        break;
      case 2: // Científicas
        filtered = filtered.filter(op => op.type === 'scientific');
        break;
      case 3: // Básicas
        filtered = filtered.filter(op => op.type === 'basic');
        break;
      default:
        break;
    }

    return filtered;
  }, [categorizedHistory, searchTerm, activeTab]);

  const ListItemComponent = motion(ListItem);

  const handleExport = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    let content = '';

    if (exportConfig.format === 'csv') {
      const headers = ['Operación'];
      if (exportConfig.includeDate) headers.push('Fecha');
      if (exportConfig.includeFavorites) headers.push('Favorito');
      if (exportConfig.includeType) headers.push('Tipo');
      
      content = headers.join(',') + '\n';
      content += filteredHistory
        .map(op => {
          let row = [op.operation];
          if (exportConfig.includeDate) row.push(new Date(op.date).toLocaleString());
          if (exportConfig.includeFavorites) row.push(op.isFavorite ? 'Sí' : 'No');
          if (exportConfig.includeType) row.push(op.type);
          return row.join(',');
        })
        .join('\n');
    } else {
      content = JSON.stringify(filteredHistory, null, 2);
    }

    downloadFile(
      content,
      `calculadora_historial_${date}_${time}.${exportConfig.format}`,
      exportConfig.format === 'csv' ? 'text/csv' : 'application/json'
    );
    setShowExportModal(false);
  };

  const handleImport = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        handleError('No se seleccionó ningún archivo');
        return;
      }

      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        handleError('Formato de archivo no válido');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let importedData;
          if (file.name.endsWith('.csv')) {
            // Procesar CSV
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            importedData = lines.slice(1).map(line => {
              const values = line.split(',');
              return {
                operation: values[0],
                date: new Date(),
                isFavorite: values.includes('Sí'),
                type: values[values.length - 1] || 'basic'
              };
            });
          } else {
            // Procesar JSON
            importedData = JSON.parse(e.target.result);
          }
          onImportData(importedData);
          setShowImportModal(false);
        } catch (error) {
          handleError('Error al procesar el archivo');
          console.error('Error en importación:', error);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      handleError('Error al procesar el archivo');
      console.error('Error en importación:', err);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
            : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Badge badgeContent={filteredHistory.length} color="primary">
            <HistoryIcon sx={{ fontSize: 28 }} />
          </Badge>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Historial
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Búsqueda y Filtros */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar operaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label="Todo" />
            <Tab 
              icon={<StarIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Favoritos" 
            />
            <Tab label="Científicas" />
            <Tab label="Básicas" />
          </Tabs>
        </Box>

        {/* Lista de operaciones */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
          <AnimatePresence>
            {filteredHistory.length > 0 ? (
              <List>
                {filteredHistory.map((op, index) => (
                  <ListItemComponent
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      cursor: isEditMode ? 'default' : 'pointer',
                      '&:hover': {
                        bgcolor: isEditMode ? 'transparent' : 'action.hover'
                      }
                    }}
                  >
                    {isEditMode && (
                      <Box sx={{ minWidth: 42, display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={selectedOperations.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperations(prev => [...prev, index]);
                            } else {
                              setSelectedOperations(prev => prev.filter(i => i !== index));
                            }
                          }}
                          size="small"
                        />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" component="span" noWrap>
                              {op.operation}
                            </Typography>
                            <Chip 
                              size="small"
                              label={op.type}
                              color={op.type === 'scientific' ? 'secondary' : 'primary'}
                            />
                          </Box>
                        }
                        secondary={new Date(op.date).toLocaleString()}
                        onClick={() => !isEditMode && onSelectOperation(op)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Favorito">
                        <IconButton size="small" onClick={() => onToggleFavorite(index)}>
                          {op.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copiar">
                        <IconButton size="small" onClick={() => onCopyResult(op)}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      {!isEditMode && (
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => onDeleteOperation(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItemComponent>
                ))}
              </List>
            ) : (
              <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                opacity: 0.5
              }}>
                <HistoryIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">
                  No hay operaciones
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={() => setShowImportModal(true)}
            size="small"
          >
            Importar
          </Button>
          {filteredHistory.length > 0 && (
            <>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => setShowExportModal(true)}
                size="small"
              >
                Exportar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDeleteOperation('all')}
                size="small"
              >
                Vaciar
              </Button>
              <Button
                variant="outlined"
                startIcon={isEditMode ? (selectedOperations.length > 0 ? <DeleteIcon /> : <CloseIcon />) : <EditIcon />}
                onClick={() => {
                  if (isEditMode) {
                    if (selectedOperations.length > 0) {
                      // Llamar a onDeleteOperation con los índices seleccionados
                      onDeleteOperation(selectedOperations);
                      setSelectedOperations([]);
                    }
                    setIsEditMode(false);
                  } else {
                    setIsEditMode(true);
                  }
                }}
                size="small"
              >
                {isEditMode 
                  ? selectedOperations.length > 0 
                    ? 'Eliminar' 
                    : 'Cancelar'
                  : 'Editar'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={showExportModal} onClose={() => setShowExportModal(false)}>
        <DialogTitle>Exportar Historial</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Formato de exportación
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['csv', 'json'].map((format) => (
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                      checked={exportConfig.includeFavorites}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeFavorites: e.target.checked }))}
                    />
                  }
                  label="Incluir favoritos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={exportConfig.includeType}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeType: e.target.checked }))}
                    />
                  }
                  label="Incluir tipo de operación"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportModal(false)}>Cancelar</Button>
          <Button onClick={handleExport} variant="contained">Exportar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showImportModal} onClose={() => setShowImportModal(false)}>
        <DialogTitle>Importar Historial</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selecciona un archivo CSV o JSON para importar el historial
          </Typography>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-file"
          />
          <label htmlFor="import-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<FileUploadIcon />}
              fullWidth
            >
              Seleccionar archivo
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportModal(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: theme.palette.error.main,
            color: 'white'
          }
        }}
      />
    </Drawer>
  );
};

export default HistoryDrawer; 