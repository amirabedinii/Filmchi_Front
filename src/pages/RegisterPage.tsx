import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { register as registerReq } from '@/services/auth';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => registerReq({ email, password }),
    onSuccess: () => {
      toast.success(t('auth.register_success'));
      navigate('/');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t('auth.register_failed');
      toast.error(msg);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('auth.fill_required'));
      return;
    }
    if (password !== confirm) {
      toast.error(t('auth.password_mismatch'));
      return;
    }
    mutate();
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t('app.register')}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300" htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email_placeholder')}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password_placeholder')}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300" htmlFor="confirm">{t('auth.confirm_password')}</label>
          <input
            id="confirm"
            type="password"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('auth.confirm_password_placeholder')}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? t('auth.registering') : t('app.register')}
        </button>
      </form>
      <p className="text-sm mt-3">
        {t('auth.have_account')}{' '}<Link to="/login" className="underline">{t('app.login')}</Link>
      </p>
    </div>
  );
}


