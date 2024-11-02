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
      if (sol.type === 'complex') {
        return `x${index + 1} = ${sol.x}`;
      } else if (sol.y !== undefined) {
        return `x = ${sol.x}\ny = ${sol.y}`;
      } else {
        return `x${solutions.length > 1 ? index + 1 : ''} = ${sol.x}`;
      }
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
            placeholder="Ejemplos: x² + 2x + 1 = 0 | 2x + 3y = 7; 4x - y = 1"
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
              <li>Sistemas de ecuaciones lineales: 2x + 3y = 7; 4x - y = 1</li>
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