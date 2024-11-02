import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  Typography,
  useTheme,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControlLabel,
  Switch,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryIcon from '@mui/icons-material/History';
import FunctionsIcon from '@mui/icons-material/Functions';
import { useSwipeable } from 'react-swipeable';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Converter from './Converter';
import HistoryDrawer from './HistoryDrawer';
import solveEquation from '../utils/equationSolver';
import EquationInput from './EquationInput';

const Calculator = () => {
  const theme = useTheme();
  const [display, setDisplay] = useState('0');
  const [firstNumber, setFirstNumber] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(false);
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [isConverterMode, setIsConverterMode] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeDate: true,
    includeTime: true,
    onlyResults: false
  });
  const [error, setError] = useState(null);
  const [isEquationMode, setIsEquationMode] = useState(false);
  const [equationModalOpen, setEquationModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  const calculate = (a, b, op) => {
    const numA = parseFloat(String(a).replace(',', '.'));
    const numB = parseFloat(String(b).replace(',', '.'));
    
    let result;
    switch(op) {
      case '+': result = numA + numB; break;
      case '-': result = numA - numB; break;
      case '×': result = numA * numB; break;
      case '÷': result = numA / numB; break;
      default: result = numB;
    }
    
    return String(result).replace('.', ',');
  };

  const handleNumberClick = (number) => {
    if (newNumber) {
      setDisplay(number);
      setNewNumber(false);
    } else {
      setDisplay(prev => prev === '0' ? number : prev + number);
    }
  };

  const handleOperationClick = (op) => {
    if (firstNumber === null) {
      setFirstNumber(parseFloat(display.replace(',', '.')));
    } else if (!newNumber) {
      const current = parseFloat(display.replace(',', '.'));
      const result = calculate(firstNumber, current, operation);
      setDisplay(String(result).replace('.', ','));
      setFirstNumber(parseFloat(result.replace(',', '.')));
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const handleEquals = useCallback(() => {
    if (operation && firstNumber !== null) {
      const current = parseFloat(display.replace(',', '.'));
      const result = calculate(firstNumber, current, operation);
      const newOperation = `${firstNumber} ${operation} ${current} = ${result}`;
      setHistory(prev => [newOperation, ...prev].slice(0, 10));
      setDisplay(String(result).replace('.', ','));
      setFirstNumber(null);
      setOperation(null);
      setNewNumber(true);
    }
  }, [display, firstNumber, operation]);

  const handleClear = () => {
    setDisplay('0');
    setFirstNumber(null);
    setOperation(null);
    setNewNumber(false);
  };

  useKeyboardShortcuts({
    handleNumberClick,
    handleOperationClick,
    handleEquals,
    handleClear
  });

  const ButtonWrapper = motion(Button);

  const handleAdvancedOperation = (op) => {
    const current = parseFloat(display.replace(',', '.'));
    let result;
    
    switch(op) {
      case '√':
        result = Math.sqrt(current);
        break;
      case 'x²':
        result = Math.pow(current, 2);
        break;
      case '%':
        result = current / 100;
        break;
      case '1/x':
        result = 1 / current;
        break;
      case '±':
        result = -current;
        break;
      default:
        return;
    }
    
    setDisplay(String(result).replace('.', ','));
    setHistory(prev => [`${op}(${current}) = ${result}`, ...prev].slice(0, 10));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    },
    onSwipedRight: () => {
      setShowHistory(true);
    },
    onSwipedDown: () => handleClear(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50,
    swipeDuration: 300,
  });

  const advancedActions = [
    { icon: '√', name: 'Raíz cuadrada' },
    { icon: 'x²', name: 'Cuadrado' },
    { icon: '%', name: 'Porcentaje' },
    { icon: '1/x', name: 'Recíproco' },
    { icon: '±', name: 'Cambiar signo' },
  ];

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setShowAdvanced(true);
    }
  };

  const scientificActions = [
    { icon: 'sin', name: 'Seno', operation: (n) => Math.sin(n * Math.PI / 180) },
    { icon: 'cos', name: 'Coseno', operation: (n) => Math.cos(n * Math.PI / 180) },
    { icon: 'tan', name: 'Tangente', operation: (n) => Math.tan(n * Math.PI / 180) },
    { icon: 'ln', name: 'Logaritmo Natural', operation: (n) => Math.log(n) },
    { icon: 'log', name: 'Logaritmo Base 10', operation: (n) => Math.log10(n) },
    { icon: 'π', name: 'Pi', operation: () => Math.PI },
    { icon: 'e', name: 'Euler', operation: () => Math.E },
    { icon: '!', name: 'Factorial', operation: (n) => {
      if (n < 0) return NaN;
      if (n === 0) return 1;
      let result = 1;
      for (let i = 1; i <= n; i++) result *= i;
      return result;
    }},
    { 
      icon: '∑', 
      name: 'Resolver Ecuación',
      operation: (input) => {
        try {
          const solutions = solveEquation(input);
          return solutions.map((sol, index) => 
            `x${index + 1} = ${sol.x}${sol.type === 'complex' ? '' : '\n'}`
          ).join('');
        } catch (error) {
          handleError(error.message);
          return input;
        }
      }
    },
  ];

  const onDeleteOperation = (indices) => {
    if (indices === 'all') {
      setShowDeleteModal(true);
    } else {
      const newHistory = history.filter((_, index) => !indices.includes(index));
      setHistory(newHistory);
      localStorage.setItem('calculatorHistory', JSON.stringify(newHistory));
    }
  };

  const DeleteConfirmationModal = () => (
    <Dialog
      open={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
            : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        }
      }}
    >
      <DialogTitle>Confirmar borrado</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que quieres borrar todo el historial?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDeleteModal(false)}>
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            setHistory([]);
            setShowDeleteModal(false);
          }}
          color="error"
          variant="contained"
        >
          Borrar
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ExportModal = () => {
    const handleExport = () => {
      let content = '';
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();

      if (exportConfig.format === 'csv') {
        content = history
          .filter(op => op && typeof op === 'string')
          .map(op => {
            let line = [];
            if (exportConfig.includeDate) line.push(date);
            if (exportConfig.includeTime) line.push(time);
            
            if (exportConfig.onlyResults) {
              const parts = op.split('=');
              if (parts.length > 1) {
                line.push(parts[1].trim());
              } else {
                line.push(op);
              }
            } else {
              line.push(op);
            }
            
            return line.join(',');
          })
          .join('\n');

        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculadora_historial_${date}.csv`;
        a.click();
      } else {
        content = {
          date: date,
          time: time,
          operations: history
            .filter(op => op && typeof op === 'string')
            .map(op => ({
              full: op,
              result: op.includes('=') ? op.split('=')[1].trim() : op
            }))
        };

        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculadora_historial_${date}.json`;
        a.click();
      }
      setShowExportModal(false);
    };

    return (
      <Dialog 
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
              : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          Exportar Historial
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowExportModal(false)}>
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

  const ImportModal = () => {
    const fileInputRef = useRef(null);

    const handleImport = (event) => {
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
        reader.onload = (e) => {
          try {
            let operations = [];
            if (file.name.endsWith('.csv')) {
              const content = e.target.result;
              operations = content.split('\n')
                .filter(line => line.trim())
                .map(line => line.split(',')[0]);
            } else if (file.name.endsWith('.json')) {
              const content = JSON.parse(e.target.result);
              operations = Array.isArray(content) 
                ? content.map(op => typeof op === 'string' ? op : op.operation)
                : content.operations.map(op => typeof op === 'string' ? op : op.operation);
            }
            setHistory(prev => [...operations, ...prev]);
            setShowImportModal(false);
          } catch (error) {
            console.error('Error importing file:', error);
          }
        };
        reader.readAsText(file);
      } catch (err) {
        handleError('Error al importar el archivo');
        console.error('Error al importar:', err);
      }
    };

    return (
      <Dialog
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
              : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          }
        }}
      >
        <DialogTitle>Importar Historial</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Selecciona un archivo CSV o JSON para importar
          </DialogContentText>
          <input
            type="file"
            accept=".csv,.json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current.click()}
            startIcon={<FileUploadIcon />}
            fullWidth
          >
            Seleccionar Archivo
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportModal(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const HistoryActions = () => (
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
      {history.length > 0 && (
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
            onClick={() => setShowDeleteModal(true)}
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
  );

  const handleDecimalClick = () => {
    if (newNumber) {
      setDisplay('0,');
      setNewNumber(false);
    } else if (!display.includes(',')) {
      setDisplay(prev => prev + ',');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      handleError('Error al copiar al portapapeles');
      console.error('Error al copiar:', err);
    }
  };

  const handleToggleFavorite = (index) => {
    const newHistory = [...history];
    newHistory[index].isFavorite = !newHistory[index].isFavorite;
    setHistory(newHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(newHistory));
  };

  const handleCopyResult = (operation) => {
    const result = operation.split('=')[1].trim();
    navigator.clipboard.writeText(result);
    setShowCopyToast(true);
  };

  const handleImportData = (importedData) => {
    setHistory(prev => [...importedData, ...prev]);
  };

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4 }} {...swipeHandlers} onTouchStart={handleTouchStart}>
        <AnimatePresence mode="wait">
          <Paper
            component={motion.div}
            elevation={8}
            layout
            transition={{ 
              layout: { duration: 0.6, type: "spring" },
              opacity: { duration: 0.3 }
            }}
            sx={{
              p: 2,
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
                : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
              borderRadius: 4,
              position: 'relative',
              touchAction: 'none',
            }}
          >
            <IconButton
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: theme.palette.text.primary,
              }}
            >
              <FunctionsIcon />
            </IconButton>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MenuItem 
                onClick={() => {
                  setIsScientificMode(!isScientificMode);
                  setIsConverterMode(false);
                  setIsEquationMode(false);
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <FunctionsIcon color={isScientificMode ? "secondary" : "inherit"} />
                </ListItemIcon>
                <ListItemText>
                  {isScientificMode ? "Desactivar Modo Científico" : "Activar Modo Científico"}
                </ListItemText>
              </MenuItem>
              
              <MenuItem 
                onClick={() => {
                  setIsConverterMode(!isConverterMode);
                  setIsScientificMode(false);
                  setIsEquationMode(false);
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <SwapHorizIcon color={isConverterMode ? "secondary" : "inherit"} />
                </ListItemIcon>
                <ListItemText>
                  {isConverterMode ? "Desactivar Convertidor" : "Activar Convertidor"}
                </ListItemText>
              </MenuItem>

              <MenuItem 
                onClick={() => {
                  setEquationModalOpen(true);
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <FunctionsIcon />
                </ListItemIcon>
                <ListItemText>
                  Resolver Ecuación
                </ListItemText>
              </MenuItem>
            </Menu>

            <Box 
              onClick={handleCopyToClipboard}
              sx={{
                background: theme.palette.mode === 'light'
                  ? 'linear-gradient(145deg, #e6e6e6, #ffffff)'
                  : 'linear-gradient(145deg, #2a2a2a, #1e1e1e)',
                p: 3,
                mb: 2,
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'light'
                  ? 'inset 5px 5px 10px #d1d1d1, inset -5px -5px 10px #ffffff'
                  : 'inset 5px 5px 10px #151515, inset -5px -5px 10px #252525',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                cursor: 'pointer',
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  color: theme.palette.primary.main,
                  wordBreak: 'break-all',
                  textAlign: 'right',
                  width: '100%'
                }}
              >
                {display}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {[
                '7', '8', '9', '÷',
                '4', '5', '6', '×',
                '1', '2', '3', '-',
                'C', '0', ',', '+',
                '='
              ].map((btn, index) => (
                <Grid item xs={btn === '=' ? 12 : 3} key={btn}>
                  <ButtonWrapper
                    data-button={btn}
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    fullWidth
                    sx={{
                      height: { xs: 55, sm: 50 },
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                      borderRadius: 2,
                      backgroundColor: isNaN(btn) 
                        ? (btn === '=' ? theme.palette.secondary.main : theme.palette.primary.main)
                        : theme.palette.mode === 'light' ? '#ffffff' : '#2a2a2a',
                      color: isNaN(btn) ? 'white' : theme.palette.text.primary,
                      boxShadow: theme.palette.mode === 'light'
                        ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
                        : '5px 5px 10px #151515, -5px -5px 10px #252525',
                      '&:hover': {
                        backgroundColor: isNaN(btn) 
                          ? (btn === '=' ? theme.palette.secondary.dark : theme.palette.primary.dark)
                          : theme.palette.mode === 'light' ? '#f5f5f5' : '#3a3a3a',
                      },
                      minWidth: { xs: '100%', sm: 'auto' },
                      padding: { xs: '12px', sm: '8px' },
                    }}
                    onClick={() => {
                      switch(true) {
                        case btn === 'C':
                          handleClear();
                          break;
                        case btn === '=':
                          handleEquals();
                          break;
                        case btn === ',':
                          handleDecimalClick();
                          break;
                        case !isNaN(btn):
                          handleNumberClick(btn);
                          break;
                        default:
                          handleOperationClick(btn);
                      }
                    }}
                  >
                    {btn}
                  </ButtonWrapper>
                </Grid>
              ))}
            </Grid>

            <SpeedDial
              ariaLabel="Operaciones avanzadas"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
              }}
              icon={<SpeedDialIcon icon={<FunctionsIcon />} />}
              onClose={() => setShowAdvanced(false)}
              onOpen={() => setShowAdvanced(true)}
              open={showAdvanced}
              direction="up"
            >
              {advancedActions.map((action) => (
                <SpeedDialAction
                  key={action.icon}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={() => handleAdvancedOperation(action.icon)}
                  sx={{
                    '& .MuiSpeedDialAction-staticTooltipLabel': {
                      width: 'auto',
                      maxWidth: 'none',
                    }
                  }}
                />
              ))}
            </SpeedDial>

            <AnimatePresence>
              {isScientificMode && (
                <Grid 
                  container 
                  spacing={1.5}
                  component={motion.div}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{ mt: 1 }}
                >
                  {scientificActions.map((action) => (
                    <Grid item xs={3} key={action.icon}>
                      <ButtonWrapper
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                        fullWidth
                        variant="contained"
                        sx={{
                          height: 65,
                          fontSize: '1.2rem',
                          borderRadius: 2,
                          backgroundColor: theme.palette.secondary.main,
                          color: 'white',
                          boxShadow: theme.palette.mode === 'light'
                            ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
                            : '5px 5px 10px #151515, -5px -5px 10px #252525',
                        }}
                        onClick={() => {
                          const current = parseFloat(display.replace(',', '.'));
                          const result = action.operation(current);
                          setDisplay(String(result).replace('.', ','));
                          setHistory(prev => [`${action.icon}(${current}) = ${result}`, ...prev].slice(0, 10));
                        }}
                      >
                        {action.icon}
                      </ButtonWrapper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </AnimatePresence>
          </Paper>
        </AnimatePresence>

        <HistoryDrawer 
          open={showHistory}
          onClose={() => {
            setShowHistory(false);
            setIsEditMode(false);
            setSelectedOperations([]);
          }}
          history={history}
          onSelectOperation={(op) => {
            const result = op.operation.split('=')[1].trim();
            setDisplay(result);
            setShowHistory(false);
          }}
          onDeleteOperation={onDeleteOperation}
          onToggleFavorite={(index) => {
            setHistory(prev => prev.map((item, i) => {
              if (i === index) {
                const historyItem = typeof item === 'string' 
                  ? { operation: item, isFavorite: false } 
                  : { ...item };
                return {
                  ...historyItem,
                  isFavorite: !historyItem.isFavorite
                };
              }
              return item;
            }));
          }}
          onCopyResult={(op) => {
            const result = op.operation.split('=')[1].trim();
            navigator.clipboard.writeText(result);
          }}
          onImportData={(data) => {
            const formattedData = data.map(item => 
              typeof item === 'string' ? item : item.operation
            );
            setHistory(prev => [...formattedData, ...prev]);
          }}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          selectedOperations={selectedOperations}
          setSelectedOperations={setSelectedOperations}
        />
      </Container>

      <DeleteConfirmationModal />
      <ExportModal />
      <ImportModal />

      <Snackbar
        open={showCopyToast}
        autoHideDuration={2000}
        onClose={() => setShowCopyToast(false)}
        message="Número copiado al portapapeles"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: theme.palette.success.main,
            color: 'white',
            fontWeight: 'medium',
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: theme.palette.error.main,
            color: 'white',
            fontWeight: 'medium',
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }
        }}
      />

      <AnimatePresence>
        {isConverterMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: '1rem' }}
          >
            <Converter />
          </motion.div>
        )}
      </AnimatePresence>

      <EquationInput 
        open={equationModalOpen}
        onClose={() => setEquationModalOpen(false)}
        onResult={(result) => {
          setDisplay(result);
          setHistory(prev => [`Ecuación: ${result}`, ...prev]);
        }}
      />
    </>
  );
};

export default Calculator;
