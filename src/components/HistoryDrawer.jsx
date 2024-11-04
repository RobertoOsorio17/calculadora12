import React, { useState, useMemo, useEffect, memo, forwardRef } from 'react';
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
  FilterList as FilterListIcon,
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
  ArrowDownward as ArrowDownwardIcon,
  Calculate as CalculatorIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

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
  
  // Estados básicos
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [error, setError] = useState(null);
  
  // Estados de visualización
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    basic: true,
    scientific: true,
    graph: true,
    equation: true
  });
  
  // Estados de modales y menús
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  // Configuración de exportación
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeDate: true,
    includeFavorites: true,
    includeType: true
  });

  // Primero definimos las opciones de tabs (después de los estados)
  const tabs = [
    { label: 'Todo', icon: <HistoryIcon /> },
    { label: 'Favoritos', icon: <StarIcon /> },
    { label: 'Científico', icon: <ShowChartIcon /> },
    { label: 'Básico', icon: <CalculatorIcon /> },
    { label: 'Gráficos', icon: <TimelineIcon /> }
  ];

  // Función para determinar el color segn el tipo de operación
  const getTypeColor = (type) => {
    // Asegurarnos de que type sea un string válido
    if (!type || typeof type !== 'string') {
      return {
        color: 'default',
        variant: 'outlined'
      };
    }

    const typeColors = {
      scientific: {
        color: 'secondary',
        variant: 'outlined'
      },
      equation: {
        color: 'info',
        variant: 'filled'
      },
      graph: {
        color: 'warning',
        variant: 'outlined'
      },
      advanced: {
        color: 'success',
        variant: 'filled'
      },
      basic: {
        color: 'primary',
        variant: 'outlined'
      }
    };

    return typeColors[type] || typeColors.basic;
  };

  // Memoizar la lista filtrada
  const filteredHistory = useMemo(() => {
    let filtered = [...history];
    
    // Aplicar filtros activos
    filtered = filtered.filter(op => filters[op.type]);
    
    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(op => 
        op.operation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtros de pestaña
    if (activeTab !== 0) {
      const tabFilters = {
        1: op => op.isFavorite,
        2: op => op.type === 'scientific',
        3: op => op.type === 'basic',
        4: op => op.type === 'graph'
      };
      filtered = filtered.filter(tabFilters[activeTab] || (() => true));
    }
    
    // Aplicar ordenación
    const sortFunctions = {
      date: (a, b) => new Date(sortOrder === 'desc' ? b.date : a.date) - new Date(sortOrder === 'desc' ? a.date : b.date),
      type: (a, b) => sortOrder === 'desc' ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type),
      favorite: (a, b) => sortOrder === 'desc' ? (b.isFavorite - a.isFavorite) : (a.isFavorite - b.isFavorite)
    };
    
    filtered.sort(sortFunctions[sortBy] || sortFunctions.date);
    
    return filtered;
  }, [history, searchTerm, activeTab, sortBy, sortOrder, filters]);

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setActiveTab(0);
      setIsEditMode(false);
      setSelectedOperations([]);
      setFilterAnchorEl(null);
      setSortAnchorEl(null);
      setExportAnchorEl(null);
      setAnchorEl(null);
      setShowFilters(false);
      setShowExportModal(false);
      setShowImportModal(false);
      setShowDeleteConfirmModal(false);
      setError(null);
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

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportData(file);
      setShowImportModal(false);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setShowExportModal(false);
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

  const OperationItem = memo(({ 
    operation, 
    index,
    isEditMode,
    selectedOperations,
    onSelect,
    onDelete,
    onToggleFavorite,
    onCopy 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            '& .operation-actions': {
              opacity: 1
            }
          }
        }}
      >
        {isEditMode && (
          <Checkbox
            checked={selectedOperations.includes(index)}
            onChange={() => onSelect(index)}
          />
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            {operation.operation}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(operation.date).toLocaleString()}
          </Typography>
        </Box>

        <Box 
          className="operation-actions"
          sx={{ 
            opacity: { xs: 1, sm: 0 },
            transition: 'opacity 0.2s',
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(index);
            }}
          >
            {operation.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
          </IconButton>
          
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(operation);
            }}
          >
            <CopyIcon />
          </IconButton>
          
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Chip
          size="small"
          label={operation.type || 'basic'}
          color={getTypeColor(operation.type).color}
          variant={getTypeColor(operation.type).variant}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      </Paper>
    </motion.div>
  ));

  // Función para manejar el borrado con confirmación
  const handleDeleteAll = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    onDeleteOperation(filteredHistory.map((_, index) => index));
    setShowDeleteConfirmModal(false);
  };

  // Función auxiliar para formatear fechas de manera segura
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString();
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  const FilterMenu = memo(({ anchorEl, onClose, filters, onFilterChange }) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={() => onFilterChange('basic')}>
        <ListItemIcon>
          <Checkbox checked={filters.basic} />
        </ListItemIcon>
        <ListItemText primary="Operaciones básicas" />
      </MenuItem>
      <MenuItem onClick={() => onFilterChange('scientific')}>
        <ListItemIcon>
          <Checkbox checked={filters.scientific} />
        </ListItemIcon>
        <ListItemText primary="Científicas" />
      </MenuItem>
      <MenuItem onClick={() => onFilterChange('graph')}>
        <ListItemIcon>
          <Checkbox checked={filters.graph} />
        </ListItemIcon>
        <ListItemText primary="Gráficos" />
      </MenuItem>
      <MenuItem onClick={() => onFilterChange('equation')}>
        <ListItemIcon>
          <Checkbox checked={filters.equation} />
        </ListItemIcon>
        <ListItemText primary="Ecuaciones" />
      </MenuItem>
    </Menu>
  ));

  const SortMenu = memo(({ anchorEl, onClose, sortBy, sortOrder, onSortChange }) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={() => onSortChange('date')}>
        <ListItemIcon>
          {sortBy === 'date' && (
            sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          )}
        </ListItemIcon>
        <ListItemText primary="Fecha" />
      </MenuItem>
      <MenuItem onClick={() => onSortChange('type')}>
        <ListItemIcon>
          {sortBy === 'type' && (
            sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          )}
        </ListItemIcon>
        <ListItemText primary="Tipo" />
      </MenuItem>
      <MenuItem onClick={() => onSortChange('favorite')}>
        <ListItemIcon>
          {sortBy === 'favorite' && (
            sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          )}
        </ListItemIcon>
        <ListItemText primary="Favorito" />
      </MenuItem>
    </Menu>
  ));

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setFilterAnchorEl(null);
    setExportAnchorEl(null);
  };

  // Manejadores de eventos
  const handleDeleteOperation = (index) => {
    if (isEditMode && selectedOperations.length > 0) {
      onDeleteOperation(selectedOperations);
      setSelectedOperations([]);
    } else {
      onDeleteOperation([index]);
    }
  };

  const handleToggleFavorite = (index) => {
    onToggleFavorite(index);
  };

  const handleCopyResult = (operation) => {
    onCopyResult(operation);
  };

  const Header = memo(() => {
    const hasSelectedOperations = selectedOperations.length > 0;
    
    return (
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h6" component="div">
            {isEditMode && hasSelectedOperations ? 
              `${selectedOperations.length} seleccionados` :
              <>
                Historial
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({filteredHistory.length} operaciones)
                </Typography>
              </>
            }
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          mb: 2
        }}>
          <Button
            startIcon={<FileUploadIcon />}
            onClick={() => setShowImportModal(true)}
            variant="outlined"
            size="small"
            sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' } }}
          >
            Importar
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => setShowExportModal(true)}
            variant="outlined"
            size="small"
            sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' } }}
          >
            Exportar
          </Button>
          <Button
            startIcon={isEditMode && hasSelectedOperations ? <DeleteIcon /> : <EditIcon />}
            onClick={() => {
              if (isEditMode && hasSelectedOperations) {
                handleDeleteOperation(selectedOperations);
                setSelectedOperations([]);
              } else {
                setIsEditMode(!isEditMode);
              }
            }}
            variant="outlined"
            color={isEditMode && hasSelectedOperations ? "error" : "primary"}
            size="small"
            sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' } }}
          >
            {isEditMode ? 
              (hasSelectedOperations ? 'Eliminar' : 'Listo') : 
              'Editar'
            }
          </Button>
          {!isEditMode && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteConfirmModal(true)}
              variant="outlined"
              color="error"
              size="small"
              sx={{ 
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                order: { xs: 1, sm: 0 }
              }}
            >
              Vaciar
            </Button>
          )}
        </Box>

        <TextField
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar operaciones..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    );
  });

  // Definir el componente TabPanel
  const TabPanel = memo(({ value, index, children }) => (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ flex: 1, overflow: 'auto' }}
    >
      {value === index && children}
    </Box>
  ));

  // Modificar el estilo de las tabs
  const StyledTabs = styled(Tabs)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTab-root': {
      color: theme.palette.text.primary,
      '&.Mui-selected': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.primary.main,
    }
  }));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Header */}
        <Header />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}
              />
            ))}
          </StyledTabs>
        </Box>

        {/* Lista de operaciones */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {filteredHistory.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2,
              mt: 4 
            }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                No hay operaciones {activeTab !== 0 ? 'en esta categoría' : ''}
              </Typography>
            </Box>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((operation, index) => (
                <OperationItem
                  key={operation.id || index}
                  operation={operation}
                  index={index}
                  isEditMode={isEditMode}
                  selectedOperations={selectedOperations}
                  onSelect={(idx) => {
                    setSelectedOperations(prev => 
                      prev.includes(idx) 
                        ? prev.filter(i => i !== idx)
                        : [...prev, idx]
                    );
                  }}
                  onDelete={handleDeleteOperation}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={handleCopyResult}
                />
              ))}
            </AnimatePresence>
          )}
        </Box>
      </Box>

      <SpeedDial
        ariaLabel="Opciones del historial"
        sx={{ 
          position: 'fixed',
          bottom: { xs: 140, sm: 32 },
          right: { xs: 16, sm: 32 },
          zIndex: theme.zIndex.speedDial + 1
        }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
          tooltipTitle="Cambiar vista"
          onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
        />
        <SpeedDialAction
          icon={<FilterListIcon />}
          tooltipTitle="Filtros"
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
        />
        <SpeedDialAction
          icon={<SortIcon />}
          tooltipTitle="Ordenar"
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
        />
        <SpeedDialAction
          icon={<EditIcon />}
          tooltipTitle="Modo edición"
          onClick={() => setIsEditMode(!isEditMode)}
        />
      </SpeedDial>

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