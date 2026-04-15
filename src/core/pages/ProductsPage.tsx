import { useState, useEffect, useCallback, useRef } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetProducts, useUpdateProduct, useBulkUpdateProducts, type Product, type ProductBulkUpdate } from '../api/product';
import { useGetCategories } from '../api/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Save, ImageIcon, Upload, X, Check } from 'lucide-react';
import Cropper, { type Area } from 'react-easy-crop';

// --- Image crop helper ---
async function getCroppedBlob(imageSrc: string, crop: Area): Promise<File> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas toBlob failed'));
      resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

// --- Image Crop Dialog ---
function ImageCropDialog({
  open,
  imageSrc,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  imageSrc: string | null;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedArea) return;
    const file = await getCroppedBlob(imageSrc, croppedArea);
    onConfirm(file);
  };

  if (!open || !imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border bg-muted/50">
          <DialogTitle>Обрезать изображение</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[400px] bg-black/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted/50">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Масштаб:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32 accent-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" /> Отмена
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-1" /> Подтвердить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Product image field (replaces the ResourceForm file field) ---
function ProductImageField({
  existingImage,
  onCropped,
  croppedPreview,
}: {
  existingImage?: string | null;
  onCropped: (file: File) => void;
  croppedPreview: string | null;
}) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    e.target.value = '';
  };

  const handleCropConfirm = (file: File) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    onCropped(file);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const previewUrl = croppedPreview || (typeof existingImage === 'string' ? existingImage : null);

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Изображение</label>
        <div className="flex items-start gap-4">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Превью"
              className="w-24 h-24 rounded-lg object-cover border border-border"
            />
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {previewUrl ? 'Заменить' : 'Загрузить'}
            </Button>
            <p className="text-xs text-muted-foreground">
              После выбора файла вы сможете обрезать изображение
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </>
  );
}

// --- Columns ---
const createColumns = (
  editMode: boolean,
  editedData: Map<number, Partial<Product>>,
  onFieldChange: (id: number, field: keyof Product, value: any) => void
) => [
  {
    header: '',
    accessorKey: 'image' as keyof Product,
    cell: (row: Product) => {
      const src = typeof row.image === 'string' ? row.image : row.iiko_image_url;
      return src ? (
        <img src={src} alt="" className="w-10 h-10 rounded-md object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    },
  },
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru',
  },
  {
    header: 'Категория',
    accessorKey: 'category_name',
  },
  {
    header: 'Цена',
    accessorKey: 'price',
    cell: (row: Product) => `${parseFloat(row.price).toFixed(2)} сум`,
  },
  {
    header: 'Время приготовления',
    accessorKey: 'prep_minutes',
    cell: (row: Product) => {
      if (!editMode) return row.prep_minutes ? `${row.prep_minutes} мин` : '-';
      const edited = editedData.get(row.id!);
      return (
        <Input
          type="number"
          value={edited?.prep_minutes ?? row.prep_minutes ?? ''}
          onChange={(e) => onFieldChange(row.id!, 'prep_minutes', parseInt(e.target.value) || null)}
          className="w-20"
        />
      );
    },
  },
  {
    header: 'Порядок',
    accessorKey: 'order',
    cell: (row: Product) => {
      if (!editMode) return row.order;
      const edited = editedData.get(row.id!);
      return (
        <Input
          type="number"
          value={edited?.order ?? row.order}
          onChange={(e) => onFieldChange(row.id!, 'order', parseInt(e.target.value))}
          className="w-20"
        />
      );
    },
  },
  {
    header: 'Доступность',
    accessorKey: 'is_available',
    cell: (row: Product) => {
      if (!editMode) {
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${row.is_available ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25' : 'bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/25'}`}>
            {row.is_available ? 'Доступен' : 'Недоступен'}
          </span>
        );
      }
      const edited = editedData.get(row.id!);
      return (
        <Checkbox
          checked={edited?.is_available ?? row.is_available}
          onCheckedChange={(checked) => onFieldChange(row.id!, 'is_available', checked)}
        />
      );
    },
  },
];

// --- Page ---
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isAvailableFilter, setIsAvailableFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Map<number, Partial<Product>>>(new Map());
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (categoryFilter) params.category = categoryFilter;
  if (isAvailableFilter) params.is_available = isAvailableFilter;

  const { data: productsData, isLoading } = useGetProducts({ params });

  const categoriesParams: Record<string, any> = {};
  const { data: categoriesData } = useGetCategories({ params: categoriesParams });
  const updateProduct = useUpdateProduct();
  const bulkUpdate = useBulkUpdateProducts();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, isAvailableFilter]);

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  const categories = categoriesData?.results || [];

  const handleFieldChange = (id: number, field: keyof Product, value: any) => {
    setEditedData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleBulkSave = () => {
    const updates: ProductBulkUpdate[] = Array.from(editedData.entries()).map(([id, changes]) => {
      const original = products.find(p => p.id === id)!;
      return {
        id,
        order: changes.order ?? original.order,
        is_available: changes.is_available ?? original.is_available,
        prep_minutes: changes.prep_minutes ?? original.prep_minutes ?? 0,
      };
    });

    bulkUpdate.mutate(updates, {
      onSuccess: () => {
        toast.success('Продукты успешно обновлены');
        setEditMode(false);
        setEditedData(new Map());
      },
      onError: () => {
        toast.error('Ошибка при обновлении продуктов');
      },
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setCroppedImage(null);
    setCroppedPreview(null);
    setIsEditDialogOpen(true);
  };

  const handleCropped = (file: File) => {
    setCroppedImage(file);
    const url = URL.createObjectURL(file);
    setCroppedPreview(url);
  };

  const handleUpdate = (data: any) => {
    if (!editingProduct?.id) return;

    const formData = new FormData();
    formData.append('name_uz', data.name_uz || '');
    formData.append('name_kaa', data.name_kaa || '');
    formData.append('name_en', data.name_en || '');
    formData.append('desc_uz', data.desc_uz || '');
    formData.append('desc_kaa', data.desc_kaa || '');
    formData.append('desc_en', data.desc_en || '');
    formData.append('is_available', data.is_available ? 'true' : 'false');
    if (data.prep_minutes) formData.append('prep_minutes', data.prep_minutes.toString());
    formData.append('order', data.order?.toString() || '0');

    if (croppedImage) {
      formData.append('image', croppedImage);
    } else if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }

    updateProduct.mutate(
      { formData, id: editingProduct.id },
      {
        onSuccess: () => {
          toast.success('Продукт успешно обновлен');
          setIsEditDialogOpen(false);
          setEditingProduct(null);
          setCroppedImage(null);
          if (croppedPreview) URL.revokeObjectURL(croppedPreview);
          setCroppedPreview(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении продукта');
        },
      }
    );
  };

  const formFields = [
    {
      name: 'name_ru',
      label: 'Название (RU)',
      type: 'text' as const,
      readOnly: true,
    },
    {
      name: 'name_uz',
      label: 'Название (UZ)',
      type: 'text' as const,
      placeholder: 'Введите название на узбекском',
    },
    {
      name: 'name_kaa',
      label: 'Название (KAA)',
      type: 'text' as const,
      placeholder: 'Введите название на каракалпакском',
    },
    {
      name: 'name_en',
      label: 'Название (EN)',
      type: 'text' as const,
      placeholder: 'Введите название на английском',
    },
    {
      name: 'desc_uz',
      label: 'Описание (UZ)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на узбекском',
    },
    {
      name: 'desc_kaa',
      label: 'Описание (KAA)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на каракалпакском',
    },
    {
      name: 'desc_en',
      label: 'Описание (EN)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на английском',
    },
    {
      name: 'is_available',
      label: 'Доступен',
      type: 'checkbox' as const,
    },
    {
      name: 'prep_minutes',
      label: 'Время приготовления (мин)',
      type: 'number' as const,
      placeholder: '10',
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number' as const,
      placeholder: '0',
    },
  ];

  const columns = createColumns(editMode, editedData, handleFieldChange);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Продукты</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setEditedData(new Map());
              }}>
                Отмена
              </Button>
              <Button onClick={handleBulkSave} disabled={editedData.size === 0 || bulkUpdate.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Редактировать таблицу
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={editMode}
        />
        <select
          className="p-2 border rounded bg-background text-foreground"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          disabled={editMode}
        >
          <option value="">Все категории</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_ru}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded bg-background text-foreground"
          value={isAvailableFilter}
          onChange={(e) => setIsAvailableFilter(e.target.value)}
          disabled={editMode}
        >
          <option value="">Все статусы</option>
          <option value="true">Доступные</option>
          <option value="false">Недоступные</option>
        </select>
      </div>

      <ResourceTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        onEdit={editMode ? undefined : handleEdit}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">Редактировать продукт</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ProductImageField
              existingImage={typeof editingProduct?.image === 'string' ? editingProduct.image : null}
              onCropped={handleCropped}
              croppedPreview={croppedPreview}
            />
            <div className="mt-6">
              <ResourceForm
                fields={formFields}
                onSubmit={handleUpdate}
                defaultValues={editingProduct || {}}
                isSubmitting={updateProduct.isPending}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
