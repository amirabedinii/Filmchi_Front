import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{t('app.title')}</h1>
      <p className="opacity-80">Film discovery platform. Phase 1 scaffold.</p>
    </div>
  );
}


