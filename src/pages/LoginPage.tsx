import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">{t('app.login')}</h1>
      <p className="opacity-75">Placeholder login form (Phase 2).</p>
    </div>
  );
}


