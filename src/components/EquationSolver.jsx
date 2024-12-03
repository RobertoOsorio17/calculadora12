import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import BackspaceIcon from '@mui/icons-material/Backspace';
import InfoIcon from '@mui/icons-material/Info';
import { solveEquation, validateEquation } from '../utils/equationSolver';

const equationButtons = [
  { symbol: 'x', type: 'variable' },
  { symbol: 'y', type: 'variable' },
  { symbol: '=', type: 'operator' },
  { symbol: '(', type: 'operator' },
  { symbol: ')', type: 'operator' },
  { symbol: '^', type: 'operator', tooltip: 'Potencia' },
  { symbol: '√', type: 'function', tooltip: 'Raíz cuadrada' },
  { symbol: 'sin', type: 'function' },
  { symbol: 'cos', type: 'function' },
  { symbol: 'tan', type: 'function' },
  { symbol: 'log', type: 'function' },
  { symbol: 'ln', type: 'function' },
];

const EquationSolver = ({ open, onClose, onSolve }) => {
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleButtonClick = (symbol) => {
    setEquation(prev => prev + symbol);
    setError(null);
    setSolution(null);
    setActiveStep(0);
  };

  const handleBackspace = () => {
    setEquation(prev => prev.slice(0, -1));
    setError(null);
    setSolution(null);
    setActiveStep(0);
  };

  const handleClear = () => {
    setEquation('');
    setSolution(null);
    setError(null);
    setActiveStep(0);
  };

  const handleSolve = () => {
    try {
      validateEquation(equation);
      const result = solveEquation(equation);
      setSolution(result);
      onSolve(result);
      setError(null);
      setActiveStep(0);
    } catch (err) {
      setError(err.message);
      setSolution(null);
    }
  };

  const handleStepNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleStepBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.2 },
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <Typography variant="h6">Resolver Ecuación</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'background.default',
          }}
        >
          <TextField
            fullWidth
            value={equation}
            onChange={(e) => {
              setEquation(e.target.value);
              setError(null);
              setSolution(null);
              setActiveStep(0);
            }}
            placeholder="Escribe o usa los botones para crear tu ecuación"
            variant="outlined"
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleBackspace} size="small">
                  <BackspaceIcon />
                </IconButton>
              ),
            }}
          />

          {solution && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Solución:
              </Typography>
              {solution.type === 'linear' ? (
                <Typography variant="h6">
                  x = {solution.result}
                </Typography>
              ) : (
                <Typography variant="h6">
                  {solution.result}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Pasos de resolución:
              </Typography>
              <Stepper 
                activeStep={activeStep} 
                orientation="vertical"
                sx={{ mt: 2 }}
              >
                {solution.steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>
                      <Typography variant="body2">
                        {step.split(':')[0]}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography color="text.secondary">
                        {step.split(':')[1] || step}
                      </Typography>
                      <Box sx={{ mb: 2, mt: 1 }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleStepBack}
                          sx={{ mr: 1 }}
                        >
                          Atrás
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleStepNext}
                          sx={{ mr: 1 }}
                          disabled={index === solution.steps.length - 1}
                        >
                          Siguiente
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </Paper>

        <Grid container spacing={1}>
          {equationButtons.map((btn) => (
            <Grid item xs={4} key={btn.symbol}>
              <Tooltip title={btn.tooltip || ''} arrow>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleButtonClick(btn.symbol)}
                  sx={{
                    minHeight: 45,
                    typography: 'body1',
                    fontWeight: 'medium',
                  }}
                >
                  {btn.symbol}
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="info" fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            Usa paréntesis para agrupar términos y especificar el orden de las operaciones.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        gap: 1,
      }}>
        <Button onClick={handleClear} color="inherit">
          Limpiar
        </Button>
        <Button
          onClick={handleSolve}
          variant="contained"
          disabled={!equation}
        >
          Resolver
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquationSolver; 