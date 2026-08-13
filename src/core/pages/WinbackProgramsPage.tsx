import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import {
  useGetWinbackPrograms,
  useCreateWinbackProgram,
  useUpdateWinbackProgram,
  useDeleteWinbackProgram,
  type WinbackProgram,
} from '../api/winbackProgram';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const columns = [
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Шагов',
    accessorKey: 'steps',
    cell: (row: WinbackProgram) => row.steps?.length || 0,
  },
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: WinbackProgram) => (
      <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Активна' : 'Неактивна'}
      </span>
    ),
  },
  {
    header: 'Дата создания',
    accessorKey: 'created_at',
    cell: (row: WinbackProgram) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
  },
];

export default function WinbackProgramsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProgram, setEditingProgram] = useState<WinbackProgram | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: programsData, isLoading } = useGetWinbackPrograms({ params: { page: currentPage } });
  const createProgram = useCreateWinbackProgram();
  const updateProgram = useUpdateWinbackProgram();
  const deleteProgram = useDeleteWinbackProgram();

  const programs = programsData?.results || [];
  const totalCount = programsData?.count || 0;

  const form = useForm<WinbackProgram>({
    defaultValues: {
      name: '',
      is_active: true,
      steps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const handleCreate = (data: WinbackProgram) => {
    // Ensure numeric values
    data.steps = data.steps.map((step, idx) => ({
      order: idx + 1,
      trigger_after_days: Number(step.trigger_after_days),
      amount: step.amount.toString(),
      expiry_hours: step.expiry_hours ? Number(step.expiry_hours) : null,
    }));

    createProgram.mutate(data, {
      onSuccess: () => {
        toast.success('Программа успешно создана');
        setIsDialogOpen(false);
      },
      onError: () => {
        toast.error('Ошибка при создании программы');
      },
    });
  };

  const handleUpdate = (data: WinbackProgram) => {
    if (!editingProgram?.id) return;
    
    data.steps = data.steps.map((step, idx) => ({
      order: idx + 1,
      trigger_after_days: Number(step.trigger_after_days),
      amount: step.amount.toString(),
      expiry_hours: step.expiry_hours ? Number(step.expiry_hours) : null,
    }));

    updateProgram.mutate(
      {
        id: editingProgram.id,
        ...data,
      } as WinbackProgram,
      {
        onSuccess: () => {
          toast.success('Программа успешно обновлена');
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при обновлении программы');
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту программу? История выдач ваучеров тоже будет удалена (каскадно).')) {
      deleteProgram.mutate(id, {
        onSuccess: () => toast.success('Программа успешно удалена'),
        onError: () => toast.error('Ошибка при удалении'),
      });
    }
  };

  const openCreateDialog = () => {
    setIsCreating(true);
    setEditingProgram(null);
    form.reset({
      name: '',
      is_active: true,
      steps: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (program: WinbackProgram) => {
    setIsCreating(false);
    setEditingProgram(program);
    form.reset(program);
    setIsDialogOpen(true);
  };

  const basicFields = [
    { name: 'name', label: 'Название программы', type: 'text' as const, required: true },
    { name: 'is_active', label: 'Активна', type: 'checkbox' as const },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Win-back программы</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Создать
        </Button>
      </div>

      <ResourceTable
        data={programs}
        columns={columns}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">
              {isCreating ? 'Создать программу' : 'Редактировать программу'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              form={form}
              fields={basicFields}
              onSubmit={isCreating ? handleCreate : handleUpdate}
              isSubmitting={isCreating ? createProgram.isPending : updateProgram.isPending}
            >
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Шаги программы (Ваучеры)</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ order: fields.length + 1, trigger_after_days: 30, amount: '5000', expiry_hours: null })}
                  >
                    <Plus size={16} className="mr-2" /> Добавить шаг
                  </Button>
                </div>
                
                {fields.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    Нет шагов. Нажмите "Добавить шаг", чтобы настроить отправку ваучеров.
                  </div>
                )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20 relative flex gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>{index === 0 ? 'Дней без заказов' : 'Дней после предыдущего подарка'}</Label>
                          <Input 
                            type="number"
                            {...form.register(`steps.${index}.trigger_after_days` as const, { required: true })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Сумма ваучера</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            {...form.register(`steps.${index}.amount` as const, { required: true })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Срок жизни (часов)</Label>
                          <Input 
                            type="number"
                            placeholder="Бессрочный"
                            {...form.register(`steps.${index}.expiry_hours` as const)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ResourceForm>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
