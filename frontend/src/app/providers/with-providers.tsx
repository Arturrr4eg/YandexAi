import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { MuiThemeProvider } from '@/app/providers/mui-theme-provider';
import { AppRouter } from '@/app/providers/router';
import { queryClient } from '@/app/providers/query-client';

export const AppProviders = () => (
  <QueryClientProvider client={queryClient}>
    <MuiThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </MuiThemeProvider>
  </QueryClientProvider>
);
