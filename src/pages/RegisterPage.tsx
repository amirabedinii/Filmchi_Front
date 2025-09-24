import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">{t('app.register')}</h1>
      <p className="opacity-75">Placeholder register form (Phase 2).</p>
    </div>
  );
}


