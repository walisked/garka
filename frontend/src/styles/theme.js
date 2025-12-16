import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6F00' },
    background: { default: '#f8f9fa', paper: '#fff' }
  },
  typography: { fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' },
  shape: { borderRadius: 12 }
});

export default theme;
