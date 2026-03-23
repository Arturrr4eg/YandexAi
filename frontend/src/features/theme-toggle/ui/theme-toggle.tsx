import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Tooltip } from '@mui/material';

import { useThemeStore } from '@/features/theme-toggle/model/theme-store';

export const ThemeToggle = () => {
  const mode = useThemeStore(state => state.mode);
  const toggle = useThemeStore(state => state.toggle);

  return (
    <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
      <IconButton color="primary" onClick={toggle}>
        {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
};
