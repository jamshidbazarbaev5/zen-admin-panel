import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { businessSettingsApi, type BusinessSettings } from '../api/businessSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

export default function BusinessSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusinessSettings>();
  
  const deliveryEnabled = watch('delivery_enabled');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await businessSettingsApi.get();
      Object.entries(response.data).forEach(([key, value]) => {
        setValue(key as keyof BusinessSettings, value);
      });
    } catch (error) {
      console.error('Failed to load business settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BusinessSettings) => {
    try {
      setSaving(true);
      await businessSettingsApi.update(data);
      alert(t('settings_saved_successfully') || 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(t('failed_to_save_settings') || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('loading') || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t('business_settings') || 'Business Settings'}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="open_time">{t('opening_time') || 'Opening Time'}</Label>
            <Input
              id="open_time"
              type="time"
              {...register('open_time', { required: true })}
              className="mt-1"
            />
            {errors.open_time && (
              <p className="text-red-500 text-sm mt-1">{t('field_required') || 'This field is required'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="close_time">{t('closing_time') || 'Closing Time'}</Label>
            <Input
              id="close_time"
              type="time"
              {...register('close_time', { required: true })}
              className="mt-1"
            />
            {errors.close_time && (
              <p className="text-red-500 text-sm mt-1">{t('field_required') || 'This field is required'}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery_enabled"
              checked={deliveryEnabled}
              onCheckedChange={(checked) => setValue('delivery_enabled', checked as boolean)}
            />
            <Label htmlFor="delivery_enabled" className="cursor-pointer">
              {t('enable_delivery') || 'Enable Delivery'}
            </Label>
          </div>

          <div>
            <Label htmlFor="delivery_fee">{t('delivery_fee') || 'Delivery Fee'}</Label>
            <Input
              id="delivery_fee"
              type="number"
              step="0.01"
              {...register('delivery_fee')}
              className="mt-1"
              disabled={!deliveryEnabled}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t('phone') || 'Phone'}</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+998901234567"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="instagram_url">{t('instagram_url') || 'Instagram URL'}</Label>
            <Input
              id="instagram_url"
              type="url"
              {...register('instagram_url')}
              placeholder="https://instagram.com/your_business"
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? (t('saving') || 'Saving...') : (t('save_settings') || 'Save Settings')}
        </Button>
      </form>
    </div>
  );
}
