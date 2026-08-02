import { useEffect, useState } from 'react';
import { registrationGiftApi, type RegistrationGiftSettings } from '../api/registrationGift';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

const columns = [
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Включен' : 'Отключен'}
      </span>
    ),
  },
  {
    header: 'Сумма ваучера',
    accessorKey: 'amount',
    cell: (row: any) => `${parseFloat(row.amount || '0').toFixed(2)} сум`,
  },
  {
    header: 'Срок действия',
    accessorKey: 'expiry_hours',
    cell: (row: any) => row.expiry_hours ? `${row.expiry_hours} ч.` : 'Бессрочный',
  },
  {
    header: 'Обновлено',
    accessorKey: 'updated_at',
    cell: (row: any) => row.updated_at ? new Date(row.updated_at).toLocaleString() : '—',
  },
];

export default function RegistrationGiftPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RegistrationGiftSettings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await registrationGiftApi.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Ошибка при загрузке настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      setSaving(true);
      const response = await registrationGiftApi.update(data);
      setSettings(response.data);
      toast.success('Настройки успешно сохранены!');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const formFields = [
    { name: 'amount', label: 'Сумма ваучера (сум)', type: 'number' as const, required: true },
    { name: 'expiry_hours', label: 'Срок действия (в часах)', type: 'number' as const, placeholder: 'Оставьте пустым для бессрочного' },
    { name: 'is_active', label: 'Включить выдачу приветственного ваучера', type: 'checkbox' as const },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Приветственный ваучер (За регистрацию)</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Настройки ваучера, который выдаётся клиентам при первой регистрации с телефоном в Telegram.
      </p>

      <ResourceTable
        data={settings ? [{ id: 1, ...settings }] : []}
        columns={columns}
        isLoading={loading}
        onEdit={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Редактировать настройки</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ResourceForm
              fields={formFields}
              onSubmit={handleUpdate}
              defaultValues={settings || { is_active: false, amount: '0' }}
              isSubmitting={saving}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
