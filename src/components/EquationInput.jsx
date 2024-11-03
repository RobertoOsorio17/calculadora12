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
  Grid
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
  equationButtons 
}) => {
  const [error, setError] = useState('');
  const [solution, setSolution] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();
  const debounceRef = useRef(null);

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
        onResult(formatSolutionForDisplay(solutions));
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
  }, [inputValue, onResult, setEquation]);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Resolver ecuación
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          error={!!error}
          helperText={error}
          placeholder="Ejemplos: 2x+3y=7; 4x-y=1"
          multiline
          rows={3}
          sx={{ 
            mb: 2,
            '& .MuiInputBase-input::placeholder': {
              fontFamily: 'monospace',
              whiteSpace: 'pre-line',
              fontSize: '0.9rem',
              opacity: 0.7
            }
          }}
        />
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {equationButtons.map((btn) => (
            <Grid item xs={4} key={btn.icon}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setEquation(prev => prev + btn.operation)}
                sx={{
                  minHeight: 40,
                  fontSize: '1.2rem'
                }}
              >
                {btn.icon}
              </Button>
            </Grid>
          ))}
        </Grid>

        {solution && (
          <>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mt: 2, 
                bgcolor: theme.palette.background.default,
                position: 'relative'
              }}
            >
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

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FunctionsIcon />}
                onClick={() => setShowGraph(!showGraph)}
                sx={{ my: 1 }}
              >
                {showGraph ? 'Ocultar gráfico' : 'Mostrar gráfico'}
              </Button>
            </Box>

            {showGraph && (
              <EquationGraph 
                equation={inputValue}
                solutions={solution}
              />
            )}
          </>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Tipos de ecuaciones soportadas:
          </Typography>
          <ul>
            <li>Lineales: ax + b = c</li>
            <li>Cuadráticas: ax² + bx + c = 0</li>
            <li>Cúbicas: ax³ + bx² + cx + d = 0</li>
            <li>Valor absoluto: |x| + b = c</li>
            <li>Raíz cuadrada: √(ax + b) = c</li>
            <li>Sistemas lineales: 2x + 3y = 7; 4x - y = 1</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquationInput; 