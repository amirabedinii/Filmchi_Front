import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, AlertTriangle } from 'lucide-react';
import { updateUserPrivacy, exportUserData, deleteUserAccount, UserPrivacy } from '@/services/users';
import { logout } from '@/services/auth';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [privacy, setPrivacy] = useState<UserPrivacy>({
    profileVisible: true,
    activityVisible: true,
    listsVisible: true
  });

  const handleSavePrivacy = async () => {
    try {
      setIsSavingPrivacy(true);
      await updateUserPrivacy({ privacy });
      toast.success(t('account.privacy_saved'));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      toast.error(t('account.privacy_error'));
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filmchi-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('account.export_success'));
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error(t('account.export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
      toast.success(t('account.delete_success'));
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(t('account.delete_error'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label={t('account.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('account.title')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('account.description')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('account.privacy_section')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileVisible" className="cursor-pointer">
                {t('account.profile_visible')}
              </Label>
              <input
                type="checkbox"
                id="profileVisible"
                checked={privacy.profileVisible}
                onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activityVisible" className="cursor-pointer">
                {t('account.activity_visible')}
              </Label>
              <input
                type="checkbox"
                id="activityVisible"
                checked={privacy.activityVisible}
                onChange={(e) => setPrivacy({ ...privacy, activityVisible: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="listsVisible" className="cursor-pointer">
                {t('account.lists_visible')}
              </Label>
              <input
                type="checkbox"
                id="listsVisible"
                checked={privacy.listsVisible}
                onChange={(e) => setPrivacy({ ...privacy, listsVisible: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleSavePrivacy} disabled={isSavingPrivacy}>
                <Save className="w-4 h-4 mr-2" />
                {isSavingPrivacy ? t('account.saving') : t('account.save_privacy')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle>{t('account.data_section')}</CardTitle>
            <CardDescription>{t('account.export_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportData} disabled={isExporting} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? t('account.exporting') : t('account.export_data')}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone - Delete Account */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('account.danger_zone')}
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              {t('account.delete_warning')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowDeleteDialog(true)} 
              variant="destructive"
            >
              {t('account.delete_account')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              {t('account.delete_account')}
            </DialogTitle>
            <DialogDescription>
              {t('account.delete_confirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t('account.delete_cancel_button')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? t('account.deleting') : t('account.delete_confirm_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
