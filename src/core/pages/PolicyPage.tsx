import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useGetPolicy, useUpdatePolicy } from '../api/policy';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

export default function PolicyPage() {
  const editorRef = useRef<any>(null);
  const { data, isLoading } = useGetPolicy();
  const updatePolicy = useUpdatePolicy();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (data?.policy !== undefined) {
      setContent(data.policy);
    }
  }, [data]);

  const handleSave = () => {
    const value = editorRef.current ? editorRef.current.getContent() : content;
    updatePolicy.mutate(
      { policy: value },
      {
        onSuccess: () => toast.success('Политика успешно обновлена'),
        onError: () => toast.error('Ошибка при обновлении политики'),
      },
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Политика</h1>
        <Button onClick={handleSave} disabled={updatePolicy.isPending || isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-lg" />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Editor
            licenseKey="gpl"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue={content}
            init={{
              height: 600,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount',
              ],
              toolbar:
                'undo redo | blocks | bold italic underline forecolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image | removeformat | code | help',
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px }',
              skin: false,
              content_css: false,
              promotion: false,
              branding: false,
            }}
          />
        </div>
      )}
    </div>
  );
}
