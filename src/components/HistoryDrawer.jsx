import React, { useState, useMemo, useEffect, memo } from 'react';
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
  Snackbar,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
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
  FileUpload as FileUploadIcon,
  ShowChart as ShowChartIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  Check as CheckIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryDrawer = memo(({ 
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [error, setError] = useState(null);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeDate: true,
    includeFavorites: true,
    includeType: true
  });

  // Nuevos estados
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'type', 'favorite'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Función para determinar el color según el tipo de operación
  const getTypeColor = (type) => {
    switch (type) {
      case 'scientific':
        return 'secondary';
      case 'equation':
        return 'info';
      case 'graph':
        return 'warning';
      case 'basic':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Memoizar la lista filtrada
  const filteredHistory = useMemo(() => {
    let filtered = [...history];
    
    // Aplicar búsqueda y filtros existentes
    if (searchTerm) {
      filtered = filtered.filter(op => 
        op.operation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenación
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'desc' 
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        case 'type':
          return sortOrder === 'desc'
            ? b.type.localeCompare(a.type)
            : a.type.localeCompare(b.type);
        case 'favorite':
          return sortOrder === 'desc'
            ? (b.isFavorite ? 1 : -1) - (a.isFavorite ? 1 : -1)
            : (a.isFavorite ? 1 : -1) - (b.isFavorite ? 1 : -1);
        default:
          return 0;
      }
    });

    // Aplicar filtros de pestañas
    switch (activeTab) {
      case 1: 
        filtered = filtered.filter(op => op.isFavorite);
        break;
      case 2:
        filtered = filtered.filter(op => op.type === 'scientific');
        break;
      case 3:
        filtered = filtered.filter(op => op.type === 'basic');
        break;
      case 4:
        filtered = filtered.filter(op => op.type === 'graph');
        break;
      default:
        break;
    }
    
    return filtered;
  }, [history, searchTerm, activeTab, sortBy, sortOrder]);

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setActiveTab(0);
      setIsEditMode(false);
      setSelectedOperations([]);
      setShowFilters(false);
      setExportAnchorEl(null);
      setShowExportModal(false);
      setShowImportModal(false);
    }
  }, [open]);

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

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

  const getOperationTypeChip = (type) => {
    const chipStyles = {
      fontSize: '0.7rem',
      height: 20,
      marginLeft: 1
    };

    switch (type) {
      case 'scientific':
        return (
          <Chip 
            label="Científica" 
            size="small" 
            color="primary" 
            sx={{ ...chipStyles, bgcolor: theme.palette.info.main }} 
          />
        );
      case 'advanced':
        return (
          <Chip 
            label="Avanzada" 
            size="small" 
            color="secondary" 
            sx={{ ...chipStyles, bgcolor: theme.palette.success.main }} 
          />
        );
      case 'equation':
        return (
          <Chip 
            label="Ecuación" 
            size="small" 
            sx={{ ...chipStyles, bgcolor: theme.palette.warning.main }} 
          />
        );
      default:
        return (
          <Chip 
            label="Básica" 
            size="small" 
            sx={{ ...chipStyles, bgcolor: theme.palette.grey[500] }} 
          />
        );
    }
  };

  const renderOperation = (op, index) => (
    <ListItem
      key={index}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.5,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
      onClick={(e) => {
        // Solo ejecutar onSelectOperation si no estamos en modo edición
        if (!isEditMode) {
          onSelectOperation(op);
        }
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditMode && (
          <Box onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={selectedOperations.includes(index)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedOperations(prev => [...prev, index]);
                } else {
                  setSelectedOperations(prev => prev.filter(i => i !== index));
                }
              }}
              sx={{ p: 1 }}
            />
          </Box>
        )}
        <ListItemText 
          primary={op.operation}
          secondary={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(op.date).toLocaleTimeString()}
              </Typography>
              <Chip 
                label={op.type} 
                size="small" 
                color={getTypeColor(op.type)}
                sx={{ height: 20 }}
              />
            </Box>
          }
        />
        <Box sx={{ display: 'flex', gap: 0.5 }} onClick={e => e.stopPropagation()}>
          <IconButton
            size="small"
            onClick={(e) => {
              onToggleFavorite(index);
            }}
          >
            {op.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              onCopyResult(op);
            }}
          >
            <CopyIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              onDeleteOperation([index]);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </ListItem>
  );

  // Función para manejar el borrado con confirmación
  const handleDeleteAll = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    onDeleteOperation('all');
    setShowDeleteConfirmModal(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: '100%', sm: 400 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header mejorado con opciones de vista */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Historial
            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              ({filteredHistory.length} operaciones)
            </Typography>
          </Typography>
          
          <Tooltip title="Cambiar vista">
            <IconButton 
              size="small"
              onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
            >
              {viewMode === 'list' ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Ordenar por">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Menú de ordenación */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setSortBy('date')}>
            <ListItemIcon>
              {sortBy === 'date' && <CheckIcon />}
            </ListItemIcon>
            Fecha
          </MenuItem>
          <MenuItem onClick={() => setSortBy('type')}>
            <ListItemIcon>
              {sortBy === 'type' && <CheckIcon />}
            </ListItemIcon>
            Tipo
          </MenuItem>
          <MenuItem onClick={() => setSortBy('favorite')}>
            <ListItemIcon>
              {sortBy === 'favorite' && <CheckIcon />}
            </ListItemIcon>
            Favoritos
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            <ListItemIcon>
              {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </ListItemIcon>
            {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
          </MenuItem>
        </Menu>

        {/* Vista de cuadrícula para móvil */}
        {viewMode === 'grid' ? (
          <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
            {filteredHistory.map((op, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => onSelectOperation(op)}
              >
                {isEditMode && (
                  <Checkbox
                    checked={selectedOperations.includes(index)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedOperations(prev => [...prev, index]);
                      } else {
                        setSelectedOperations(prev => prev.filter(i => i !== index));
                      }
                    }}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  />
                )}
                <Typography noWrap>{op.operation}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip 
                    label={op.type}
                    size="small"
                    color={getTypeColor(op.type)}
                  />
                  {op.isFavorite && <StarIcon color="warning" fontSize="small" />}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(op.date).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          // Vista de lista existente
          <List>
            <AnimatePresence>
              {filteredHistory.length > 0 ? (
                <List>
                  {filteredHistory.map((op, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {renderOperation(op, index)}
                    </motion.div>
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
          </List>
        )}

        {/* Botón flotante para móvil */}
        <SpeedDial
          ariaLabel="Opciones del historial"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          FabProps={{ size: 'medium' }}
        >
          <SpeedDialAction
            icon={viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
            tooltipTitle="Cambiar vista"
            onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
          />
          <SpeedDialAction
            icon={<SortIcon />}
            tooltipTitle="Ordenar"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          />
          {filteredHistory.length > 0 && (
            <SpeedDialAction
              icon={<FileDownloadIcon />}
              tooltipTitle="Exportar"
              onClick={() => setShowExportModal(true)}
            />
          )}
        </SpeedDial>

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
                onClick={handleDeleteAll}
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

      {/* Modal de confirmación para vaciar */}
      <Dialog 
        open={showDeleteConfirmModal} 
        onClose={() => setShowDeleteConfirmModal(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar todo el historial? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Eliminar todo
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
});

HistoryDrawer.displayName = 'HistoryDrawer';

export default HistoryDrawer; 