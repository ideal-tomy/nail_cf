import { useEffect, useMemo, useState } from 'react';
import type { Visit, VisitInput } from '../../lib/types';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { PhotoGallery } from './PhotoGallery';

const MAX_PHOTOS = 5;

type Props = {
  initial?: Visit;
  submitLabel?: string;
  onSubmit: (input: VisitInput, photos: File[]) => Promise<void>;
  onCancel?: () => void;
};

export function VisitForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const existingPhotoCount = initial?.photos.length ?? 0;
  const maxNewPhotos = Math.max(0, MAX_PHOTOS - existingPhotoCount);

  const [visitedOn, setVisitedOn] = useState(initial?.visitedOn ?? today);
  const [design, setDesign] = useState(initial?.design ?? '');
  const [menu, setMenu] = useState(initial?.menu ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    setVisitedOn(initial.visitedOn);
    setDesign(initial.design ?? '');
    setMenu(initial.menu ?? '');
    setNote(initial.note ?? '');
    setPrice(initial.price != null ? String(initial.price) : '');
    setFiles([]);
    setPreviews([]);
  }, [initial]);

  const handleFiles = (list: FileList | null) => {
    if (!list || maxNewPhotos === 0) return;
    const next = [...files, ...Array.from(list)].slice(0, maxNewPhotos);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const parsedPrice = price.trim() ? Number(price) : null;
      if (parsedPrice != null && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
        throw new Error('金額は0以上の数値で入力してください');
      }

      await onSubmit(
        {
          visitedOn,
          design: design.trim() || undefined,
          menu: menu.trim() || undefined,
          note: note.trim() || undefined,
          price: parsedPrice,
        },
        files,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const photoHint =
    maxNewPhotos > 0
      ? `最大${MAX_PHOTOS}枚。あと${maxNewPhotos}枚追加できます。アップロード前に自動圧縮します`
      : `最大${MAX_PHOTOS}枚に達しています`;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="来店日 *">
        <input
          className={inputClass}
          type="date"
          value={visitedOn}
          onChange={(e) => setVisitedOn(e.target.value)}
          required
        />
      </Field>

      <Field label="デザイン">
        <input className={inputClass} value={design} onChange={(e) => setDesign(e.target.value)} />
      </Field>

      <Field label="メニュー">
        <input className={inputClass} value={menu} onChange={(e) => setMenu(e.target.value)} />
      </Field>

      <Field label="金額">
        <input
          className={inputClass}
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="7500"
        />
      </Field>

      <Field label="メモ">
        <textarea className={`${inputClass} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {initial && initial.photos.length > 0 && (
        <Field label="登録済みの写真">
          <PhotoGallery photos={initial.photos} />
        </Field>
      )}

      <Field label="完成写真" hint={photoHint}>
        <input
          className="block w-full text-sm text-mauve file:mr-3 file:rounded-lg file:border-0 file:bg-blush file:px-3 file:py-2 file:text-sm file:font-semibold file:text-plum disabled:opacity-50"
          type="file"
          accept="image/*"
          multiple
          disabled={maxNewPhotos === 0}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {previews.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {previews.map((src) => (
              <img key={src} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? '保存中…' : (submitLabel ?? '来店を保存')}
        </Button>
      </div>
    </form>
  );
}
