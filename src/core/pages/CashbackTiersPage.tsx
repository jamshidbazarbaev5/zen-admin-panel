import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import {
  useGetCashbackTiers,
  useUpdateCashbackTier,
  // useDeleteCashbackTier,
  type CashbackTier,
} from '../api/cashbackTier';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
  
const columns = [
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Мин. потрачено',
    accessorKey: 'min_spent',
    cell: (row: CashbackTier) => `${parseFloat(row.min_spent).toFixed(2)} сум`,
  },
  {
    header: 'Макс. потрачено',
    accessorKey: 'max_spent',
    cell: (row: CashbackTier) => row.max_spent ? `${parseFloat(row.max_spent).toFixed(2)} сум` : 'Без ограничений',
  },
  {
    header: 'Процент кэшбэка',
    accessorKey: 'percent',
    cell: (row: CashbackTier) => `${parseFloat(row.percent).toFixed(2)}%`,
  },
];

export default function CashbackTiersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTier, setEditingTier] = useState<CashbackTier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: tiersData, isLoading } = useGetCashbackTiers({ params: { page: currentPage } });
  const updateTier = useUpdateCashbackTier();
  // const deleteTier = useDeleteCashbackTier();

  const tiers = tiersData?.results || [];
  const totalCount = tiersData?.count || 0;

 

  

  const handleUpdate = (data: any) => {
    if (!editingTier?.id) return;

    updateTier.mutate(
      {
        id: editingTier.id,
        name: data.name,
        min_spent: data.min_spent,
        max_spent: data.max_spent || null,
        percent: data.percent,
      } as CashbackTier,
      {
        onSuccess: () => {
          toast.success('Уровень кэшбэка успешно обновлен');
          setIsEditDialogOpen(false);
          setEditingTier(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении уровня кэшбэка');
        },
      }
    );
  };


  const formFields = [
    {
      name: 'name',
      label: 'Название',
      type: 'text' as const,
      placeholder: 'Золото',
      required: true,
    },
    {
      name: 'min_spent',
      label: 'Минимальная сумма потраченных средств',
      type: 'text' as const,
      placeholder: '500000.00',
      required: true,
    },
    {
      name: 'max_spent',
      label: 'Максимальная сумма потраченных средств (оставьте пустым для безлимита)',
      type: 'text' as const,
      placeholder: '1000000.00',
    },
    {
      name: 'percent',
      label: 'Процент кэшбэка',
      type: 'text' as const,
      placeholder: '7.00',
      required: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
     

      <ResourceTable
        data={tiers}
        columns={columns}
        isLoading={isLoading}
      
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

    

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">Редактировать уровень кэшбэка</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              fields={formFields}
              onSubmit={handleUpdate}
              defaultValues={editingTier || {}}
              isSubmitting={updateTier.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

    
    </div>
  );
}
