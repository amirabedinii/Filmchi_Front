// // TODO: Uncomment when SettingsPage is ready to be used
// /*
// import { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Save } from 'lucide-react';
// import { updateUserPreferences, UserPreferences } from '@/services/users';
// import { useUiStore } from '@/stores/useUiStore';
// import toast from 'react-hot-toast';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// export default function SettingsPage() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const theme = useUiStore((s) => s.theme);
//   const language = useUiStore((s) => s.language);
//   const setTheme = useUiStore((s) => s.setTheme);
//   const setLanguage = useUiStore((s) => s.setLanguage);
  
//   const [isSaving, setIsSaving] = useState(false);
//   const [preferences, setPreferences] = useState<Omit<UserPreferences, 'theme'> & { theme: 'light' | 'dark' }>({
//     theme: theme,
//     language: language,
//     notifications: {
//       email: false,
//       push: false
//     },
//     autoplay: false,
//     adultContent: false
//   });

//   useEffect(() => {
//     setPreferences(prev => ({
//       ...prev,
//       theme: theme,
//       language: language
//     }));
//   }, [theme, language]);

//   const handleSave = async () => {
//     try {
//       setIsSaving(true);
      
//       // Update local UI state
//       setTheme(preferences.theme);
//       setLanguage(preferences.language);
      
//       // Save to backend
//       await updateUserPreferences({ preferences });
      
//       toast.success(t('settings.save_success'));
//     } catch (error) {
//       console.error('Failed to save settings:', error);
//       toast.error(t('settings.error_saving'));
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
//             aria-label={t('settings.back')}
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
//             <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('settings.description')}</p>
//           </div>
//         </div>
//         <Button onClick={handleSave} disabled={isSaving}>
//           <Save className="w-4 h-4 mr-2" />
//           {isSaving ? t('settings.saving') : t('settings.save_changes')}
//         </Button>
//       </div>

//       <div className="space-y-6">
//         {/* Appearance Settings */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('settings.theme_section')}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="theme">{t('settings.theme_label')}</Label>
//               <select
//                 id="theme"
//                 value={preferences.theme}
//                 onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
//                 className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md text-sm"
//               >
//                 <option value="light">{t('settings.theme_light')}</option>
//                 <option value="dark">{t('settings.theme_dark')}</option>
//               </select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Language Settings */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('settings.language_section')}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="language">{t('settings.language_label')}</Label>
//               <select
//                 id="language"
//                 value={preferences.language}
//                 onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'en' | 'fa' })}
//                 className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md text-sm"
//               >
//                 <option value="en">{t('settings.language_en')}</option>
//                 <option value="fa">{t('settings.language_fa')}</option>
//               </select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Notification Settings */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('settings.notifications_section')}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="emailNotifications" className="cursor-pointer">
//                 {t('settings.email_notifications')}
//               </Label>
//               <input
//                 type="checkbox"
//                 id="emailNotifications"
//                 checked={preferences.notifications.email}
//                 onChange={(e) => setPreferences({
//                   ...preferences,
//                   notifications: { ...preferences.notifications, email: e.target.checked }
//                 })}
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="pushNotifications" className="cursor-pointer">
//                 {t('settings.push_notifications')}
//               </Label>
//               <input
//                 type="checkbox"
//                 id="pushNotifications"
//                 checked={preferences.notifications.push}
//                 onChange={(e) => setPreferences({
//                   ...preferences,
//                   notifications: { ...preferences.notifications, push: e.target.checked }
//                 })}
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Content Preferences */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('settings.preferences_section')}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="autoplay" className="cursor-pointer">
//                 {t('settings.autoplay')}
//               </Label>
//               <input
//                 type="checkbox"
//                 id="autoplay"
//                 checked={preferences.autoplay}
//                 onChange={(e) => setPreferences({ ...preferences, autoplay: e.target.checked })}
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="adultContent" className="cursor-pointer">
//                 {t('settings.adult_content')}
//               </Label>
//               <input
//                 type="checkbox"
//                 id="adultContent"
//                 checked={preferences.adultContent}
//                 onChange={(e) => setPreferences({ ...preferences, adultContent: e.target.checked })}
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
// */
