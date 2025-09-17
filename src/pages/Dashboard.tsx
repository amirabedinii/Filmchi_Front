import { Box, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('dashboard')}</Typography>
      </Box>
    </DashboardLayout>
  );
}


