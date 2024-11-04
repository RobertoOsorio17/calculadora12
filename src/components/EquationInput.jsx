import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  Paper,
  Divider,
  Grid,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FunctionsIcon from '@mui/icons-material/Functions';
import solveEquation from '../utils/equationSolver';
import EquationGraph from './EquationGraph';

const EquationInput = ({ 
  open, 
  onClose, 
  onResult, 
  equation, 
  setEquation, 
  equationButtons,
  onGraphControlsChange 
}) => {
  const [error, setError] = useState('');
  const [solution, setSolution] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const debounceRef = useRef(null);
  const [showCalculatorButtons, setShowCalculatorButtons] = useState(true);

  const equationExamples = [
    {
      type: 'Ecuación lineal',
      example: '2x + 3 = 10',
      description: 'Ecuaciones de primer grado'
    },
    {
      type: 'Ecuación cuadrática',
      example: 'x² + 2x + 1 = 0',
      description: 'Ecuaciones de segundo grado'
    },
    {
      type: 'Sistema de ecuaciones',
      example: '2x + y = 5, 3x - y = 1',
      description: 'Sistemas de ecuaciones lineales'
    },
    {
      type: 'Ecuación con fracciones',
      example: '(x+1)/2 = 3',
      description: 'Ecuaciones con términos fraccionarios'
    }
  ];

  useEffect(() => {
    if (open) {
      setInputValue(equation);
    }
  }, [open, equation]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!inputValue.trim()) {
      setSolution(null);
      setError('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      try {
        const solutions = solveEquation(inputValue);
        setSolution(solutions);
        setEquation(inputValue);
        if (JSON.stringify(solutions) !== JSON.stringify(solution)) {
          onResult(formatSolutionForDisplay(solutions));
        }
        setError('');
      } catch (error) {
        setError(error.message);
      }
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  useEffect(() => {
    if (showGraph) {
      setShowCalculatorButtons(false);
    } else {
      setShowCalculatorButtons(true);
    }
  }, [showGraph]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const formatSolutionForDisplay = (solutions) => {
    if (!solutions || solutions.length === 0) return '';
    
    if (solutions[0].type === 'system') {
      return solutions[0].steps.join('\n');
    }
    
    return solutions.map((sol, index) => {
      let result = '';
      if (sol.multiplicity) {
        result = `x${index + 1} = ${sol.x} (multiplicidad: ${sol.multiplicity})`;
      } else if (sol.type === 'complex') {
        result = `x${index + 1} = ${sol.x}`;
      } else if (sol.y !== undefined) {
        result = `x = ${sol.x}\ny = ${sol.y}`;
      } else {
        result = `x${solutions.length > 1 ? index + 1 : ''} = ${sol.x}`;
      }
      return result;
    }).join('\n');
  };

  const handleGraphControlsChange = (isOpen) => {
    setShowCalculatorButtons(!isOpen);
    if (onGraphControlsChange) {
      onGraphControlsChange(isOpen);
    }
  };

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Resolver ecuación
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        pb: isMobile ? 10 : 3
      }}>
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          error={!!error}
          helperText={error}
          placeholder="Ejemplo: 2x + 3 = 10"
          variant="outlined"
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1.2rem',
              p: 2
            }
          }}
        />

        {!solution && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
            mt: 2
          }}>
            {equationExamples.map((item, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => setInputValue(item.example)}
              >
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {item.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace',
                    mt: 1 
                  }}
                >
                  {item.example}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        {solution && (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Solución:
              </Typography>
              {solution[0].steps ? (
                solution[0].steps.map((step, index) => (
                  <Typography 
                    key={index} 
                    variant="body1" 
                    sx={{ 
                      my: 1,
                      fontFamily: 'monospace',
                      color: index === 0 ? theme.palette.primary.main : 'inherit'
                    }}
                  >
                    {step}
                  </Typography>
                ))
              ) : (
                <Typography 
                  variant="body1" 
                  sx={{ fontFamily: 'monospace' }}
                >
                  {formatSolutionForDisplay(solution)}
                </Typography>
              )}
            </Paper>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<FunctionsIcon />}
              onClick={() => setShowGraph(!showGraph)}
              sx={{ 
                my: 2,
                height: 48,
                borderRadius: 2
              }}
            >
              {showGraph ? 'Ocultar gráfico' : 'Mostrar gráfico'}
            </Button>

            {showGraph && (
              <Box sx={{ 
                height: isMobile ? 'calc(100vh - 500px)' : 400,
                minHeight: 300,
                position: 'relative'
              }}>
                <EquationGraph 
                  equation={inputValue}
                  solutions={solution}
                  onAddToHistory={onResult}
                  onMenuOpenChange={handleGraphControlsChange}
                  showCalculatorButtons={showCalculatorButtons}
                />
              </Box>
            )}

            {solution && showCalculatorButtons && (
              <Box sx={{ 
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                p: 2,
                zIndex: theme.zIndex.drawer + 2
              }}>
                <Grid container spacing={1}>
                  {equationButtons.map((btn) => (
                    <Grid item xs={4} key={btn.icon}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setEquation(prev => prev + btn.operation)}
                        sx={{
                          minHeight: 48,
                          fontSize: '1.2rem',
                          borderRadius: 2,
                          '&:active': {
                            transform: 'scale(0.98)'
                          }
                        }}
                      >
                        {btn.icon}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EquationInput; 