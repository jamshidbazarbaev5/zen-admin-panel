import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Broadcast } from '../api/broadcast';
import broadcastApi, { sendBroadcast } from '../api/broadcast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResourceTable } from '../helpers/ResourceTable';
import { Send } from 'lucide-react';

export default function BroadcastsPage() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [formData, setFormData] = useState({
    text: '',
    media_type: 'photo' as 'photo' | 'video',
    target: 'all' as 'all' | 'active',
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Use React Query hooks
  const { data: broadcastsData, isLoading, refetch } = broadcastApi.useGetResources({
    params: { page: currentPage },
  });
  const createMutation = broadcastApi.useCreateResource();
  const updateMutation = broadcastApi.useUpdateResource();
  const deleteMutation = broadcastApi.useDeleteResource();

  const broadcasts = Array.isArray(broadcastsData) 
    ? broadcastsData 
    : broadcastsData?.results || [];
  
  const totalCount = Array.isArray(broadcastsData) 
    ? broadcastsData.length 
    : broadcastsData?.count || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      submitData.append('text', formData.text);
      submitData.append('media_type', formData.media_type);
      submitData.append('target', formData.target);
      
      if (mediaFile) {
        submitData.append('media', mediaFile);
      }

      if (editingBroadcast) {
        await updateMutation.mutateAsync({
          formData: submitData,
          id: editingBroadcast.id,
        });
      } else {
        await createMutation.mutateAsync(submitData as any);
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Failed to save broadcast:', error);
    }
  };

  const handleSend = async (broadcast: Broadcast) => {
    try {
      await sendBroadcast(broadcast.id);
      refetch();
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    }
  };

  const handleEdit = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast);
    setFormData({
      text: broadcast.text,
      media_type: broadcast.media_type,
      target: broadcast.target,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
    }
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      text: '',
      media_type: 'photo',
      target: 'all',
    });
    setMediaFile(null);
    setEditingBroadcast(null);
  };

  const columns = [
    {
      header: t('text'),
      accessorKey: 'text' as keyof Broadcast,
      cell: (row: Broadcast) => (
        <div className="max-w-xs truncate">{row.text}</div>
      ),
    },
    {
      header: t('mediaType'),
      accessorKey: 'media_type' as keyof Broadcast,
      cell: (row: Broadcast) => t(row.media_type),
    },
    {
      header: t('target'),
      accessorKey: 'target' as keyof Broadcast,
      cell: (row: Broadcast) => t(row.target === 'all' ? 'allCustomers' : 'activeCustomers'),
    },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Broadcast,
      cell: (row: Broadcast) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'sent' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {t(row.status)}
        </span>
      ),
    },
    {
      header: t('sentCount'),
      accessorKey: 'sent_count' as keyof Broadcast,
    },
    {
      header: t('createdAt'),
      accessorKey: 'created_at' as keyof Broadcast,
      cell: (row: Broadcast) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <ResourceTable
        data={broadcasts}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        actions={(row: Broadcast) => (
          <>
            {row.status === 'draft' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSend(row)}
                className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-md"
                title={t('send')}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBroadcast ? t('edit') : t('create')} {t('broadcast')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="text">{t('text')}</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                required
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="media_type">{t('mediaType')}</Label>
              <select
                id="media_type"
                value={formData.media_type}
                onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'photo' | 'video' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="photo">{t('photo')}</option>
                <option value="video">{t('video')}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="media">{t('media')}</Label>
              <Input
                id="media"
                type="file"
                accept={formData.media_type === 'photo' ? 'image/*' : 'video/*'}
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="target">{t('target')}</Label>
              <select
                id="target"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as 'all' | 'active' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">{t('allCustomers')}</option>
                <option value="active">{t('activeCustomers')}</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              {editingBroadcast ? t('update') : t('create')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
