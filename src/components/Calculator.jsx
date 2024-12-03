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
  Tooltip,
  ListItemButton,
  Divider,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ThemeSelector from './ThemeSelector';
import EquationSolver from './EquationSolver';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';

const Calculator = () => {
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
  const [maxDigits] = useState(12);
  const [currentTheme, setCurrentTheme] = useState({
    name: 'Material Default',
    primary: '#1976d2',
    secondary: '#9c27b0',
    background: '#ffffff',
  });

  const theme = useMemo(() => createTheme({
    palette: {
      mode: currentTheme.name === 'Oscuro' ? 'dark' : 'light',
      primary: {
        main: currentTheme.primary,
      },
      secondary: {
        main: currentTheme.secondary,
      },
      background: {
        default: currentTheme.background,
        paper: currentTheme.background,
      },
      text: {
        primary: currentTheme.text || (currentTheme.name === 'Oscuro' ? '#ffffff' : '#000000'),
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [currentTheme]);

  const handleThemeChange = useCallback((newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('calculatorTheme', JSON.stringify(newTheme));
  }, []);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('calculatorTheme');
    if (savedTheme) {
      try {
        setCurrentTheme(JSON.parse(savedTheme));
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  const calculateResult = useCallback((operation, value1, value2) => {
    try {
      const num1 = parseFloat(value1.replace(',', '.'));
      const num2 = parseFloat(value2.replace(',', '.'));
      
      if (isNaN(num1) || isNaN(num2)) {
        return 'Error';
      }
      
      let result;
      switch (operation) {
        case '+': 
          result = num1 + num2;
          break;
        case '-': 
          result = num1 - num2;
          break;
        case '×': 
          result = num1 * num2;
          break;
        case '÷':
          if (num2 === 0) {
            return 'Error: División por cero';
          }
          result = num1 / num2;
          break;
        default: 
          return value2;
      }
      
      // Manejar resultados especiales
      if (!isFinite(result)) {
        return 'Error: Resultado indefinido';
      }
      
      // Limitar decimales para números muy grandes
      if (Math.abs(result) > 1e15) {
        return result.toExponential(5).replace('.', ',');
      }
      
      // Redondear a 8 decimales para evitar errores de punto flotante
      result = Math.round(result * 1e8) / 1e8;
      
      return result.toString().replace('.', ',');
    } catch (error) {
      console.error('Error en cálculo:', error);
      return 'Error';
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

  const formatDisplay = (value) => {
    if (value === 'Error') return value;
    const numStr = value.toString().replace('.', ',');
    if (numStr.length > maxDigits) {
      return Number(value).toExponential(maxDigits - 7).replace('.', ',');
    }
    return numStr;
  };

  const handleNumberClick = useCallback((number) => {
    if (display === 'Error') {
      setDisplay(number);
      setNewNumber(false);
      return;
    }
    
    if (newNumber) {
      setDisplay(number);
      setNewNumber(false);
    } else {
      const newDisplay = display === '0' ? number : display + number;
      if (newDisplay.replace(',', '').length <= maxDigits) {
        setDisplay(newDisplay);
      }
    }
  }, [newNumber, display, maxDigits]);

  const handleOperationClick = useCallback((op) => {
    if (display === 'Error' || display.startsWith('Error:')) {
      handleClear();
      return;
    }

    try {
      if (newNumber && operation !== null) {
        // Si ya hay una operación pendiente, solo cambiar la operación
        setOperation(op);
        return;
      }

      if (!newNumber) {
        if (firstNumber !== null) {
          const result = calculateResult(operation, firstNumber, display);
          if (result.startsWith('Error')) {
            setDisplay(result);
            setFirstNumber(null);
            setOperation(null);
            setNewNumber(true);
            return;
          }
          setDisplay(result);
          setFirstNumber(result);
        } else {
          setFirstNumber(display);
        }
      }
      
      setOperation(op);
      setNewNumber(true);
    } catch (error) {
      console.error('Error en operación:', error);
      setDisplay('Error');
      setFirstNumber(null);
      setOperation(null);
      setNewNumber(true);
    }
  }, [display, firstNumber, operation, newNumber, calculateResult]);

  const handleEquals = useCallback(() => {
    if (display === 'Error' || display.startsWith('Error:')) {
      return;
    }

    try {
      if (firstNumber !== null && operation !== null && !newNumber) {
        const result = calculateResult(operation, firstNumber, display);
        setDisplay(result);
        
        // Solo agregar al historial si no hay error
        if (!result.startsWith('Error')) {
          addToHistory(`${firstNumber} ${operation} ${display} = ${result}`);
          setFirstNumber(result);
        } else {
          setFirstNumber(null);
        }
        
        setOperation(null);
        setNewNumber(true);
      }
    } catch (error) {
      console.error('Error en equals:', error);
      setDisplay('Error');
      setFirstNumber(null);
      setOperation(null);
      setNewNumber(true);
    }
  }, [firstNumber, operation, display, newNumber, calculateResult, addToHistory]);

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
      return;
    }
    const result = operation.split('=')[1]?.trim() || operation;
    setDisplay(result);
    handleHistoryClose();
  }, []);

  const getButtonStyles = (btn) => ({
    height: { xs: 55, sm: 60 },
    fontSize: { xs: '1.2rem', sm: '1.4rem' },
    borderRadius: 2,
    backgroundColor: isNaN(btn) 
      ? (btn === '=' 
        ? theme.palette.secondary.main 
        : btn === 'C' 
          ? theme.palette.error.main 
          : theme.palette.primary.main)
      : theme.palette.background.paper,
    color: isNaN(btn) ? 'white' : theme.palette.text.primary,
    boxShadow: theme.palette.mode === 'light'
      ? '3px 3px 6px #bebebe, -3px -3px 6px #ffffff'
      : '3px 3px 6px #151515, -3px -3px 6px #252525',
    '&:hover': {
      backgroundColor: isNaN(btn) 
        ? (btn === '=' 
          ? theme.palette.secondary.dark 
          : btn === 'C'
            ? theme.palette.error.dark
            : theme.palette.primary.dark)
        : alpha(theme.palette.primary.main, 0.1),
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'light'
        ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
        : '5px 5px 10px #151515, -5px -5px 10px #252525',
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: theme.palette.mode === 'light'
        ? '2px 2px 4px #bebebe, -2px -2px 4px #ffffff'
        : '2px 2px 4px #151515, -2px -2px 4px #252525',
    },
    minWidth: { xs: '100%', sm: 'auto' },
    padding: { xs: '10px', sm: '15px' },
    transition: 'all 0.2s ease-in-out',
  });

  const handleEquationSolve = (solution) => {
    try {
      let historyEntry = {
        type: 'equation',
        timestamp: new Date(),
        equation: solution.type === 'linear' ? `x = ${solution.result}` : String(solution.result),
        steps: solution.steps,
        originalEquation: solution.type === 'linear' ? 'Ecuación lineal' : 'Expresión matemática'
      };

      setDisplay(historyEntry.equation);
      setHistory(prev => [historyEntry, ...prev]);
      setEquationModalOpen(false);
    } catch (error) {
      console.error('Error al procesar la solución:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(145deg, #f0f0f0, #ffffff)'
            : 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          transition: 'background-color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container 
          maxWidth="sm" 
          sx={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          {...swipeHandlers}
          onTouchStart={handleTouchStart}
        >
          <Paper
            elevation={12}
            sx={{
              width: '100%',
              borderRadius: 4,
              overflow: 'hidden',
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
                : 'linear-gradient(145deg, #2d2d2d, #1a1a1a)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'light'
                ? '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
                : '20px 20px 60px #151515, -20px -20px 60px #252525',
              p: 3,
            }}
          >
            {/* Barra superior con iconos */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 2,
                px: 1,
              }}
            >
              <ThemeSelector 
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Historial" arrow>
                  <IconButton
                    onClick={handleHistoryOpen}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Modo científico" arrow>
                  <IconButton
                    onClick={() => setIsScientificMode(prev => !prev)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <FunctionsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Display de la calculadora */}
            <Paper
              onClick={handleCopyToClipboard}
              sx={{
                background: theme.palette.mode === 'light'
                  ? alpha(theme.palette.primary.main, 0.05)
                  : alpha(theme.palette.primary.main, 0.1),
                p: 3,
                mb: 3,
                borderRadius: 2,
                cursor: 'pointer',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {operation && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.7),
                    fontSize: '1.2rem',
                    mb: 1,
                  }}
                >
                  {firstNumber} {operation}
                </Typography>
              )}
              <Typography 
                variant="h3" 
                sx={{ 
                  color: theme.palette.text.primary,
                  wordBreak: 'break-all',
                  textAlign: 'right',
                  width: '100%',
                  fontSize: display.length > 8 ? '2.5rem' : '3.5rem',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                  textShadow: theme.palette.mode === 'light'
                    ? '1px 1px 2px rgba(0,0,0,0.1)'
                    : '1px 1px 2px rgba(255,255,255,0.1)',
                }}
              >
                {formatDisplay(display)}
              </Typography>
            </Paper>

            {/* Teclado de la calculadora */}
            <Grid container spacing={1.5}>
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    fullWidth
                    sx={{
                      height: { xs: 60, sm: 70 },
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                      borderRadius: 2,
                      backgroundColor: isNaN(btn) 
                        ? (btn === '=' 
                          ? theme.palette.secondary.main 
                          : btn === 'C' 
                            ? theme.palette.error.main 
                            : theme.palette.primary.main)
                        : theme.palette.background.paper,
                      color: isNaN(btn) ? 'white' : theme.palette.text.primary,
                      fontWeight: 'medium',
                      boxShadow: theme.palette.mode === 'light'
                        ? '3px 3px 6px #bebebe, -3px -3px 6px #ffffff'
                        : '3px 3px 6px #151515, -3px -3px 6px #252525',
                      '&:hover': {
                        backgroundColor: isNaN(btn) 
                          ? (btn === '=' 
                            ? alpha(theme.palette.secondary.main, 0.9)
                            : btn === 'C'
                              ? alpha(theme.palette.error.main, 0.9)
                              : alpha(theme.palette.primary.main, 0.9))
                          : alpha(theme.palette.primary.main, 0.1),
                        boxShadow: theme.palette.mode === 'light'
                          ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
                          : '5px 5px 10px #151515, -5px -5px 10px #252525',
                      },
                      '&:active': {
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2)',
                        transform: 'translateY(1px)',
                      },
                    }}
                    onClick={() => {
                      if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                      }
                      
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

            {/* Botones científicos */}
            <AnimatePresence>
              {isScientificMode && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{ mt: 2 }}
                >
                  <Grid container spacing={1.5}>
                    {scientificActions.map((action) => (
                      <Grid item xs={4} key={action.icon}>
                        <ButtonWrapper
                          component={motion.button}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                          fullWidth
                          onClick={() => handleScientificOperation(action.operation)}
                          sx={{
                            height: { xs: 50, sm: 60 },
                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                            borderRadius: 2,
                            backgroundColor: theme.palette.secondary.main,
                            color: 'white',
                            fontWeight: 'medium',
                            boxShadow: theme.palette.mode === 'light'
                              ? '3px 3px 6px #bebebe, -3px -3px 6px #ffffff'
                              : '3px 3px 6px #151515, -3px -3px 6px #252525',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.secondary.main, 0.9),
                              boxShadow: theme.palette.mode === 'light'
                                ? '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
                                : '5px 5px 10px #151515, -5px -5px 10px #252525',
                            },
                            '&:active': {
                              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2)',
                              transform: 'translateY(1px)',
                            },
                          }}
                        >
                          {action.icon}
                        </ButtonWrapper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </AnimatePresence>
          </Paper>
        </Container>
      </Box>

      <DeleteConfirmationModal />
      <ExportModal />
      <ImportModal />

      <HistoryDrawer 
        open={showHistory}
        onClose={handleHistoryClose}
        history={history}
        onSelectOperation={handleSelectOperation}
        onDeleteOperation={handleDeleteOperation}
        onToggleFavorite={handleToggleFavorite}
        onCopyResult={handleCopyResult}
      />

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

      <EquationSolver
        open={equationModalOpen}
        onClose={() => setEquationModalOpen(false)}
        onSolve={handleEquationSolve}
      />
    </ThemeProvider>
  );
};

export default React.memo(Calculator);
