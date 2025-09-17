import { useState } from 'react';
import { Box, Card, Stack, ToggleButtonGroup, ToggleButton, TextField, Button, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/auth.ts';
import { login, register } from '../api/client.ts';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const AuthPage = () => {
  const { t } = useTranslation();
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const schema = authType === 'login' ? loginSchema : registerSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      let response;
      if (authType === 'login') {
        response = await login(data.email, data.password);
      } else {
        response = await register(data.email, data.password);
      }
      useAuth.getState().login(response.token);
      toast.success(t('authSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('authError'));
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F7FAFC, #FFFFFF)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card sx={{ maxWidth: 400, py: 4, px: 3, borderRadius: '16px' }}>
          <ToggleButtonGroup exclusive value={authType} onChange={(_, v) => setAuthType(v)} fullWidth sx={{ mb: 3 }}>
            <ToggleButton value="login">{t('login')}</ToggleButton>
            <ToggleButton value="register">{t('register')}</ToggleButton>
          </ToggleButtonGroup>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                label={t('email')}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message as string}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
              />
              <TextField
                label={t('password')}
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message as string}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> }}
              />
              {authType === 'register' && (
                <TextField
                  label={t('confirmPassword')}
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message as string}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> }}
                />
              )}
              {Object.keys(errors).length > 0 && <Alert severity="error">{t('formError')}</Alert>}
              <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : t(authType)}
              </Button>
            </Stack>
          </form>
        </Card>
      </motion.div>
    </Box>
  );
};


