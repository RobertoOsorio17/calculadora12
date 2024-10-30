import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { 
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Zoom,
  useTheme,
  useMediaQuery,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import SwipeIcon from '@mui/icons-material/Swipe';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import SwipeRightIcon from '@mui/icons-material/SwipeRight';
import SwipeLeftIcon from '@mui/icons-material/SwipeLeft';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Tutorial = forwardRef(({ onComplete, onSkip }, ref) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = [
    {
      title: '¡Bienvenido!',
      content: 'Vamos a aprender a usar la calculadora',
      action: null
    },
    {
      title: 'Primer paso',
      content: 'Pulsa el número 5',
      action: { type: 'number-click', value: '5' }
    },
    {
      title: 'Operación',
      content: 'Ahora pulsa el símbolo +',
      action: { type: 'operation-click', value: '+' }
    },
    {
      title: 'Segundo número',
      content: 'Pulsa el número 3',
      action: { type: 'number-click', value: '3' }
    },
    {
      title: 'Resultado',
      content: 'Pulsa = para ver el resultado',
      action: { type: 'equals' }
    }
  ];

  useImperativeHandle(ref, () => ({
    checkAction: (action) => {
      console.log('Tutorial recibió acción:', action);
      if (steps[step]?.action) {
        const expectedAction = steps[step].action;
        
        const isMatch = 
          action.type === expectedAction.type && 
          (!expectedAction.value || action.value === expectedAction.value);
        
        if (isMatch) {
          if (step === steps.length - 1) {
            setCompleted(true);
            localStorage.setItem('hasSeenTutorial', 'true');
            setTimeout(onComplete, 1000);
          } else {
            setStep(prev => prev + 1);
          }
        }
      }
    }
  }));

  const handleSkip = () => {
    setCompleted(true);
    localStorage.setItem('hasSeenTutorial', 'true');
    onSkip();
  };

  const handleDragEnd = (event, info) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
  };

  if (completed) return null;

  return (
    <Zoom in={!completed}>
      <Paper
        component={motion.div}
        drag
        dragTransition={{ 
          power: 0.1,
          timeConstant: 200,
          modifyTarget: target => Math.round(target / 50) * 50 
        }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x: position.x,
          y: position.y,
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 'calc(100% - 32px)' : '90%',
          maxWidth: 400,
          zIndex: 1301,
        }}
      >
        <Box
          sx={{
            width: '40px',
            height: '4px',
            backgroundColor: theme.palette.action.hover,
            borderRadius: '2px',
            margin: '0 auto 8px auto'
          }}
        />

        <IconButton
          sx={{ 
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={handleSkip}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" gutterBottom>
          {steps[step].title}
        </Typography>
        
        <Typography sx={{ mb: 2 }}>
          {steps[step].content}
        </Typography>

        {step === 0 && (
          <Button 
            variant="contained" 
            onClick={() => setStep(1)}
          >
            Empezar
          </Button>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            color="inherit"
            onClick={handleSkip}
          >
            Saltar Tutorial
          </Button>
          
          <Typography variant="body2" color="textSecondary">
            {`Paso ${step + 1} de ${steps.length}`}
          </Typography>
        </Box>
      </Paper>
    </Zoom>
  );
});

Tutorial.displayName = 'Tutorial';

export default Tutorial; 