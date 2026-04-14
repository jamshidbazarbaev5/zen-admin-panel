import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetReviews, useDeleteReview, type Review } from '../api/review';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

const columns = [
  {
    header: 'Клиент',
    accessorKey: 'customer_name',
  },
  {
    header: 'Телефон',
    accessorKey: 'customer_phone',
  },
  {
    header: 'Рейтинг',
    accessorKey: 'rating',
    cell: (row: Review) => <RatingStars rating={row.rating} />,
  },
  {
    header: 'Комментарий',
    accessorKey: 'comment',
    cell: (row: Review) => (
      <span className="line-clamp-2 max-w-xs">{row.comment || '—'}</span>
    ),
  },
  {
    header: 'Дата',
    accessorKey: 'created_at',
    cell: (row: Review) => new Date(row.created_at).toLocaleString('ru-RU'),
  },
];

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;

  const { data: reviewsData, isLoading } = useGetReviews({ params });
  const deleteReview = useDeleteReview();

  const reviews = reviewsData?.results || [];
  const totalCount = reviewsData?.count || 0;

  const handleRowClick = (review: Review) => {
    setSelectedReview(review);
    setIsDetailDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deletingReview?.id) return;

    deleteReview.mutate(deletingReview.id, {
      onSuccess: () => {
        toast.success('Отзыв успешно удален');
        setDeletingReview(null);
      },
      onError: () => {
        toast.error('Ошибка при удалении отзыва');
      },
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Отзывы</h1>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Поиск по имени или телефону..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <ResourceTable
        data={reviews}
        columns={columns}
        isLoading={isLoading}
        onDelete={(id) => {
          const review = reviews.find((r) => r.id === id);
          if (review) setDeletingReview(review);
        }}
        onRowClick={handleRowClick}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Детали отзыва</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Клиент</p>
                  <p className="text-base">{selectedReview.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                  <p className="text-base">{selectedReview.customer_phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Рейтинг</p>
                <RatingStars rating={selectedReview.rating} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Комментарий</p>
                <p className="text-base mt-1">{selectedReview.comment || '—'}</p>
              </div>
              <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                <p>Создан: {new Date(selectedReview.created_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!deletingReview}
        onClose={() => setDeletingReview(null)}
        onConfirm={handleDelete}
        title="Удалить отзыв"
        description={`Вы уверены, что хотите удалить отзыв от "${deletingReview?.customer_name}"?`}
      />
    </div>
  );
}
