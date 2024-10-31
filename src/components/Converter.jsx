import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  useTheme,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { motion } from 'framer-motion';
import units from '../utils/units';

const Converter = () => {
  const theme = useTheme();
  const [converterType, setConverterType] = useState('volumen');
  const [fromUnit, setFromUnit] = useState(units[converterType].units[0].valor);
  const [toUnit, setToUnit] = useState(units[converterType].units[1].valor);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromUnitLabel, setFromUnitLabel] = useState(units[converterType].units[0].abreviatura);
  const [toUnitLabel, setToUnitLabel] = useState(units[converterType].units[1].abreviatura);

  const handleConversion = (value, from, to) => {
    if (value === '') {
      setToValue('');
      return;
    }

    if (converterType === 'temperatura') {
      const formulas = units.temperatura.formulas;
      let resultado;
      
      if (fromUnitLabel === '°C' && toUnitLabel === 'K') {
        resultado = formulas.C_to_K(parseFloat(value));
      } else if (fromUnitLabel === 'K' && toUnitLabel === '°C') {
        resultado = formulas.K_to_C(parseFloat(value));
      } else if (fromUnitLabel === '°C' && toUnitLabel === '°F') {
        resultado = formulas.C_to_F(parseFloat(value));
      } else if (fromUnitLabel === '°F' && toUnitLabel === '°C') {
        resultado = formulas.F_to_C(parseFloat(value));
      } else if (fromUnitLabel === 'K' && toUnitLabel === '°F') {
        resultado = formulas.K_to_F(parseFloat(value));
      } else if (fromUnitLabel === '°F' && toUnitLabel === 'K') {
        resultado = formulas.F_to_K(parseFloat(value));
      } else {
        resultado = value;
      }
      setToValue(resultado.toFixed(2));
    } else {
      const base = value * from;
      const resultado = base / to;
      setToValue(resultado.toFixed(6));
    }
  };

  const handleSwapUnits = () => {
    const tempUnit = fromUnit;
    const tempLabel = fromUnitLabel;
    setFromUnit(toUnit);
    setFromUnitLabel(toUnitLabel);
    setToUnit(tempUnit);
    setToUnitLabel(tempLabel);
    handleConversion(fromValue, toUnit, tempUnit);
  };

  useEffect(() => {
    handleConversion(fromValue, fromUnit, toUnit);
  }, [fromValue, fromUnit, toUnit]);

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
          : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Tipo de Conversión</InputLabel>
        <Select
          value={converterType}
          onChange={(e) => setConverterType(e.target.value)}
          label="Tipo de Conversión"
        >
          {Object.entries(units).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.2rem',
                backgroundColor: theme.palette.background.paper,
              }
            }}
            InputProps={{
              endAdornment: (
                <Typography variant="body2" color="textSecondary">
                  {fromUnitLabel}
                </Typography>
              )
            }}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
          <Tooltip title="Intercambiar unidades">
            <IconButton 
              onClick={handleSwapUnits}
              sx={{ 
                transform: 'rotate(90deg)',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <SwapVertIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="De"
            value={fromUnit}
            onChange={(e) => {
              setFromUnit(parseFloat(e.target.value));
              const unit = units[converterType].units.find(u => u.valor === parseFloat(e.target.value));
              setFromUnitLabel(unit.abreviatura);
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {units[converterType].units.map((unit) => (
              <MenuItem key={unit.abreviatura} value={unit.valor}>
                {unit.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="A"
            value={toUnit}
            onChange={(e) => {
              setToUnit(parseFloat(e.target.value));
              const unit = units[converterType].units.find(u => u.valor === parseFloat(e.target.value));
              setToUnitLabel(unit.abreviatura);
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {units[converterType].units.map((unit) => (
              <MenuItem key={unit.abreviatura} value={unit.valor}>
                {unit.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Resultado"
            value={toValue}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Typography variant="body2" color="textSecondary">
                  {toUnitLabel}
                </Typography>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.2rem',
                backgroundColor: theme.palette.background.paper,
              }
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Converter; 