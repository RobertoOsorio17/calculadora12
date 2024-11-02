import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FunctionsIcon from '@mui/icons-material/Functions';
import solveEquation from '../utils/equationSolver';

const EquationInput = ({ open, onClose, onResult }) => {
  const [equation, setEquation] = useState('');
  const [error, setError] = useState('');
  const [solution, setSolution] = useState(null);
  const theme = useTheme();

  const handleSolve = () => {
    try {
      const solutions = solveEquation(equation);
      setSolution(solutions);
      onResult(formatSolutionForDisplay(solutions));
      setError('');
    } catch (error) {
      setError(error.message);
      setSolution(null);
    }
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
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Resolver Ecuación
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Ingrese la ecuación"
            placeholder="Ecuación lineal: 2x + 1 = 0
Ecuación cuadrática: x² + 2x + 1 = 0
Sistema de ecuaciones: 2x + 3y = 5; 4x - y = 1"
            multiline
            rows={3}
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
          />
          
          {solution && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                mt: 2, 
                bgcolor: theme.palette.background.default 
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button 
          variant="contained" 
          onClick={handleSolve}
          disabled={!equation.trim()}
        >
          Resolver
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquationInput; 