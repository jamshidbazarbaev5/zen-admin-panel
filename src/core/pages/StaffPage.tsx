import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key } from 'lucide-react';
import { useGetStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useSetStaffPassword, type Staff } from '../api/staff';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';

export default function StaffPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data: staffData, isLoading } = useGetStaff({ params: { page: currentPage } });
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const setStaffPassword = useSetStaffPassword();

  const staff = staffData?.results || [];
  const totalCount = staffData?.count || 0;

  const columns = [
    {
      header: t('staff.hikvisionId'),
      accessorKey: 'hikvision_id',
    },
    {
      header: t('staff.name'),
      accessorKey: 'name',
    },
    {
      header: t('staff.position'),
      accessorKey: 'position',
      cell: (row: Staff) => row.position ? t(`staff.positions.${row.position}`) : '—',
    },
    {
      header: t('staff.username'),
      accessorKey: 'username',
      cell: (row: Staff) => row.username || '-',
    },
    {
      header: t('staff.isActive'),
      accessorKey: 'is_active',
      cell: (row: Staff) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? t('staff.active') : t('staff.inactive')}
        </span>
      ),
    },
    {
      header: t('staff.atWork'),
      accessorKey: 'is_at_work',
      cell: (row: Staff) => (
        <div className="flex flex-col">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold w-fit ${
            row.is_at_work
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25'
              : 'bg-muted text-muted-foreground ring-1 ring-border'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${row.is_at_work ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
            {row.is_at_work ? t('staff.atWorkYes') : t('staff.atWorkNo')}
          </span>
          {row.is_at_work && row.at_work_since && (
            <span className="text-xs text-muted-foreground mt-1">
              {t('staff.since')}: {new Date(row.at_work_since).toLocaleString('ru-RU')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('staff.createdAt'),
      accessorKey: 'created_at',
      cell: (row: Staff) => new Date(row.created_at!).toLocaleDateString(),
    },
  ];

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleCreate = (data: any) => {
    createStaff.mutate(
      {
        hikvision_id: parseInt(data.hikvision_id),
        name: data.name,
        position: data.position,
        is_active: data.is_active !== false,
        username: data.username || undefined,
        password: data.password || undefined,
      } as Staff,
      {
        onSuccess: () => {
          toast.success(t('staff.createSuccess'));
          setIsCreateDialogOpen(false);
        },
        onError: () => {
          toast.error(t('staff.createError'));
        },
      }
    );
  };

  const handleUpdate = (data: any) => {
    if (!editingStaff?.id) return;

    updateStaff.mutate(
      {
        id: editingStaff.id,
        hikvision_id: editingStaff.hikvision_id,
        name: data.name,
        position: data.position,
        is_active: data.is_active !== false,
        username: data.username || undefined,
      } as Staff,
      {
        onSuccess: () => {
          toast.success(t('staff.updateSuccess'));
          setIsEditDialogOpen(false);
          setEditingStaff(null);
        },
        onError: () => {
          toast.error(t('staff.updateError'));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingStaff?.id) return;

    deleteStaff.mutate(deletingStaff.id, {
      onSuccess: () => {
        toast.success(t('staff.deleteSuccess'));
        setDeletingStaff(null);
      },
      onError: () => {
        toast.error(t('staff.deleteError'));
      },
    });
  };

  const handleSetPassword = async () => {
    if (!selectedStaff?.id || !newPassword) return;
    try {
      await setStaffPassword(selectedStaff.id, newPassword);
      toast.success(t('staff.passwordSuccess'));
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setSelectedStaff(null);
    } catch (error) {
      toast.error(t('staff.passwordError'));
    }
  };

  const openPasswordModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsPasswordModalOpen(true);
  };

  const formFields = [
    {
      name: 'hikvision_id',
      label: t('staff.hikvisionId'),
      type: 'number' as const,
      placeholder: '101',
      required: true,
    },
    {
      name: 'name',
      label: t('staff.name'),
      type: 'text' as const,
      placeholder: t('staff.name'),
      required: true,
    },
    {
      name: 'position',
      label: t('staff.position'),
      type: 'native-select' as const,
      options: [
        { value: 'barista', label: t('staff.positions.barista') },
        { value: 'cook', label: t('staff.positions.cook') },
        { value: 'waiter', label: t('staff.positions.waiter') },
        { value: 'cashier', label: t('staff.positions.cashier') },
        { value: 'admin', label: t('staff.positions.admin') },
      ],
      required: true,
      defaultValue: 'barista',
    },
    {
      name: 'username',
      label: `${t('staff.username')} (${t('staff.optional')})`,
      type: 'text' as const,
      placeholder: 'username',
    },
    {
      name: 'password',
      label: `${t('staff.password')} (${t('staff.optional')})`,
      type: 'password' as const,
      placeholder: '••••••••',
    },
    {
      name: 'is_active',
      label: t('staff.isActive'),
      type: 'checkbox' as const,
    },
  ];

  const editFormFields = formFields.filter(field => field.name !== 'password' && field.name !== 'hikvision_id');

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('staff.title')}</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>{t('staff.create')}</Button>
      </div>

      <ResourceTable
        data={staff}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(id) => {
          const staffMember = staff.find(s => s.id === id);
          if (staffMember) setDeletingStaff(staffMember);
        }}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        actions={(row: Staff) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPasswordModal(row)}
            className="h-8 w-8 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors rounded-md"
          >
            <Key className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">{t('staff.create')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              fields={formFields}
              onSubmit={handleCreate}
              defaultValues={{ position: 'barista', is_active: true }}
              isSubmitting={createStaff.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">{t('staff.edit')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              fields={editFormFields}
              onSubmit={handleUpdate}
              defaultValues={editingStaff || {}}
              isSubmitting={updateStaff.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('staff.setPassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('staff.newPassword')}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSetPassword}>{t('staff.setPassword')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDelete}
        title={t('staff.deleteTitle')}
        description={t('staff.deleteDescription')}
      />
    </div>
  );
}
