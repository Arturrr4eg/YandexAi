import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { useThemeStore } from '@/features/theme-toggle/model/theme-store';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2f80ff' },
    background: {
      default: '#F7F5F8',
      paper: '#f7f8fa',
    },
    text: {
      primary: '#2f3338',
      secondary: '#7f8793',
    },
    warning: {
      main: '#e5a100',
      light: '#fff4d8',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8ea5c7' },
    background: {
      default: '#181c22',
      paper: '#232832',
    },
    text: {
      primary: '#e4e7eb',
      secondary: '#a0a7b3',
    },
    warning: {
      main: '#d9bd7d',
      light: '#403827',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
  },
});

export const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemeStore(state => state.mode);
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '#root': { minHeight: '100vh' },
          a: { color: 'inherit', textDecoration: 'none' },
        }}
      />
      {children}
    </ThemeProvider>
  );
};
