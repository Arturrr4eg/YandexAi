import { Alert, Box, Typography } from '@mui/material';

type ItemRevisionAlertProps = {
  missingFields: string[];
};

export const ItemRevisionAlert = ({ missingFields }: ItemRevisionAlertProps) => (
  <Alert
    severity="warning"
    sx={{
      alignItems: 'flex-start',
      backgroundColor: theme => (theme.palette.mode === 'dark' ? '#3A2E1F' : '#F9F1E6'),
      borderRadius: 3,
    }}
  >
    <Typography fontWeight={700} gutterBottom variant="subtitle2">
      Требуются доработки
    </Typography>
    <Typography variant="body2">
      Заполните недостающие поля, чтобы карточка выглядела полной и аккуратной.
    </Typography>
    {missingFields.length > 0 ? (
      <Box component="ul" sx={{ m: 0, pl: 2.5, pt: 1 }}>
        {missingFields.map(field => (
          <Box component="li" key={field} sx={{ color: 'text.secondary' }}>
            <Typography color="inherit" variant="body2">
              {field}
            </Typography>
          </Box>
        ))}
      </Box>
    ) : null}
  </Alert>
);
