import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';

type SyncTarget =
  | 'organizations'
  | 'terminal_groups'
  | 'payment_types'
  | 'tables'
  | 'menu'
  | 'stop_lists'
  | 'tiers';

interface SyncTargetOption {
  id: SyncTarget;
  labelKey: string;
}

export default function SyncPage() {
  const { t } = useTranslation();
  const [selectedTargets, setSelectedTargets] = useState<SyncTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const syncTargets: SyncTargetOption[] = [
    { id: 'organizations', labelKey: 'sync.organizations' },
    { id: 'terminal_groups', labelKey: 'sync.terminalGroups' },
    { id: 'payment_types', labelKey: 'sync.paymentTypes' },
    { id: 'tables', labelKey: 'sync.tables' },
    { id: 'menu', labelKey: 'sync.menu' },
    { id: 'stop_lists', labelKey: 'sync.stopLists' },
    { id: 'tiers', labelKey: 'sync.tiers' },
  ];

  const handleToggleTarget = (targetId: SyncTarget) => {
    setSelectedTargets((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTargets.length === syncTargets.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(syncTargets.map((target) => target.id));
    }
  };

  const handleSync = async () => {
    if (selectedTargets.length === 0) {
      toast.error(t('sync.selectAtLeastOne'));
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');

    try {
      const payload = {
        targets: selectedTargets.length === syncTargets.length ? ['all'] : selectedTargets,
      };

      await api.post('/iiko/sync/', payload);
      
      setSyncStatus('success');
      toast.success(t('sync.success'));
    } catch (error: any) {
      setSyncStatus('error');
      const errorMessage = error?.response?.data?.detail || t('sync.error');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('sync.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('sync.description')}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('sync.selectTargets')}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedTargets.length === syncTargets.length ? t('sync.deselectAll') : t('sync.selectAll')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {syncTargets.map((target) => (
            <div
              key={target.id}
              className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={target.id}
                checked={selectedTargets.includes(target.id)}
                onCheckedChange={() => handleToggleTarget(target.id)}
                disabled={isLoading}
              />
              <Label
                htmlFor={target.id}
                className="flex-1 cursor-pointer text-base font-medium"
              >
                {t(target.labelKey)}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {syncStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <span className="text-sm font-medium">{t('sync.syncCompleted')}</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{t('sync.syncFailed')}</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSync}
            disabled={isLoading || selectedTargets.length === 0}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('sync.syncing')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('sync.startSync')}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">{t('sync.note')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('sync.noteDescription')}
        </p>
      </div>
    </div>
  );
}
