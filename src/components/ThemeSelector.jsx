import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  Tooltip,
  Divider,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { motion } from 'framer-motion';

const themes = [
  {
    name: 'Claro',
    primary: '#1976d2',
    secondary: '#9c27b0',
    background: '#ffffff',
    icon: <LightModeIcon />,
  },
  {
    name: 'Rosa Pastel',
    primary: '#ec407a',
    secondary: '#f48fb1',
    background: '#fff0f3',
    icon: <ColorLensIcon />,
  },
  {
    name: 'Oscuro',
    primary: '#90caf9',
    secondary: '#ce93d8',
    background: '#121212',
    text: '#ffffff',
    icon: <DarkModeIcon />,
  },
  {
    name: 'Azul Océano',
    primary: '#0288d1',
    secondary: '#0097a7',
    background: '#e3f2fd',
    icon: <ColorLensIcon />,
  },
  {
    name: 'Verde Bosque',
    primary: '#2e7d32',
    secondary: '#558b2f',
    background: '#f1f8e9',
    icon: <ColorLensIcon />,
  },
];

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (newTheme) => {
    onThemeChange(newTheme);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Cambiar tema" arrow>
        <IconButton
          onClick={handleClick}
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          component: motion.div,
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.2 },
          sx: {
            width: 280,
            maxHeight: 'calc(100vh - 96px)',
            overflow: 'auto',
            mt: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Seleccionar tema
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          {themes.map((themeOption) => (
            <MenuItem
              key={themeOption.name}
              onClick={() => handleThemeSelect(themeOption)}
              selected={currentTheme.name === themeOption.name}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                height: 56,
                '&:last-child': { mb: 0 },
                '&.Mui-selected': {
                  backgroundColor: themeOption.primary + '15',
                  '&:hover': {
                    backgroundColor: themeOption.primary + '25',
                  },
                },
                '&:hover': {
                  backgroundColor: themeOption.primary + '10',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: themeOption.primary,
                  minWidth: 44,
                }}
              >
                {themeOption.icon}
              </ListItemIcon>
              <ListItemText
                primary={themeOption.name}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: currentTheme.name === themeOption.name ? 600 : 400,
                  },
                }}
              />
              {currentTheme.name === themeOption.name && (
                <CheckIcon
                  sx={{
                    ml: 1,
                    color: themeOption.primary,
                    fontSize: 20,
                  }}
                />
              )}
              <Box
                sx={{
                  ml: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: themeOption.primary,
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: themeOption.secondary,
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default ThemeSelector; 