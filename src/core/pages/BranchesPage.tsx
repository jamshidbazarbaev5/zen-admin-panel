import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useGetBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  type Branch,
} from '../api/branch';
import { useGetOrganizations } from '../api/organization';
import { useGetTerminalGroups } from '../api/terminalGroup';
import { ResourceTable } from '../helpers/ResourceTable';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { MapPicker } from '../components/MapPicker';

interface BranchFormState {
  organization: string;
  terminal_group: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

const emptyForm: BranchFormState = {
  organization: '',
  terminal_group: '',
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  is_active: true,
};

export default function BranchesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormState>(emptyForm);

  const params: Record<string, any> = { page: currentPage };
  if (searchQuery) params.search = searchQuery;
  if (activeFilter) params.is_active = activeFilter;
  if (organizationFilter) params.organization = organizationFilter;

  const { data: branchesData, isLoading } = useGetBranches({ params });
  const { data: organizationsData } = useGetOrganizations({ params: { is_active: true } });
  const { data: terminalGroupsData } = useGetTerminalGroups({
    params: form.organization ? { organization: form.organization } : {},
  });

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, organizationFilter]);

  const branches = branchesData?.results || [];
  const totalCount = branchesData?.count || 0;
  const organizations = organizationsData?.results || [];
  const terminalGroups = terminalGroupsData?.results || [];

  const openCreate = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      organization: branch.organization?.toString() ?? '',
      terminal_group: branch.terminal_group?.toString() ?? '',
      name: branch.name ?? '',
      address: branch.address ?? '',
      latitude: branch.latitude !== null && branch.latitude !== undefined ? String(branch.latitude) : '',
      longitude: branch.longitude !== null && branch.longitude !== undefined ? String(branch.longitude) : '',
      is_active: branch.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteBranch.mutate(id, {
      onSuccess: () => toast.success(t('branches.deleteSuccess')),
      onError: () => toast.error(t('branches.deleteError')),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization || !form.terminal_group || !form.name) {
      toast.error(t('branches.requiredFields'));
      return;
    }
    const payload: Branch = {
      organization: parseInt(form.organization, 10),
      terminal_group: parseInt(form.terminal_group, 10),
      name: form.name,
      address: form.address,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      is_active: form.is_active,
    };

    if (editingBranch?.id) {
      updateBranch.mutate(
        { ...payload, id: editingBranch.id },
        {
          onSuccess: () => {
            toast.success(t('branches.updateSuccess'));
            setIsDialogOpen(false);
          },
          onError: () => toast.error(t('branches.updateError')),
        }
      );
    } else {
      createBranch.mutate(payload, {
        onSuccess: () => {
          toast.success(t('branches.createSuccess'));
          setIsDialogOpen(false);
        },
        onError: () => toast.error(t('branches.createError')),
      });
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const columns = [
    { header: t('branches.name'), accessorKey: 'name' as const },
    {
      header: t('branches.organization'),
      accessorKey: 'organization_name' as const,
      cell: (row: Branch) =>
        row.organization_name ||
        organizations.find((o) => o.id === row.organization)?.name ||
        '—',
    },
    {
      header: t('branches.terminalGroup'),
      accessorKey: 'terminal_group_name' as const,
      cell: (row: Branch) => row.terminal_group_name || '—',
    },
    { header: t('branches.address'), accessorKey: 'address' as const },
    {
      header: t('branches.coordinates'),
      accessorKey: 'latitude' as const,
      cell: (row: Branch) =>
        row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : '—',
    },
    {
      header: t('branches.status'),
      accessorKey: 'is_active' as const,
      cell: (row: Branch) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.is_active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.is_active ? t('branches.active') : t('branches.inactive')}
        </span>
      ),
    },
  ];

  const latNum = form.latitude ? parseFloat(form.latitude) : NaN;
  const lngNum = form.longitude ? parseFloat(form.longitude) : NaN;
  const mapLat = Number.isFinite(latNum) ? latNum : null;
  const mapLng = Number.isFinite(lngNum) ? lngNum : null;

  const isSubmitting = createBranch.isPending || updateBranch.isPending;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('branches.title')}</h1>
        <Button onClick={openCreate}>{t('branches.create')}</Button>
      </div>

      <div className="mb-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-wrap gap-4">
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={organizationFilter}
            onChange={(e) => setOrganizationFilter(e.target.value)}
          >
            <option value="">{t('branches.allOrganizations')}</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">{t('branches.all')}</option>
            <option value="true">{t('branches.active')}</option>
            <option value="false">{t('branches.inactive')}</option>
          </select>
          <Input
            type="text"
            placeholder={t('branches.searchPlaceholder')}
            className="flex-1 min-w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ResourceTable
        data={branches}
        columns={columns}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={handleDelete}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/50">
            <DialogTitle className="text-foreground">
              {editingBranch ? t('branches.edit') : t('branches.create')}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto flex-1 px-6 py-6 space-y-5 bg-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.organization')}
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.organization}
                  onChange={(e) =>
                    setForm({ ...form, organization: e.target.value, terminal_group: '' })
                  }
                >
                  <option value="">{t('branches.selectOrganization')}</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.terminalGroup')}
                </label>
                <select
                  required
                  disabled={!form.organization}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  value={form.terminal_group}
                  onChange={(e) => setForm({ ...form, terminal_group: e.target.value })}
                >
                  <option value="">{t('branches.selectTerminalGroup')}</option>
                  {terminalGroups.map((tg) => (
                    <option key={tg.id} value={tg.id}>
                      {tg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.name')}
                </label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('branches.namePlaceholder')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.address')}
                </label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={t('branches.addressPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.latitude')}
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="41.311081"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('branches.longitude')}
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="69.279729"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('branches.pickOnMap')}
              </label>
              <p className="text-xs text-muted-foreground">{t('branches.mapHint')}</p>
              <MapPicker latitude={mapLat} longitude={mapLng} onChange={handleMapChange} />
            </div>

            <div className="flex items-center space-x-3 p-3.5 border border-border rounded-md bg-muted/50">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: Boolean(checked) })
                }
                className="h-5 w-5"
              />
              <label className="text-sm font-medium text-foreground cursor-pointer">
                {t('branches.isActive')}
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingBranch ? t('branches.save') : t('branches.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
