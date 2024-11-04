import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  MenuItem,
  ListItemIcon,
  FormControlLabel,
  Switch,
  Snackbar,
  TextField,
  Menu as MuiMenu,
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
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState([]);
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
  const [memory, setMemory] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);
  const [equation, setEquation] = useState('');
  const [graphControlsOpen, setGraphControlsOpen] = useState(false);

  const calculateResult = useCallback((operation, value1, value2) => {
    const num1 = parseFloat(value1.replace(',', '.'));
    const num2 = parseFloat(value2.replace(',', '.'));
    
    switch (operation) {
      case '+': return (num1 + num2).toString().replace('.', ',');
      case '-': return (num1 - num2).toString().replace('.', ',');
      case '×': return (num1 * num2).toString().replace('.', ',');
      case '÷': return num2 !== 0 ? (num1 / num2).toString().replace('.', ',') : 'Error';
      default: return value2;
    }
  }, []);

  const addToHistory = useCallback((operation, type = null) => {
    const newOperation = {
      operation,
      timestamp: new Date(),
      isFavorite: false,
      type: type || getOperationType(operation)
    };
    setHistory(prev => [newOperation, ...prev]);
  }, []);

  const handleNumberClick = useCallback((number) => {
    if (newNumber) {
      setDisplay(number);
      setNewNumber(false);
    } else {
      setDisplay(prev => prev === '0' ? number : prev + number);
    }
  }, [newNumber]);

  const handleOperationClick = useCallback((op) => {
    if (newNumber) {
      if (firstNumber === null) {
        setFirstNumber(display);
      }
    } else {
      if (firstNumber !== null) {
        const result = calculateResult(operation, firstNumber, display);
        setDisplay(result);
        setFirstNumber(result);
      } else {
        setFirstNumber(display);
      }
    }
    setOperation(op);
    setNewNumber(true);
  }, [display, firstNumber, operation, newNumber, calculateResult]);

  const handleEquals = useCallback(() => {
    if (firstNumber !== null && operation !== null && !newNumber) {
      const result = calculateResult(operation, firstNumber, display);
      setDisplay(result);
      addToHistory(`${firstNumber} ${operation} ${display} = ${result}`);
      setFirstNumber(result);
      setOperation(null);
      setNewNumber(true);
    }
  }, [firstNumber, operation, display, newNumber, addToHistory]);

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
    addToHistory(`${op}(${current}) = ${result}`);
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
      operation: () => {
        setEquationModalOpen(true);
        setMenuAnchorEl(null);
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

  const HistoryActions = useMemo(() => {
    return (
      <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
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
  }, [history.length, isEditMode, selectedOperations]);

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

  const handleToggleFavorite = useCallback((index) => {
    setHistory(prev => prev.map((op, i) => {
      if (i === index) {
        const updatedOp = typeof op === 'string' 
          ? { operation: op, isFavorite: true, timestamp: new Date() }
          : { ...op, isFavorite: !op.isFavorite };
        return updatedOp;
      }
      return op;
    }));
  }, []);

  const handleCopyResult = useCallback((operation) => {
    const result = operation.operation.split('=')[1]?.trim() || operation.operation;
    navigator.clipboard.writeText(result);
    setShowCopyToast(true);
  }, []);

  const handleImportData = (importedData) => {
    setHistory(prev => [...importedData, ...prev]);
  };

  const handleError = useCallback((message) => {
    setError(message.replace(/\n/g, '<br>'));
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleDeleteOperation = (indices) => {
    if (indices === 'all') {
      setHistory([]);
      localStorage.removeItem('calculatorHistory');
      return;
    }

    const newHistory = history.filter((_, index) => !indices.includes(index));
    setHistory(newHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
    setShowHistory(false);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }
  }, [history]);

  const memoizedConverter = useMemo(() => <Converter />, []);

  const handleScientificOperation = useCallback((operation) => {
    try {
      const current = parseFloat(display.replace(',', '.'));
      let result;

      if (typeof operation === 'function') {
        result = operation(current);
        
        if (typeof result === 'string') {
          setDisplay(result);
          addToHistory(`Ecuación: ${result}`, 'scientific');
          return;
        }
      } else {
        result = operation;
      }

      const formattedResult = Number.isFinite(result) 
        ? result.toString().replace('.', ',')
        : 'Error';

      setDisplay(formattedResult);
      setFirstNumber(null);
      setOperation(null);
      setNewNumber(true);
      setMemory(formattedResult);

      const operationName = scientificActions.find(action => action.operation === operation)?.icon || 'función';
      addToHistory(`${operationName}(${display}) = ${formattedResult}`, 'scientific');
    } catch (error) {
      handleError('Error en la operación científica');
      console.error('Error científico:', error);
    }
  }, [display, scientificActions, addToHistory]);

  const equationButtons = [
    { icon: 'x', operation: 'x' },
    { icon: 'y', operation: 'y' },
    { icon: '=', operation: '=' },
    { icon: '²', operation: '²' },
    { icon: '³', operation: '³' },
    { icon: '√', operation: '√' },
  ];

  const handleEquationInput = useCallback((char) => {
    setEquation(prev => prev + char);
  }, []);

  const renderMenu = () => (
    <MuiMenu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={() => setMenuAnchorEl(null)}
    >
      <MenuItem onClick={() => {
        setIsScientificMode(prev => !prev);
        setMenuAnchorEl(null);
      }}>
        <ListItemIcon>
          <FunctionsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Modo Científico</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => {
        setIsConverterMode(prev => !prev);
        setMenuAnchorEl(null);
      }}>
        <ListItemIcon>
          <SwapHorizIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Convertidor</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => {
        setEquationModalOpen(true);
        setMenuAnchorEl(null);
      }}>
        <ListItemIcon>
          <FunctionsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Resolver Ecuación</ListItemText>
      </MenuItem>
    </MuiMenu>
  );

  const getOperationType = (operation) => {
    if (typeof operation !== 'string') return 'basic';
    
    // Normalizar la operación para búsqueda
    const normalizedOp = operation.toLowerCase();
    
    // Patrones para cada tipo de operación
    const patterns = {
      scientific: {
        functions: ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√', '∛'],
        constants: ['π', 'e'],
        operations: ['!', '²', '³', '^', '√('],
        keywords: ['factorial', 'raíz', 'potencia']
      },
      equation: {
        indicators: ['ecuación:', 'sistema:', 'inecuación:'],
        variables: ['x', 'y', 'z'],
        operators: ['≤', '≥', '<', '>', '±']
      },
      graph: {
        functions: ['f(x)', 'y=', 'x='],
        coordinates: /\(\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\)/,
        keywords: ['gráfico', 'plot', 'coordenadas']
      },
      advanced: {
        operations: ['%', '1/x', 'mod', '|x|'],
        conversions: ['→', '⇒', 'to', 'en']
      }
    };

    // Funciones de detección específicas
    const isScientific = () => {
      return patterns.scientific.functions.some(f => normalizedOp.includes(f)) ||
             patterns.scientific.constants.some(c => normalizedOp.includes(c)) ||
             patterns.scientific.operations.some(o => normalizedOp.includes(o)) ||
             patterns.scientific.keywords.some(k => normalizedOp.includes(k));
    };

    const isEquation = () => {
      return patterns.equation.indicators.some(i => normalizedOp.includes(i)) ||
             (patterns.equation.variables.some(v => normalizedOp.includes(v)) &&
              normalizedOp.includes('='));
    };

    const isGraph = () => {
      return patterns.graph.functions.some(f => normalizedOp.includes(f)) ||
             patterns.graph.coordinates.test(normalizedOp) ||
             patterns.graph.keywords.some(k => normalizedOp.includes(k));
    };

    const isAdvanced = () => {
      return patterns.advanced.operations.some(o => normalizedOp.includes(o)) ||
             patterns.advanced.conversions.some(c => normalizedOp.includes(c));
    };

    // Determinar el tipo
    if (isScientific()) return 'scientific';
    if (isEquation()) return 'equation';
    if (isGraph()) return 'graph';
    if (isAdvanced()) return 'advanced';

    // Si no coincide con ningún patrón específico
    return 'basic';
  };

  const categorizedHistory = useMemo(() => {
    return history.map(op => ({
      operation: typeof op === 'string' ? op : op.operation,
      type: getOperationType(op),
      date: op.timestamp || new Date(),
      isFavorite: op.isFavorite || false,
      isGraph: getOperationType(op) === 'graph'
    }));
  }, [history]);

  const handleHistoryOpen = useCallback(() => {
    setShowHistory(true);
  }, []);

  const handleHistoryClose = useCallback(() => {
    setShowHistory(false);
    setIsEditMode(false);
    setSelectedOperations([]);
  }, []);

  const handleSelectOperation = useCallback((operation, action) => {
    if (action === 'favorite') {
      // No cerrar el drawer si es una acción de favorito
      return;
    }
    const result = operation.operation.split('=')[1]?.trim() || operation.operation;
    setDisplay(result);
    handleHistoryClose();
  }, []);

  return (
    <>
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative',
          pt: 1,
          pb: 2
        }}
        {...swipeHandlers}
        onTouchStart={handleTouchStart}
      >
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

            {renderMenu()}

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
                    <Grid item xs={4} key={action.icon}>
                      <ButtonWrapper
                        key={action.icon}
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
                        onClick={() => handleScientificOperation(action.operation)}
                        sx={{
                          height: { xs: 55, sm: 50 },
                          fontSize: { xs: '1.1rem', sm: '1.2rem' },
                          borderRadius: 2,
                          backgroundColor: theme.palette.secondary.main,
                          color: 'white',
                          boxShadow: theme.palette.mode === 'light'
                            ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
                            : '5px 5px 10px #151515, -5px -5px 10px #252525',
                          '&:hover': {
                            backgroundColor: theme.palette.secondary.dark,
                          },
                          minWidth: { xs: '100%', sm: 'auto' },
                          padding: { xs: '12px', sm: '8px' },
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

        <IconButton
          onClick={handleHistoryOpen}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            },
            zIndex: 1
          }}
        >
          <HistoryIcon fontSize="small" />
        </IconButton>

        {showHistory && (
          <HistoryDrawer 
            open={showHistory}
            onClose={handleHistoryClose}
            history={categorizedHistory}
            onSelectOperation={handleSelectOperation}
            onDeleteOperation={handleDeleteOperation}
            onToggleFavorite={handleToggleFavorite}
            onCopyResult={handleCopyResult}
            onImportData={handleImportData}
          />
        )}
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
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: theme.palette.error.main,
            color: 'white',
            fontWeight: 'medium',
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            maxWidth: '80vw',
            whiteSpace: 'pre-line'
          }
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: error }} />
      </Snackbar>

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
        onClose={() => {
          setEquationModalOpen(false);
          setEquation('');
          setDisplay('0');
        }}
        equation={equation}
        setEquation={setEquation}
        equationButtons={equationButtons}
        onGraphControlsChange={setGraphControlsOpen}
        onResult={useCallback((result) => {
          const resultString = typeof result === 'object' 
            ? result.operation || JSON.stringify(result)
            : String(result);
          
          setDisplay(resultString);
          if (resultString.trim()) {
            addToHistory(`Ecuación: ${equation} = ${resultString}`);
          }
        }, [equation, addToHistory])}
      />
    </>
  );
};

export default React.memo(Calculator);
