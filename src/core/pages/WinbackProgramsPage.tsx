import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import {
  useGetWinbackPrograms,
  useCreateWinbackProgram,
  useUpdateWinbackProgram,
  useDeleteWinbackProgram,
  useGetWinbackFunnel,
  type WinbackProgram,
  type FunnelStep,
} from '../api/winbackProgram';
import { useGetWinbackGrants, type WinbackGrant } from '../api/winbackGrant';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, BarChart3, ChevronRight, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';

const programColumns = [
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

  // Funnel drill-down state
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [isFunnelDialogOpen, setIsFunnelDialogOpen] = useState(false);
  const [isGrantsDialogOpen, setIsGrantsDialogOpen] = useState(false);
  const [grantsPage, setGrantsPage] = useState(1);

  const { data: programsData, isLoading } = useGetWinbackPrograms({ params: { page: currentPage } });
  const createProgram = useCreateWinbackProgram();
  const updateProgram = useUpdateWinbackProgram();
  const deleteProgram = useDeleteWinbackProgram();

  const programs = programsData?.results || [];
  const totalCount = programsData?.count || 0;

  // Funnel data
  const { data: funnelData, isLoading: isFunnelLoading } = useGetWinbackFunnel(selectedProgramId);

  // Grants for selected step
  const { data: grantsData, isLoading: isGrantsLoading } = useGetWinbackGrants({
    params: {
      program: selectedProgramId,
      step: selectedStepId,
      page: grantsPage,
    },
    enabled: isGrantsDialogOpen && !!selectedProgramId && !!selectedStepId,
  });

  const grants = grantsData?.results || [];
  const grantsTotalCount = grantsData?.count || 0;

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
    data.steps = data.steps.map((step, idx) => ({
      id: step.id,
      order: idx + 1,
      trigger_after_days: Number(step.trigger_after_days),
      amount: step.amount.toString(),
      expiry_hours: step.expiry_hours ? Number(step.expiry_hours) : null,
      message: step.message || undefined,
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
      id: step.id,
      order: idx + 1,
      trigger_after_days: Number(step.trigger_after_days),
      amount: step.amount.toString(),
      expiry_hours: step.expiry_hours ? Number(step.expiry_hours) : null,
      message: step.message || undefined,
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

  const openFunnelDialog = (program: WinbackProgram) => {
    setSelectedProgramId(program.id!);
    setIsFunnelDialogOpen(true);
  };

  const openGrantsDialog = (step: FunnelStep) => {
    setSelectedStepId(step.step_id);
    setGrantsPage(1);
    setIsGrantsDialogOpen(true);
  };

  const basicFields = [
    { name: 'name', label: 'Название программы', type: 'text' as const, required: true },
    { name: 'is_active', label: 'Активна', type: 'checkbox' as const },
  ];

  const grantColumns = [
    {
      header: 'Клиент',
      accessorKey: 'customer_name',
      cell: (row: WinbackGrant) => (
        <div>
          <div className="font-medium">{row.customer_name || '—'}</div>
          <div className="text-xs text-muted-foreground">{row.customer_phone}</div>
        </div>
      ),
    },
    {
      header: 'Ваучер (Код)',
      accessorKey: 'voucher_code',
    },
    {
      header: 'Статус ваучера',
      accessorKey: 'voucher_status',
      cell: (row: WinbackGrant) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        let label = row.voucher_status;
        
        if (row.voucher_status === 'active') { colorClass = 'bg-green-100 text-green-800'; label = 'Активен'; }
        else if (row.voucher_status === 'redeemed') { colorClass = 'bg-blue-100 text-blue-800'; label = 'Погашен'; }
        else if (row.voucher_status === 'expired') { colorClass = 'bg-red-100 text-red-800'; label = 'Истек'; }
        else if (row.voucher_status === 'pending_payment') { colorClass = 'bg-yellow-100 text-yellow-800'; label = 'Ожидает оплаты'; }
        else if (row.voucher_status === 'voided' || row.voucher_status === 'cancelled') { colorClass = 'bg-gray-200 text-gray-600'; label = 'Отменен'; }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${colorClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Вернулся',
      accessorKey: 'returned',
      cell: (row: WinbackGrant) => (
        <span className={`px-2 py-1 rounded text-xs ${row.returned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.returned ? 'Да' : 'Нет'}
        </span>
      ),
    },
    {
      header: 'Дата выдачи',
      accessorKey: 'granted_at',
      cell: (row: WinbackGrant) => new Date(row.granted_at).toLocaleString('ru-RU'),
    },
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
        columns={programColumns}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onRowClick={openFunnelDialog}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        actions={(row: WinbackProgram) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openFunnelDialog(row);
            }}
            title="Просмотреть воронку"
          >
            <BarChart3 size={16} />
          </Button>
        )}
      />

      {/* Create/Edit Dialog */}
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
                    onClick={() => append({ order: fields.length + 1, trigger_after_days: 30, amount: '5000', expiry_hours: null, message: '' })}
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
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20 relative">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="mt-4 flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Сообщение клиенту</Label>
                          <textarea
                            {...form.register(`steps.${index}.message` as const)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px] resize-y"
                            placeholder="Сообщение клиенту"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 mb-0.5"
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

      {/* Funnel Dialog */}
      <Dialog open={isFunnelDialogOpen} onOpenChange={setIsFunnelDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground flex items-center gap-2">
              <BarChart3 size={20} />
              Воронка программы — {funnelData?.program?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            {isFunnelLoading ? (
              <div className="text-center py-12 text-muted-foreground">Загрузка воронки...</div>
            ) : !funnelData?.steps?.length ? (
              <div className="text-center py-12 text-muted-foreground">Нет данных о шагах программы</div>
            ) : (
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-muted-foreground">Всего выдач</div>
                    <div className="text-2xl font-bold mt-1">
                      {funnelData.steps.reduce((sum, s) => sum + s.total_grants, 0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-muted-foreground">Погашено</div>
                    <div className="text-2xl font-bold mt-1">
                      {funnelData.steps.reduce((sum, s) => sum + s.redeemed, 0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-muted-foreground">Истекло</div>
                    <div className="text-2xl font-bold mt-1">
                      {funnelData.steps.reduce((sum, s) => sum + s.expired, 0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-muted-foreground">Вернулись</div>
                    <div className="text-2xl font-bold mt-1">
                      {funnelData.steps.reduce((sum, s) => sum + s.returned, 0)}
                    </div>
                  </div>
                </div>

                {/* Steps funnel */}
                {funnelData.steps.map((step) => (
                  <div
                    key={step.step_id}
                    className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => openGrantsDialog(step)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {step.order}
                        </span>
                        <div>
                          <div className="font-medium">
                            Шаг {step.order} — Через {step.trigger_after_days} дн.
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {step.amount} сум · {step.is_auto_credited ? 'Автоначисление' : 'Ваучер с кодом'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {step.total_grants} выдач
                        </span>
                        <span className={`font-medium ${step.return_rate > 30 ? 'text-green-600' : step.return_rate > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(step.return_rate)}% возврат
                        </span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Погашено</span>
                          <span>{step.total_grants > 0 ? Math.round((step.redeemed / step.total_grants) * 100) : 0}%</span>
                        </div>
                        <Progress
                          value={step.total_grants > 0 ? (step.redeemed / step.total_grants) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Истекло</span>
                          <span>{step.total_grants > 0 ? Math.round((step.expired / step.total_grants) * 100) : 0}%</span>
                        </div>
                        <Progress
                          value={step.total_grants > 0 ? (step.expired / step.total_grants) * 100 : 0}
                          className="h-1.5 [&>div]:bg-red-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Вернулись</span>
                          <span>{Math.round(step.return_rate)}%</span>
                        </div>
                        <Progress
                          value={step.return_rate}
                          className="h-1.5 [&>div]:bg-green-500"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Нажмите, чтобы посмотреть список клиентов
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grants Dialog for a specific step */}
      <Dialog open={isGrantsDialogOpen} onOpenChange={setIsGrantsDialogOpen}>
        <DialogContent className="!max-w-[95vw] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="mr-1"
                onClick={() => {
                  setIsGrantsDialogOpen(false);
                }}
              >
                <ArrowLeft size={16} />
              </Button>
              Выдачи — Шаг {funnelData?.steps?.find(s => s.step_id === selectedStepId)?.order}
              <span className="text-muted-foreground font-normal ml-2">
                ({funnelData?.program?.name})
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4 bg-card">
            {isGrantsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Загрузка выдач...</div>
            ) : grants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Нет выдач для этого шага</div>
            ) : (
              <ResourceTable
                data={grants}
                columns={grantColumns}
                isLoading={false}
                totalCount={grantsTotalCount}
                pageSize={20}
                currentPage={grantsPage}
                onPageChange={setGrantsPage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
