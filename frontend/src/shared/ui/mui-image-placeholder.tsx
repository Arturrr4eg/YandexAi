import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Box } from '@mui/material';

type Props = {
  label?: string;
  iconSize?: number;
};

export const MuiImagePlaceholder = ({ label = 'Изображение', iconSize = 56 }: Props) => (
  <Box
    aria-label={label}
    role="img"
    sx={{
      alignItems: 'center',
      color: 'text.disabled',
      display: 'inline-flex',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <ImageOutlinedIcon sx={{ fontSize: iconSize }} />
  </Box>
);
