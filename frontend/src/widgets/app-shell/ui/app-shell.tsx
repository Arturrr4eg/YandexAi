import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/features/theme-toggle/ui/theme-toggle';

export const AppShell = () => (
  <Box
    component="main"
    sx={{
      minHeight: '100vh',
      px: { xs: 1.5, sm: 2, md: 3 },
      py: { xs: 1.5, sm: 2, md: 3 },
      width: '100%',
    }}
  >
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 8, sm: 12, md: 16 },
        top: { xs: 8, sm: 12, md: 16 },
        zIndex: theme => theme.zIndex.tooltip,
      }}
    >
      <ThemeToggle />
    </Box>
    <Outlet />
  </Box>
);
