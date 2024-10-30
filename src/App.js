import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';
import Calculator from './components/Calculator';
import { useState, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css';

function App() {
  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2196f3' : '#90caf9',
            dark: mode === 'light' ? '#1976d2' : '#42a5f5',
          },
          secondary: {
            main: mode === 'light' ? '#66bb6a' : '#81c784',
            dark: mode === 'light' ? '#43a047' : '#66bb6a',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        transitions: {
          duration: {
            enteringScreen: 500,
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: theme.palette.text.primary,
          }}
          onClick={() => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Calculator />
      </div>
    </ThemeProvider>
  );
}

export default App;
