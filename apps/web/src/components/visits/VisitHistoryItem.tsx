import type { ReactNode } from 'react';
import { formatDate, formatPrice } from '../../lib/format';
import type { Visit } from '../../lib/types';
import { Button } from '../ui/Button';
import { PhotoGallery } from './PhotoGallery';

type Props = {
  visit: Visit;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
};

export function VisitHistoryItem({ visit, editing, onEdit, onDelete, children }: Props) {
  return (
    <li className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{visit.design ?? 'デザイン未入力'}</p>
          <p className="mt-1 text-xs text-mauve">
            {formatDate(visit.visitedOn)} · {formatPrice(visit.price)}
          </p>
          {visit.menu && <p className="mt-1 text-sm text-mauve">メニュー: {visit.menu}</p>}
          {visit.note && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-mauve">{visit.note}</p>
          )}
        </div>
        {!editing && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onEdit}>
              編集
            </Button>
            <Button variant="ghost" className="px-2 py-1 text-xs text-plum" onClick={onDelete}>
              削除
            </Button>
          </div>
        )}
      </div>

      {children}

      {!editing && visit.photos.length > 0 && (
        <div className="mt-3">
          <PhotoGallery photos={visit.photos} />
        </div>
      )}
    </li>
  );
}
