import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getIikoSettings, 
  updateIikoSettings, 
  getBusinessSettings, 
  updateBusinessSettings,
  iikoOrganizationsApi,
  iikoTerminalGroupsApi,
  iikoPaymentTypesApi,
  type IikoSettings, 
  type BusinessSettings,
} from '../api/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [iikoSettings, setIikoSettings] = useState<IikoSettings | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [iikoForm, setIikoForm] = useState({
    organization: 0,
    terminal_group: 0,
    payment_type: 0,
  });

  const [businessForm, setBusinessForm] = useState({
    open_time: '',
    close_time: '',
    delivery_enabled: false,
    delivery_fee: '',
    instagram_url: '',
    phone: '',
  });

  // Use React Query hooks for fetching data
  const { data: organizationsData } = iikoOrganizationsApi.useGetResources({
    params: { is_active: true },
  });
  
  const { data: terminalGroupsData } = iikoTerminalGroupsApi.useGetResources({
    params: iikoForm.organization ? { organization: iikoForm.organization } : undefined,
    enabled: !!iikoForm.organization,
  });
  
  const { data: paymentTypesData } = iikoPaymentTypesApi.useGetResources({
    params: { is_deleted: false },
  });

  const organizations = Array.isArray(organizationsData) 
    ? organizationsData 
    : organizationsData?.results || [];
    
  const terminalGroups = Array.isArray(terminalGroupsData)
    ? terminalGroupsData
    : terminalGroupsData?.results || [];
    
  const paymentTypes = Array.isArray(paymentTypesData)
    ? paymentTypesData
    : paymentTypesData?.results || [];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [iiko, business] = await Promise.all([
        getIikoSettings().catch(() => null),
        getBusinessSettings().catch(() => null),
      ]);
      
      if (iiko) {
        setIikoSettings(iiko);
        setIikoForm({
          organization: iiko.organization,
          terminal_group: iiko.terminal_group,
          payment_type: iiko.payment_type,
        });
      }

      if (business) {
        setBusinessSettings(business);
        setBusinessForm(business);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIikoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateIikoSettings(iikoForm);
      loadSettings();
    } catch (error) {
      console.error('Failed to update iiko settings:', error);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBusinessSettings(businessForm);
      loadSettings();
    } catch (error) {
      console.error('Failed to update business settings:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>

      <div className="space-y-8">
        {/* iiko Settings */}
        {iikoSettings ? (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('iikoSettings')}</h2>
            {iikoSettings && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p><strong>{t('organizationName')}:</strong> {iikoSettings.organization_name}</p>
                <p><strong>{t('terminalGroupName')}:</strong> {iikoSettings.terminal_group_name}</p>
                <p><strong>{t('paymentTypeName')}:</strong> {iikoSettings.payment_type_name}</p>
                <p><strong>{t('lastSynced')}:</strong> {new Date(iikoSettings.last_synced_at).toLocaleString()}</p>
              </div>
            )}
            
            <form onSubmit={handleIikoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="organization">{t('organization')}</Label>
                <select
                  id="organization"
                  value={iikoForm.organization}
                  onChange={(e) => {
                    const orgId = parseInt(e.target.value);
                    setIikoForm({ ...iikoForm, organization: orgId, terminal_group: 0 });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="0">{t('selectOrganization')}</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} - {org.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="terminal_group">{t('terminalGroup')}</Label>
                <select
                  id="terminal_group"
                  value={iikoForm.terminal_group}
                  onChange={(e) => setIikoForm({ ...iikoForm, terminal_group: parseInt(e.target.value) })}
                  disabled={!iikoForm.organization || terminalGroups.length === 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="0">{t('selectTerminalGroup')}</option>
                  {terminalGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="payment_type">{t('paymentType')}</Label>
                <select
                  id="payment_type"
                  value={iikoForm.payment_type}
                  onChange={(e) => setIikoForm({ ...iikoForm, payment_type: parseInt(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="0">{t('selectPaymentType')}</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.payment_type_kind})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit">{t('update')}</Button>
            </form>
          </div>
        ) : (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('iikoSettings')}</h2>
            <p className="text-muted-foreground">Settings endpoint not available. Please ensure the backend API is running.</p>
          </div>
        )}

        {/* Business Settings */}
        {businessSettings ? (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('businessSettings')}</h2>
            
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="open_time">{t('openTime')}</Label>
                  <Input
                    id="open_time"
                    type="time"
                    value={businessForm.open_time}
                    onChange={(e) => setBusinessForm({ ...businessForm, open_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="close_time">{t('closeTime')}</Label>
                  <Input
                    id="close_time"
                    type="time"
                    value={businessForm.close_time}
                    onChange={(e) => setBusinessForm({ ...businessForm, close_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery_enabled"
                  checked={businessForm.delivery_enabled}
                  onCheckedChange={(checked) => setBusinessForm({ ...businessForm, delivery_enabled: checked as boolean })}
                />
                <Label htmlFor="delivery_enabled">{t('deliveryEnabled')}</Label>
              </div>

              <div>
                <Label htmlFor="delivery_fee">{t('deliveryFee')}</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  value={businessForm.delivery_fee}
                  onChange={(e) => setBusinessForm({ ...businessForm, delivery_fee: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="instagram_url">{t('instagramUrl')}</Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={businessForm.instagram_url}
                  onChange={(e) => setBusinessForm({ ...businessForm, instagram_url: e.target.value })}
                />
              </div>

              <Button type="submit">{t('update')}</Button>
            </form>
          </div>
        ) : (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('businessSettings')}</h2>
            <p className="text-muted-foreground">Settings endpoint not available. Please ensure the backend API is running.</p>
          </div>
        )}
      </div>
    </div>
  );
}
