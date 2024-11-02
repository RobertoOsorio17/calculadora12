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
  Divider,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FunctionsIcon from '@mui/icons-material/Functions';
import solveEquation from '../utils/equationSolver';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Resolver Ecuación
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="Ejemplos:
2x + 3 = 15
3x² + 2x - 5 = 0
2x³ - 3x² + x - 6 = 0
|x| + 2 = 5
√(2x + 1) = 3
2x + 3y = 7; 4x - y = 1"
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